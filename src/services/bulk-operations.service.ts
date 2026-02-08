import prisma from '@/lib/prisma';

// ============================================================
// Types
// ============================================================

export type BulkOperationType =
  | 'PRICE_UPDATE'
  | 'INVENTORY_ADJUSTMENT'
  | 'CUSTOMER_IMPORT'
  | 'SUPPLIER_IMPORT';

export interface PreviewError {
  row: number;
  field: string;
  message: string;
}

export interface PreviewResult {
  valid: Record<string, string>[];
  errors: PreviewError[];
  summary: string;
}

export interface ApplyResult {
  processed: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

// ============================================================
// CSV Templates
// ============================================================

const TEMPLATES: Record<BulkOperationType, string> = {
  PRICE_UPDATE: 'sku,newCostPrice,newSalePrice',
  INVENTORY_ADJUSTMENT: 'sku,quantity,reason',
  CUSTOMER_IMPORT: 'name,email,phone,company,address,city,state,pincode',
  SUPPLIER_IMPORT: 'name,contactPerson,email,phone,gstNumber,address,city,state,pincode',
};

// ============================================================
// Service
// ============================================================

export class BulkOperationsService {
  /**
   * Parse a CSV string into an array of objects
   */
  static parseCSV(csvString: string): Record<string, string>[] {
    const lines = csvString
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * Get CSV template for a given operation type
   */
  static getTemplate(type: BulkOperationType): string {
    return TEMPLATES[type] || '';
  }

  /**
   * Validate and return preview of bulk operation
   */
  static async preview(
    type: BulkOperationType,
    data: Record<string, string>[],
    tenantId: string,
  ): Promise<PreviewResult> {
    switch (type) {
      case 'PRICE_UPDATE':
        return this.previewPriceUpdate(data, tenantId);
      case 'INVENTORY_ADJUSTMENT':
        return this.previewInventoryAdjustment(data, tenantId);
      case 'CUSTOMER_IMPORT':
        return this.previewCustomerImport(data, tenantId);
      case 'SUPPLIER_IMPORT':
        return this.previewSupplierImport(data, tenantId);
      default:
        return { valid: [], errors: [], summary: 'Unknown operation type' };
    }
  }

  /**
   * Apply validated bulk changes
   */
  static async apply(
    type: BulkOperationType,
    validData: Record<string, string>[],
    tenantId: string,
    userId: string,
  ): Promise<ApplyResult> {
    switch (type) {
      case 'PRICE_UPDATE':
        return this.applyPriceUpdate(validData, tenantId);
      case 'INVENTORY_ADJUSTMENT':
        return this.applyInventoryAdjustment(validData, tenantId, userId);
      case 'CUSTOMER_IMPORT':
        return this.applyCustomerImport(validData, tenantId);
      case 'SUPPLIER_IMPORT':
        return this.applySupplierImport(validData, tenantId);
      default:
        return { processed: 0, created: 0, updated: 0, failed: 0, errors: ['Unknown type'] };
    }
  }

  // ====================
  // PRICE UPDATE
  // ====================

  private static async previewPriceUpdate(
    data: Record<string, string>[],
    tenantId: string,
  ): Promise<PreviewResult> {
    const valid: Record<string, string>[] = [];
    const errors: PreviewError[] = [];

    // Fetch all products for this tenant
    const skus = data.map((r) => r.sku).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { tenantId, sku: { in: skus } },
      select: { id: true, sku: true, name: true, costPrice: true, salePrice: true },
    });
    const productMap = new Map(products.map((p) => [p.sku, p]));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.sku) {
        errors.push({ row: i + 1, field: 'sku', message: 'SKU is required' });
        continue;
      }

      const product = productMap.get(row.sku);
      if (!product) {
        errors.push({ row: i + 1, field: 'sku', message: `Product with SKU "${row.sku}" not found` });
        continue;
      }

      const newCostPrice = parseFloat(row.newCostPrice);
      const newSalePrice = parseFloat(row.newSalePrice);

