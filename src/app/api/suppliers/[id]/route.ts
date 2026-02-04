import { logSecurityAction, SecurityAction } from '@/lib/audit';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/security';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update supplier
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = (session.user as any).tenantId;
    const body = await req.json();

    const supplier = await prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier || supplier.tenantId !== tenantId) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    // ISO 27001: Explicitly handle sensitive field encryption
    const updateData: any = { ...body };
    const sensitiveFields = ['phone', 'whatsapp', 'gstNumber', 'panNumber', 'bankName', 'accountNumber', 'ifscCode'];
    
    sensitiveFields.forEach(field => {
        if (updateData[field] !== undefined) {
            updateData[field] = updateData[field] ? encrypt(updateData[field]) : null;
        }
    });

    const updated = await prisma.supplier.update({
      where: { id },
      data: updateData
    });

    // ISO 27001: Audit log supplier update (redact sensitive field values)
    const changedFields = Object.keys(body);
    const sensitiveFieldsUpdated = sensitiveFields.filter(f => changedFields.includes(f));

    await logSecurityAction({
      tenantId,
      userId: (session.user as any).id,
      action: SecurityAction.SUPPLIER_UPDATED,
      resource: `Supplier:${id}`,
      details: {
        supplierName: supplier.name,
        changedFields: changedFields.filter(f => !sensitiveFields.includes(f)),
        sensitiveFieldsUpdated: sensitiveFieldsUpdated.length > 0
          ? sensitiveFieldsUpdated.map(f => `${f} [REDACTED]`)
          : []
      }
    });

    return NextResponse.json({
      message: 'Supplier updated successfully',
      supplier: updated
    });

  } catch (error: any) {
    console.error('SUPPLIER_PATCH_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Remove supplier
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const tenantId = (session.user as any).tenantId;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
            select: { products: true }
        }
      }
    });

    if (!supplier || supplier.tenantId !== tenantId) {
      return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    }

    // Check if supplier has products linked
    if (supplier._count.products > 0) {
        return NextResponse.json({
            message: 'Cannot delete supplier with linked products. Reassign products first.'
        }, { status: 400 });
    }

    await prisma.supplier.delete({
      where: { id }
    });

    // ISO 27001: Audit log supplier deletion
    await logSecurityAction({
      tenantId,
      userId: (session.user as any).id,
      action: SecurityAction.SUPPLIER_DELETED,
      resource: `Supplier:${id}`,
      details: {
        supplierName: supplier.name,
        deleteType: 'hard_delete'
      }
    });

    return NextResponse.json({ message: 'Supplier deleted successfully' });

  } catch (error: any) {
    console.error('SUPPLIER_DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
