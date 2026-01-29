import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// GET - Get onboarding status
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        settings: true,
        gstNumber: true,
        isActive: true,
      }
    });

    if (!tenant) {
      return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
    }

    const settings = tenant.settings as any || {};

    return NextResponse.json({
      tenantId: tenant.id,
      brandName: tenant.name,
      workspaceUrl: `${tenant.slug}.easeinventory.com`,
      logo: tenant.logo,
      logoInitials: settings.logoInitials || tenant.name.slice(0, 2).toUpperCase(),
      onboardingStatus: settings.onboardingStatus || 'PENDING',
      documentsUploaded: settings.documentsUploaded || false,
      gstVerified: !!tenant.gstNumber,
      isActive: tenant.isActive,
    });

  } catch (error: any) {
    console.error('ONBOARDING_STATUS_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Submit onboarding documents
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();
    const { 
      shopProofUrl,     // URL of uploaded shop/address proof
      idProofUrl,       // URL of uploaded owner ID proof
      gstNumber,        // Optional GST number
      businessLicense   // Optional business license
    } = body;

    if (!shopProofUrl || !idProofUrl) {
      return NextResponse.json(
        { message: 'Shop proof and ID proof are required' },
        { status: 400 }
      );
    }

    // Get current settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });

    const currentSettings = (tenant?.settings as any) || {};

    // Update tenant with document info
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        gstNumber: gstNumber ? encrypt(gstNumber) : null,
        settings: {
          ...currentSettings,
          onboardingStatus: 'UNDER_REVIEW',
          documentsUploaded: true,
          documents: {
            shopProofUrl,
            idProofUrl,
            businessLicense: businessLicense || null,
            uploadedAt: new Date().toISOString(),
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Documents submitted successfully. Your account is under review.',
      status: 'UNDER_REVIEW',
      nextStep: 'WAIT_FOR_VERIFICATION'
    });

  } catch (error: any) {
    console.error('ONBOARDING_SUBMIT_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
