import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityAction } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate a unique verification token for DNS verification
 */
function generateVerificationToken(): string {
  return `easeinv-verify-${crypto.randomBytes(16).toString('hex')}`;
}

// GET /api/domains - Get domain settings for tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        slug: true,
        customDomain: true,
        domainVerificationToken: true,
        domainVerified: true,
        domainVerifiedAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';

    return NextResponse.json({
      domain: {
        subdomain: tenant.slug ? `${tenant.slug}.${rootDomain}` : null,
        customDomain: tenant.customDomain,
        verificationToken: tenant.domainVerificationToken,
        verified: tenant.domainVerified,
        verifiedAt: tenant.domainVerifiedAt,
        // DNS instructions
        dnsInstructions: tenant.customDomain && !tenant.domainVerified ? {
          type: 'CNAME',
          name: tenant.customDomain,
          value: `cname.${rootDomain}`,
          txtRecord: {
            name: `_easeinventory-verify.${tenant.customDomain}`,
            value: tenant.domainVerificationToken,
          },
        } : null,
      },
    });
  } catch (error) {
    console.error('Get domain settings error:', error);
    return NextResponse.json({ message: 'Failed to get domain settings' }, { status: 500 });
  }
}

// POST /api/domains - Set custom domain
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

    // Only OWNER can set custom domain
    if (!['OWNER', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { customDomain } = body;

    if (!customDomain) {
      return NextResponse.json({ message: 'Custom domain is required' }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json({ message: 'Invalid domain format' }, { status: 400 });
    }

    // Check if domain is already in use by another tenant
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        customDomain,
        id: { not: tenantId },
      },
    });

    if (existingTenant) {
      return NextResponse.json({ message: 'This domain is already in use' }, { status: 400 });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain,
        domainVerificationToken: verificationToken,
        domainVerified: false,
        domainVerifiedAt: null,
      },
      select: {
        customDomain: true,
        domainVerificationToken: true,
        domainVerified: true,
      },
    });

    await logSecurityAction({
      tenantId,
      userId,
      action: 'CUSTOM_DOMAIN_SET',
      resource: customDomain,
      details: { domain: customDomain },
    });

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'easeinventory.com';

    return NextResponse.json({
      message: 'Custom domain set. Please add the DNS records to verify ownership.',
      domain: {
        customDomain: tenant.customDomain,
        verificationToken: tenant.domainVerificationToken,
        verified: tenant.domainVerified,
        dnsInstructions: {
          type: 'CNAME',
          name: customDomain,
          value: `cname.${rootDomain}`,
          txtRecord: {
            name: `_easeinventory-verify.${customDomain}`,
            value: verificationToken,
          },
        },
      },
    });
  } catch (error) {
    console.error('Set custom domain error:', error);
    return NextResponse.json({ message: 'Failed to set custom domain' }, { status: 500 });
  }
}

// DELETE /api/domains - Remove custom domain
export async function DELETE(request: NextRequest) {
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
      select: { customDomain: true },
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        customDomain: null,
        domainVerificationToken: null,
        domainVerified: false,
        domainVerifiedAt: null,
      },
    });

    await logSecurityAction({
      tenantId,
      userId,
      action: 'CUSTOM_DOMAIN_REMOVED',
      resource: tenant?.customDomain || 'unknown',
      details: { domain: tenant?.customDomain },
    });

    return NextResponse.json({ message: 'Custom domain removed successfully' });
  } catch (error) {
    console.error('Remove custom domain error:', error);
    return NextResponse.json({ message: 'Failed to remove custom domain' }, { status: 500 });
  }
}
