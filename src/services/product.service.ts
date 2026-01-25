import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateProductInput {
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  hsnCode?: string;
  costPrice: number;
  modalPrice: number;
  salePrice: number;
  discount?: number;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  images?: string[];
  gstRate?: number;
  categoryId?: string;
  brand?: string;
  supplierId?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  sku?: string;
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  hsnCode?: string;
  costPrice?: number;
  modalPrice?: number;
  salePrice?: number;
  discount?: number;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  images?: string[];
  gstRate?: number;
  categoryId?: string;
  brand?: string;
  supplierId?: string;
  isActive?: boolean;
}

export interface ProductFilter {
  tenantId: string;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  isActive?: boolean;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  /**
   * Create a new product
   */
  static async create(input: CreateProductInput) {
    // Check if serial number is unique (if provided)
    if (input.serialNumber) {
      const existing = await prisma.product.findUnique({
        where: { serialNumber: input.serialNumber },
      });
      if (existing) {
        throw new Error('Serial number already exists');
      }
    }

    // Check if slug is unique within tenant
    const existingSlug = await prisma.product.findFirst({
      where: {
        tenantId: input.tenantId,
        slug: input.slug,
      },
    });
    if (existingSlug) {
      throw new Error('Product with this slug already exists');
    }

    const product = await prisma.product.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        sku: input.sku,
        modelNumber: input.modelNumber,
        serialNumber: input.serialNumber,
        barcode: input.barcode,
        hsnCode: input.hsnCode,
        costPrice: new Prisma.Decimal(input.costPrice),
        modalPrice: new Prisma.Decimal(input.modalPrice),
        salePrice: new Prisma.Decimal(input.salePrice),
        discount: new Prisma.Decimal(input.discount || 0),
        quantity: input.quantity || 0,
        minStock: input.minStock || 0,
        maxStock: input.maxStock,
        unit: input.unit || 'pcs',
        images: input.images || [],
        gstRate: new Prisma.Decimal(input.gstRate || 18),
        categoryId: input.categoryId,
        brand: input.brand,
        supplierId: input.supplierId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  }

  /**
   * Get product by ID
   */
  static async getById(id: string, tenantId: string) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  }

  /**
   * Get product by serial number
   */
  static async getBySerialNumber(serialNumber: string) {
    const product = await prisma.product.findUnique({
      where: { serialNumber },
      include: {
        category: true,
        supplier: true,
        tenant: {
          select: { name: true, slug: true },
        },
      },
    });

    return product;
  }

  /**
   * List products with filtering and pagination
   */
  static async list(filter: ProductFilter, pagination: PaginationInput = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      tenantId: filter.tenantId,
      isActive: filter.isActive ?? true,
    };

    // Search filter
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
        { serialNumber: { contains: filter.search, mode: 'insensitive' } },
        { barcode: { contains: filter.search, mode: 'insensitive' } },
        { modelNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    // Supplier filter
    if (filter.supplierId) {
      where.supplierId = filter.supplierId;
    }

    // Brand filter
    if (filter.brand) {
      where.brand = filter.brand;
    }

    // Price filter
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.salePrice = {};
      if (filter.minPrice !== undefined) {
        where.salePrice.gte = new Prisma.Decimal(filter.minPrice);
      }
      if (filter.maxPrice !== undefined) {
        where.salePrice.lte = new Prisma.Decimal(filter.maxPrice);
      }
    }

    // Low stock filter
    if (filter.lowStock) {
      where.quantity = { lte: prisma.product.fields.minStock };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a product
   */
  static async update(id: string, tenantId: string, input: UpdateProductInput) {
    // Verify product belongs to tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new Error('Product not found');
    }

    // If updating serial number, check uniqueness
    if (input.serialNumber && input.serialNumber !== existing.serialNumber) {
      const duplicate = await prisma.product.findUnique({
        where: { serialNumber: input.serialNumber },
      });
      if (duplicate) {
        throw new Error('Serial number already exists');
      }
    }

    const updateData: Prisma.ProductUpdateInput = {};

    // Map numeric fields to Decimal
    if (input.costPrice !== undefined) updateData.costPrice = new Prisma.Decimal(input.costPrice);
    if (input.modalPrice !== undefined) updateData.modalPrice = new Prisma.Decimal(input.modalPrice);
    if (input.salePrice !== undefined) updateData.salePrice = new Prisma.Decimal(input.salePrice);
    if (input.discount !== undefined) updateData.discount = new Prisma.Decimal(input.discount);
    if (input.gstRate !== undefined) updateData.gstRate = new Prisma.Decimal(input.gstRate);

    // Map other fields
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.modelNumber !== undefined) updateData.modelNumber = input.modelNumber;
    if (input.serialNumber !== undefined) updateData.serialNumber = input.serialNumber;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.hsnCode !== undefined) updateData.hsnCode = input.hsnCode;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.minStock !== undefined) updateData.minStock = input.minStock;
    if (input.maxStock !== undefined) updateData.maxStock = input.maxStock;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    // Handle relations
    if (input.categoryId !== undefined) {
      updateData.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
    }
    if (input.supplierId !== undefined) {
      updateData.supplier = input.supplierId ? { connect: { id: input.supplierId } } : { disconnect: true };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        supplier: true,
      },
    });

    return product;
  }

  /**
   * Update stock quantity
   */
  static async updateStock(id: string, tenantId: string, quantity: number, userId: string, notes?: string) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const difference = quantity - product.quantity;
    const movementType = difference > 0 ? 'PURCHASE' : 'ADJUSTMENT';

    // Create stock movement record
    await prisma.stockMovement.create({
      data: {
        tenantId,
        productId: id,
        userId,
        type: movementType,
        quantity: Math.abs(difference),
        notes: notes || `Stock ${difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(difference)}`,
      },
    });

    // Update product quantity
    const updated = await prisma.product.update({
      where: { id },
      data: { quantity },
    });

    return updated;
  }

  /**
   * Get low stock products
   */
  static async getLowStock(tenantId: string) {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { lte: prisma.product.fields.minStock },
      },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { quantity: 'asc' },
    });

    return products;
  }

  /**
   * Delete a product (soft delete)
   */
  static async delete(id: string, tenantId: string) {
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }
}

export default ProductService;
