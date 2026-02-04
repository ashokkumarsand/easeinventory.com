import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/suppliers/import - Bulk import suppliers from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const tenantId = sessionUser.tenantId;
    const role = sessionUser.role;

    // Only managers and above can import
    if (!['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!tenantId || tenantId === 'system') {
      return NextResponse.json(
        { error: 'Valid tenant context required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { suppliers } = body;

    if (!suppliers || !Array.isArray(suppliers)) {
      return NextResponse.json(
        { error: 'Suppliers array is required' },
        { status: 400 }
      );
    }

    if (suppliers.length > 500) {
      return NextResponse.json(
        { error: 'Maximum 500 suppliers per import' },
        { status: 400 }
      );
    }

    const results = { imported: 0, updated: 0, skipped: 0, errors: [] as string[] };

    for (const supplier of suppliers) {
      try {
        if (!supplier.name) {
          results.errors.push('Missing supplier name');
          results.skipped++;
          continue;
        }

        // Check for existing supplier by name or email
        const existing = await prisma.supplier.findFirst({
          where: {
            tenantId,
            OR: [
              { name: supplier.name },
              ...(supplier.email ? [{ email: supplier.email }] : []),
            ],
          },
        });

        // Prepare data with encrypted sensitive fields
        const data = {
          name: supplier.name,
          contactPerson: supplier.contactPerson || null,
          email: supplier.email || null,
          phone: supplier.phone ? encrypt(supplier.phone) : null,
          whatsapp: supplier.whatsapp ? encrypt(supplier.whatsapp) : null,
          address: supplier.address || null,
          city: supplier.city || null,
          state: supplier.state || null,
          pincode: supplier.pincode || null,
          gstNumber: supplier.gstNumber ? encrypt(supplier.gstNumber) : null,
          panNumber: supplier.panNumber ? encrypt(supplier.panNumber) : null,
          bankName: supplier.bankName ? encrypt(supplier.bankName) : null,
          accountNumber: supplier.accountNumber ? encrypt(supplier.accountNumber) : null,
          ifscCode: supplier.ifscCode ? encrypt(supplier.ifscCode) : null,
        };

        if (existing) {
          // Update existing supplier
          await prisma.supplier.update({
            where: { id: existing.id },
            data,
          });
          results.updated++;
        } else {
          // Create new supplier
          await prisma.supplier.create({
            data: {
              ...data,
              tenantId,
            },
          });
          results.imported++;
        }
      } catch (error: any) {
        results.errors.push(`Error importing ${supplier.name}: ${error.message}`);
        results.skipped++;
      }
    }

    // Audit log the bulk import
    await logSecurityAction({
      tenantId,
      userId: sessionUser.id,
      action: 'BULK_IMPORT',
      resource: 'Suppliers',
      details: {
        imported: results.imported,
        updated: results.updated,
        skipped: results.skipped,
        totalAttempted: suppliers.length,
      },
    });

    return NextResponse.json({
      success: true,
      ...results,
      message: `Imported ${results.imported} suppliers, updated ${results.updated}, skipped ${results.skipped}`,
    });
  } catch (error: any) {
    console.error('Supplier import error:', error);
    return NextResponse.json(
      { error: 'Failed to import suppliers', message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/suppliers/import - Get CSV template
export async function GET() {
  const template = `name,contactPerson,email,phone,whatsapp,address,city,state,pincode,gstNumber,panNumber,bankName,accountNumber,ifscCode
ABC Electronics,John Doe,john@abc.com,9876543210,9876543210,"123 Main St",Mumbai,Maharashtra,400001,27AABCS1429B1ZD,AABCS1429B,HDFC Bank,12345678901234,HDFC0001234
XYZ Supplies,Jane Smith,jane@xyz.com,8765432109,,"456 Market Rd",Delhi,Delhi,110001,07AABCX1234C1Z5,AABCX1234C,,,`;

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="supplier_import_template.csv"',
    },
  });
}
