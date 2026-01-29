import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all suppliers for tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
            select: { products: true }
        }
      }
    });

    // ISO 27001: Decrypt sensitive fields
    const decryptedSuppliers = suppliers.map(sup => {
        try {
            if (sup.phone && sup.phone.includes(':')) sup.phone = decrypt(sup.phone);
            if (sup.whatsapp && sup.whatsapp.includes(':')) sup.whatsapp = decrypt(sup.whatsapp);
            if (sup.gstNumber && sup.gstNumber.includes(':')) sup.gstNumber = decrypt(sup.gstNumber);
            if (sup.panNumber && sup.panNumber.includes(':')) sup.panNumber = decrypt(sup.panNumber);
            if (sup.bankName && sup.bankName.includes(':')) sup.bankName = decrypt(sup.bankName);
            if (sup.accountNumber && sup.accountNumber.includes(':')) sup.accountNumber = decrypt(sup.accountNumber);
            if (sup.ifscCode && sup.ifscCode.includes(':')) sup.ifscCode = decrypt(sup.ifscCode);
        } catch (e) {
            console.warn(`Decryption failed for supplier ${sup.id}`);
        }
        return sup;
    });

    return NextResponse.json({ suppliers: decryptedSuppliers });

  } catch (error: any) {
    console.error('SUPPLIERS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new supplier
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['OWNER', 'ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { 
        name, 
        contactPerson, 
        email, 
        phone, 
        whatsapp, 
        address, 
        city, 
        state, 
        pincode, 
        gstNumber, 
        panNumber,
        bankName,
        accountNumber,
        ifscCode
    } = body;

    if (!name) {
      return NextResponse.json({ message: 'Supplier name is required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        email,
        phone: phone ? encrypt(phone) : null,
        whatsapp: whatsapp ? encrypt(whatsapp) : null,
        address,
        city,
        state,
        pincode,
        gstNumber: gstNumber ? encrypt(gstNumber) : null,
        panNumber: panNumber ? encrypt(panNumber) : null,
        bankName: bankName ? encrypt(bankName) : null,
        accountNumber: accountNumber ? encrypt(accountNumber) : null,
        ifscCode: ifscCode ? encrypt(ifscCode) : null,
        tenantId
      }
    });

    return NextResponse.json({
      message: 'Supplier created successfully',
      supplier
    }, { status: 201 });

  } catch (error: any) {
    console.error('SUPPLIERS_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