      if (row.newCostPrice && isNaN(newCostPrice)) {
        errors.push({ row: i + 1, field: 'newCostPrice', message: 'Invalid cost price' });
        continue;
      }
      if (row.newSalePrice && isNaN(newSalePrice)) {
        errors.push({ row: i + 1, field: 'newSalePrice', message: 'Invalid sale price' });
        continue;
      }

      valid.push({
        ...row,
        productId: product.id,
        productName: product.name,
        oldCostPrice: product.costPrice.toString(),
        oldSalePrice: product.salePrice.toString(),
      });
    }

    return {
      valid,
      errors,
      summary: `${valid.length} products to update, ${errors.length} errors`,
    };
  }

  private static async applyPriceUpdate(
    validData: Record<string, string>[],
    tenantId: string,
  ): Promise<ApplyResult> {
    let updated = 0;
    let failed = 0;
    const errorMessages: string[] = [];

    for (const row of validData) {
      try {
        const updateData: Record<string, any> = {};
        if (row.newCostPrice) updateData.costPrice = parseFloat(row.newCostPrice);
        if (row.newSalePrice) updateData.salePrice = parseFloat(row.newSalePrice);

        if (Object.keys(updateData).length > 0) {
          await prisma.product.updateMany({
            where: { sku: row.sku, tenantId },
            data: updateData,
          });
          updated++;
        }
      } catch (error) {
        failed++;
        errorMessages.push(`SKU ${row.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      processed: validData.length,
      created: 0,
      updated,
      failed,
      errors: errorMessages,
    };
  }

  // ====================
  // INVENTORY ADJUSTMENT
  // ====================

  private static async previewInventoryAdjustment(
    data: Record<string, string>[],
    tenantId: string,
  ): Promise<PreviewResult> {
    const valid: Record<string, string>[] = [];
    const errors: PreviewError[] = [];

    const skus = data.map((r) => r.sku).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { tenantId, sku: { in: skus } },
      select: { id: true, sku: true, name: true, quantity: true },
    });
    const productMap = new Map(products.map((p) => [p.sku, p]));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.sku) {
        errors.push({ row: i + 1, field: 'sku', message: 'SKU is required' });
        continue;
      }

      const product = productMap.get(row.sku);
      if (!product) {
        errors.push({ row: i + 1, field: 'sku', message: `Product with SKU "${row.sku}" not found` });
        continue;
      }

      const quantity = parseInt(row.quantity, 10);
      if (isNaN(quantity)) {
        errors.push({ row: i + 1, field: 'quantity', message: 'Invalid quantity' });
        continue;
      }

      if (!row.reason) {
        errors.push({ row: i + 1, field: 'reason', message: 'Reason is required' });
        continue;
      }

      valid.push({
        ...row,
        productId: product.id,
        productName: product.name,
        currentQuantity: product.quantity.toString(),
      });
    }

    return {
      valid,
      errors,
      summary: `${valid.length} adjustments to apply, ${errors.length} errors`,
    };
  }

  private static async applyInventoryAdjustment(
    validData: Record<string, string>[],
    tenantId: string,
    userId: string,
  ): Promise<ApplyResult> {
    let updated = 0;
    let failed = 0;
    const errorMessages: string[] = [];

    for (const row of validData) {
      try {
        const qty = parseInt(row.quantity, 10);
        const productId = row.productId;

        await prisma.$transaction([
          prisma.product.update({
            where: { id: productId },
            data: { quantity: { increment: qty } },
          }),
          prisma.stockMovement.create({
            data: {
              type: 'ADJUSTMENT',
              quantity: qty,
              productId,
              userId,
              tenantId,
              notes: row.reason,
            },
          }),
        ]);

        updated++;
      } catch (error) {
        failed++;
        errorMessages.push(`SKU ${row.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      processed: validData.length,
      created: 0,
      updated,
      failed,
      errors: errorMessages,
    };
  }

  // ====================
  // CUSTOMER IMPORT
  // ====================

  private static async previewCustomerImport(
    data: Record<string, string>[],
    tenantId: string,
  ): Promise<PreviewResult> {
    const valid: Record<string, string>[] = [];
    const errors: PreviewError[] = [];

    // Collect emails for duplicate check
    const emails = data.map((r) => r.email).filter(Boolean);
    const existingCustomers = await prisma.customer.findMany({
      where: { tenantId, email: { in: emails } },
      select: { email: true },
    });
    const existingEmails = new Set(existingCustomers.map((c) => c.email));

    const seenEmails = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.name) {
        errors.push({ row: i + 1, field: 'name', message: 'Name is required' });
        continue;
      }

      // Validate email format if provided
      if (row.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({ row: i + 1, field: 'email', message: 'Invalid email format' });
          continue;
        }
        if (existingEmails.has(row.email)) {
          errors.push({ row: i + 1, field: 'email', message: `Customer with email "${row.email}" already exists` });
          continue;
        }
        if (seenEmails.has(row.email)) {
          errors.push({ row: i + 1, field: 'email', message: 'Duplicate email in CSV' });
          continue;
        }
        seenEmails.add(row.email);
      }

      valid.push(row);
    }

    return {
      valid,
      errors,
      summary: `${valid.length} customers to import, ${errors.length} errors`,
    };
  }

  private static async applyCustomerImport(
    validData: Record<string, string>[],
    tenantId: string,
  ): Promise<ApplyResult> {
    let created = 0;
    let failed = 0;
    const errorMessages: string[] = [];

    for (const row of validData) {
      try {
        await prisma.customer.create({
          data: {
            name: row.name,
            email: row.email || null,
            phone: row.phone || null,
            companyName: row.company || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            tenantId,
          },
        });
        created++;
      } catch (error) {
        failed++;
        errorMessages.push(`${row.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      processed: validData.length,
      created,
      updated: 0,
      failed,
      errors: errorMessages,
    };
  }

  // ====================
  // SUPPLIER IMPORT
  // ====================

  private static async previewSupplierImport(
    data: Record<string, string>[],
    tenantId: string,
  ): Promise<PreviewResult> {
    const valid: Record<string, string>[] = [];
    const errors: PreviewError[] = [];

    // Check for duplicate GST numbers
    const gstNumbers = data.map((r) => r.gstNumber).filter(Boolean);
    const existingSuppliers = await prisma.supplier.findMany({
      where: { tenantId, gstNumber: { in: gstNumbers } },
      select: { gstNumber: true },
    });
    const existingGst = new Set(existingSuppliers.map((s) => s.gstNumber));

    const seenGst = new Set<string>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.name) {
        errors.push({ row: i + 1, field: 'name', message: 'Name is required' });
        continue;
      }

      // Validate GST number if provided (15-character alphanumeric)
      if (row.gstNumber) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(row.gstNumber)) {
          errors.push({ row: i + 1, field: 'gstNumber', message: 'Invalid GST number format' });
          continue;
        }
        if (existingGst.has(row.gstNumber)) {
          errors.push({ row: i + 1, field: 'gstNumber', message: `Supplier with GST "${row.gstNumber}" already exists` });
          continue;
        }
        if (seenGst.has(row.gstNumber)) {
          errors.push({ row: i + 1, field: 'gstNumber', message: 'Duplicate GST number in CSV' });
          continue;
        }
        seenGst.add(row.gstNumber);
      }

      // Validate email if provided
      if (row.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push({ row: i + 1, field: 'email', message: 'Invalid email format' });
          continue;
        }
      }

      valid.push(row);
    }

    return {
      valid,
      errors,
      summary: `${valid.length} suppliers to import, ${errors.length} errors`,
    };
  }

  private static async applySupplierImport(
    validData: Record<string, string>[],
    tenantId: string,
  ): Promise<ApplyResult> {
    let created = 0;
    let failed = 0;
    const errorMessages: string[] = [];

    for (const row of validData) {
      try {
        await prisma.supplier.create({
          data: {
            name: row.name,
            contactPerson: row.contactPerson || null,
            email: row.email || null,
            phone: row.phone || null,
            gstNumber: row.gstNumber || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            pincode: row.pincode || null,
            tenantId,
          },
        });
        created++;
      } catch (error) {
        failed++;
        errorMessages.push(`${row.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      processed: validData.length,
      created,
      updated: 0,
      failed,
      errors: errorMessages,
    };
  }
}
