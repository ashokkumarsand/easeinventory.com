import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

interface VerificationResult {
  txtVerified: boolean;
  cnameVerified: boolean;
  txtRecords?: string[];
  cnameRecords?: string[];
  errors?: string[];
}

/**
 * Verify DNS records for a custom domain
 */
async function verifyDnsRecords(
  customDomain: string,
  verificationToken: string,
  expectedCname: string
): Promise<VerificationResult> {
  const result: VerificationResult = {
    txtVerified: false,
    cnameVerified: false,
    errors: [],
  };

  // Check TXT record
  try {
    const txtRecords = await resolveTxt(`_easeinventory-verify.${customDomain}`);
    result.txtRecords = txtRecords.flat();

    if (result.txtRecords.some(record => record.includes(verificationToken))) {
      result.txtVerified = true;
    } else {
      result.errors!.push('TXT record found but verification token does not match');
    }
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      result.errors!.push('TXT record not found. Please add the verification TXT record.');
    } else {
      result.errors!.push(`TXT lookup failed: ${error.message}`);
    }
  }

  // Check CNAME record
  try {
    const cnameRecords = await resolveCname(customDomain);
    result.cnameRecords = cnameRecords;

    if (cnameRecords.some(record => record.toLowerCase() === expectedCname.toLowerCase())) {
      result.cnameVerified = true;
    } else {
      result.errors!.push(`CNAME record found but points to ${cnameRecords[0]} instead of ${expectedCname}`);
    }
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      result.errors!.push('CNAME record not found. Please add the CNAME record pointing to our servers.');
    } else {
      result.errors!.push(`CNAME lookup failed: ${error.message}`);
    }
  }

  return result;
}

// POST /api/domains/verify - Verify DNS records
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['OWNER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        customDomain: true,
        domainVerificationToken: true,
        domainVerified: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    if (!tenant.customDomain) {
      return NextResponse.json({ message: 'No custom domain set' }, { status: 400 });
    }

    if (tenant.domainVerified) {
      return NextResponse.json({
        message: 'Domain is already verified',
        verified: true,
      });
    }

    if (!tenant.domainVerificationToken) {
      return NextResponse.json({ message: 'No verification token found' }, { status: 400 });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';
    const expectedCname = `cname.${rootDomain}`;

    // Verify DNS records
    const verificationResult = await verifyDnsRecords(
      tenant.customDomain,
      tenant.domainVerificationToken,
      expectedCname
    );

    // Domain is verified if TXT record matches (CNAME is optional for initial verification)
    const isVerified = verificationResult.txtVerified;

    if (isVerified) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          domainVerified: true,
          domainVerifiedAt: new Date(),
        },
      });

      await logSecurityAction({
        tenantId,
        userId,
        action: 'CUSTOM_DOMAIN_VERIFIED',
        resource: tenant.customDomain,
        details: {
          domain: tenant.customDomain,
          txtVerified: verificationResult.txtVerified,
          cnameVerified: verificationResult.cnameVerified,
        },
      });

      return NextResponse.json({
        message: 'Domain verified successfully!',
        verified: true,
        verificationResult,
      });
    }

    return NextResponse.json({
      message: 'Domain verification failed',
      verified: false,
      verificationResult,
      instructions: {
        txt: {
          name: `_easeinventory-verify.${tenant.customDomain}`,
          value: tenant.domainVerificationToken,
          status: verificationResult.txtVerified ? 'verified' : 'pending',
        },
        cname: {
          name: tenant.customDomain,
          value: expectedCname,
          status: verificationResult.cnameVerified ? 'verified' : 'pending',
        },
      },
    });
  } catch (error) {
    console.error('Verify domain error:', error);
    return NextResponse.json({ message: 'Failed to verify domain' }, { status: 500 });
  }
}
