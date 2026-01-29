import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import dns from 'dns';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';

const resolveCname = promisify(dns.resolveCname);

// POST - Verify DNS for custom domain
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    // Only owners can verify domains
    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can configure domains' }, { status: 403 });
    }

    const body = await req.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ message: 'Domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)+$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ message: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain is already used by another tenant
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        customDomain: domain,
        id: { not: tenantId }
      }
    });

    if (existingTenant) {
      return NextResponse.json(
        { message: 'This domain is already registered to another account' },
        { status: 400 }
      );
    }

    // Perform DNS verification
    let dnsStatus = 'PENDING';
    let dnsRecords: string[] = [];
    let verificationMessage = '';

    try {
      // Attempt to resolve CNAME record
      const cnameRecords = await resolveCname(domain);
      dnsRecords = cnameRecords;

      // Check if CNAME points to our domain
      const expectedCname = 'cname.easeinventory.com';
      const isValid = cnameRecords.some(record => 
        record.toLowerCase() === expectedCname.toLowerCase() ||
        record.toLowerCase().endsWith('.easeinventory.com')
      );

      if (isValid) {
        dnsStatus = 'VERIFIED';
        verificationMessage = `DNS verified. CNAME points to ${cnameRecords[0]}`;
        
        // Update tenant with custom domain
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { customDomain: domain }
        });
      } else {
        dnsStatus = 'INVALID';
        verificationMessage = `CNAME points to ${cnameRecords[0]}, expected ${expectedCname}`;
      }

    } catch (dnsError: any) {
      if (dnsError.code === 'ENODATA' || dnsError.code === 'ENOTFOUND') {
        dnsStatus = 'NOT_FOUND';
        verificationMessage = 'No CNAME record found. Please add the DNS record and try again.';
      } else {
        dnsStatus = 'ERROR';
        verificationMessage = 'Unable to verify DNS. Please try again later.';
      }
    }

    return NextResponse.json({
      domain,
      status: dnsStatus,
      message: verificationMessage,
      records: dnsRecords,
      instructions: {
        type: 'CNAME',
        host: getDomainPrefix(domain),
        value: 'cname.easeinventory.com',
        ttl: 3600
      }
    });

  } catch (error: any) {
    console.error('DNS_VERIFY_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// Helper to extract subdomain prefix
function getDomainPrefix(domain: string): string {
  const parts = domain.split('.');
  if (parts.length > 2) {
    return parts.slice(0, -2).join('.');
  }
  return '@';
}

// GET - Check current domain status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        customDomain: true,
        slug: true,
        name: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    let verificationStatus = 'NOT_CONFIGURED';
    
    if (tenant.customDomain) {
      // Re-check DNS status
      try {
        const cnameRecords = await resolveCname(tenant.customDomain);
        const isValid = cnameRecords.some(record => 
          record.toLowerCase().endsWith('.easeinventory.com')
        );
        verificationStatus = isValid ? 'VERIFIED' : 'INVALID';
      } catch {
        verificationStatus = 'DNS_ERROR';
      }
    }

    return NextResponse.json({
      tenant: {
        ...tenant,
        defaultDomain: `${tenant.slug}.easeinventory.com`
      },
      verificationStatus
    });

  } catch (error: any) {
    console.error('DNS_STATUS_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Remove custom domain
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can remove domains' }, { status: 403 });
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { customDomain: null }
    });

    return NextResponse.json({ message: 'Custom domain removed' });

  } catch (error: any) {
    console.error('DNS_DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
