import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { users: true, products: true, customers: true }
        }
      }
    });

    if (tenant) {
      // ISO 27001: Decrypt sensitive fields for the UI/Business
      try {
        if (tenant.upiId && tenant.upiId.includes(':')) tenant.upiId = decrypt(tenant.upiId);
        if (tenant.bankName && tenant.bankName.includes(':')) tenant.bankName = decrypt(tenant.bankName);
        if (tenant.accountNumber && tenant.accountNumber.includes(':')) tenant.accountNumber = decrypt(tenant.accountNumber);
        if (tenant.ifscCode && tenant.ifscCode.includes(':')) tenant.ifscCode = decrypt(tenant.ifscCode);
        if (tenant.gstNumber && tenant.gstNumber.includes(':')) tenant.gstNumber = decrypt(tenant.gstNumber);
        if (tenant.phone && tenant.phone.includes(':')) tenant.phone = decrypt(tenant.phone);
      } catch (e) {
        console.warn('Decryption failed for some fields. Possible plain text or key mismatch.');
      }
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    const body = await req.json();
    
    // Whitelist updateable fields
    const {
        name,
        businessType,
        gstNumber,
        address,
        city,
        state,
        pincode,
        country,
        phone,
        email,
        website,
        currency,
        allowedCurrencies,
        upiId,
        bankName,
        accountNumber,
        ifscCode
    } = body;

    // ISO 27001: Encrypt sensitive data before storage
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        businessType,
        gstNumber: gstNumber ? encrypt(gstNumber) : null,
        address,
        city,
        state,
        pincode,
        country,
        phone: phone ? encrypt(phone) : null,
        email,
        website,
        currency,
        // Save allowed currencies, ensuring default is always included
        allowedCurrencies: allowedCurrencies && Array.isArray(allowedCurrencies)
          ? (allowedCurrencies.includes(currency) ? allowedCurrencies : [...allowedCurrencies, currency])
          : (currency ? [currency] : ['INR']),
        upiId: upiId ? encrypt(upiId) : null,
        bankName: bankName ? encrypt(bankName) : null,
        accountNumber: accountNumber ? encrypt(accountNumber) : null,
        ifscCode: ifscCode ? encrypt(ifscCode) : null
      }
    });

    // ISO 27001 Audit: Log the sensitive update
    await logSecurityAction({
      tenantId,
      userId,
      action: SecurityAction.SENSITIVE_DATA_UPDATE,
      resource: 'TenantSettings',
      details: { 
        fieldsUpdated: ['gstNumber', 'phone', 'upiId', 'bankName', 'accountNumber', 'ifscCode'].filter(f => body[f] !== undefined)
      }
    });

    return NextResponse.json({ tenant: updatedTenant });
  } catch (error) {
    console.error('Update tenant error:', error);
    return NextResponse.json({ message: 'Error updating business settings' }, { status: 500 });
  }
}
