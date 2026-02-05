import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Generate initials from brand name for logo fallback
function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Validate workspace slug (URL-safe)
function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length >= 3 && slug.length <= 30;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      brandName,      // Required: Display name for the business
      ownerName,      // Required: Primary contact person
      email,          // Required: For login and notifications
      password,       // Required
      phone,          // Required: For OTP and WhatsApp
      workspaceName,  // Optional: URL slug (subdomain)
      logo,
      businessType,
      gstin,
      currency,       // Default currency code (e.g., 'INR', 'USD')
      selectedPlan,
      billingCycle
    } = body;

    // Validation
    if (!brandName || !ownerName || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Missing required fields', required: ['brandName', 'ownerName', 'email', 'password', 'phone'] },
        { status: 400 }
      );
    }

    const slug = workspaceName ? workspaceName.toLowerCase().trim() : null;
    
    if (slug && !isValidSlug(slug)) {
      return NextResponse.json(
        { message: 'Invalid workspace name. Use 3-30 lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      );
    }

    // Validate GSTIN format if provided
    if (gstin) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.toUpperCase())) {
        return NextResponse.json(
          { message: 'Invalid GSTIN format. Please check and try again.' },
          { status: 400 }
        );
      }
    }

    // Check if workspace already exists
    if (slug) {
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug }
      });

      if (existingTenant) {
        return NextResponse.json(
          { message: 'Workspace name already taken. Please choose another.' },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check phone uniqueness
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingPhone) {
      return NextResponse.json(
        { message: 'An account with this phone number already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate logo initials if no logo provided
    const logoInitials = generateInitials(brandName);

    // Determine initial plan based on selection
    const planMap: Record<string, 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE'> = {
      'starter': 'STARTER',
      'business': 'BUSINESS',
      'professional': 'ENTERPRISE',
    };
    const initialPlan = selectedPlan ? (planMap[selectedPlan] || 'FREE') : 'FREE';

    // Atomic transaction to create Tenant and User
    const result = await prisma.$transaction(async (tx) => {
      // Default currency for tenant
      const tenantCurrency = currency || 'INR';

      const tenant = await tx.tenant.create({
        data: {
          name: brandName,
          slug: slug,
          logo: logo || null,
          businessType: (businessType as any) || 'SHOP',
          email: email,
          phone: phone ? encrypt(phone) : null,
          gstNumber: gstin ? encrypt(gstin) : null,
          currency: tenantCurrency,
          // Initialize allowed currencies with just the default currency
          // Tenant can add more in settings later
          allowedCurrencies: [tenantCurrency],
          plan: initialPlan,
          settings: {
            logoInitials: logoInitials,
            onboardingStatus: 'PENDING',
            documentsUploaded: false,
            selectedPlan: selectedPlan || 'starter',
            billingCycle: billingCycle || 'monthly',
            paymentPending: selectedPlan && selectedPlan !== 'starter',
          }
        }
      });

      const user = await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
          phone: phone ? encrypt(phone) : null,
          tenantId: tenant.id,
          role: 'OWNER',
        }
      });

      return { tenant, user };
    });

    return NextResponse.json(
      { 
        message: 'Account created successfully! Please complete your KYC verification.',
        tenantId: result.tenant.id,
        userId: result.user.id,
        workspaceUrl: slug ? `${slug}.easeinventory.com` : `easeinventory.com/c/${result.tenant.id}`,
        logoInitials: logoInitials,
        nextStep: 'UPLOAD_DOCUMENTS'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('REGISTRATION_ERROR:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
