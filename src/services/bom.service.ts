import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import { Decimal } from '@prisma/client/runtime/library';

interface BOMItemInput {
  componentProductId: string;
  quantity: number;
  wastagePercent?: number;
  notes?: string;
}

interface CreateBOMInput {
  productId: string;
  name?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE';
  items: BOMItemInput[];
}

interface UpdateBOMInput {
  name?: string;
  description?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  items?: BOMItemInput[];
}

interface CreateAssemblyOrderInput {
  bomId: string;
  type?: 'ASSEMBLY' | 'DISASSEMBLY';
  quantity: number;
  locationId?: string;
  notes?: string;
}

interface AvailabilityResult {
  componentProductId: string;
  productName: string;
  sku: string | null;
  requiredQty: number;
  availableQty: number;
  shortfall: number;
  sufficient: boolean;
}

export class BOMService {
  static async createBOM(input: CreateBOMInput, tenantId: string) {
    // Validate finished product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id: input.productId, tenantId },
    });
    if (!product) throw new Error('Product not found');

    // Validate all component products and check for self-reference
    for (const item of input.items) {
      if (item.componentProductId === input.productId) {
        throw new Error('A product cannot be a component of itself');
      }
      const comp = await prisma.product.findFirst({
        where: { id: item.componentProductId, tenantId },
      });
      if (!comp) throw new Error(`Component product ${item.componentProductId} not found`);
    }

    if (input.items.length === 0) {
      throw new Error('BOM must have at least one component');
    }

    // Get next version for this product
    const latestBom = await prisma.billOfMaterial.findFirst({
      where: { productId: input.productId, tenantId },
      orderBy: { version: 'desc' },
    });
    const version = (latestBom?.version ?? 0) + 1;

    const bomNumber = await generateNumber('BOM', tenantId);

    return prisma.billOfMaterial.create({
      data: {
        bomNumber,
        productId: input.productId,
        version,
        name: input.name,
        description: input.description,
        status: input.status || 'DRAFT',
        tenantId,
        items: {
          create: input.items.map((item) => ({
            componentProductId: item.componentProductId,
            quantity: item.quantity,
            wastagePercent: item.wastagePercent || 0,
            notes: item.notes,
          })),
        },
      },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true, costPrice: true } },
        items: {
          include: {
            componentProduct: { select: { id: true, name: true, sku: true, unit: true, costPrice: true, quantity: true } },
          },
        },
      },
    });
  }

  static async updateBOM(bomId: string, tenantId: string, input: UpdateBOMInput) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id: bomId, tenantId },
    });
    if (!bom) throw new Error('BOM not found');
    if (bom.status === 'ARCHIVED') throw new Error('Cannot edit archived BOM');

    return prisma.$transaction(async (tx) => {
      // If items provided, delete old and create new
      if (input.items) {
        if (input.items.length === 0) {
          throw new Error('BOM must have at least one component');
        }
        for (const item of input.items) {
          if (item.componentProductId === bom.productId) {
            throw new Error('A product cannot be a component of itself');
          }
        }

        await tx.bOMItem.deleteMany({ where: { bomId } });
        for (const item of input.items) {
          await tx.bOMItem.create({
            data: {
              bomId,
              componentProductId: item.componentProductId,
              quantity: item.quantity,
              wastagePercent: item.wastagePercent || 0,
              notes: item.notes,
            },
          });
        }
      }

      return tx.billOfMaterial.update({
        where: { id: bomId },
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
        },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true, costPrice: true } },
          items: {
            include: {
              componentProduct: { select: { id: true, name: true, sku: true, unit: true, costPrice: true, quantity: true } },
            },
          },
        },
      });
    });
  }

  static async getBOM(bomId: string, tenantId: string) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id: bomId, tenantId },
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true, costPrice: true, quantity: true } },
        items: {
          include: {
            componentProduct: { select: { id: true, name: true, sku: true, unit: true, costPrice: true, quantity: true } },
          },
        },
        assemblyOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            assemblyNumber: true,
            type: true,
            quantity: true,
            status: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
    });
    if (!bom) throw new Error('BOM not found');
    return bom;
  }

  static async listBOMs(
    tenantId: string,
    filter?: { search?: string; status?: string },
    page = 1,
    pageSize = 20,
  ) {
    const where: any = { tenantId };
    if (filter?.status && filter.status !== 'ALL') {
      where.status = filter.status;
    }
    if (filter?.search) {
      where.OR = [
        { bomNumber: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
        { product: { name: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.billOfMaterial.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, costPrice: true } },
          items: {
            include: {
              componentProduct: { select: { id: true, name: true, costPrice: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.billOfMaterial.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async archiveBOM(bomId: string, tenantId: string) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id: bomId, tenantId },
    });
    if (!bom) throw new Error('BOM not found');

    // Check for in-progress assembly orders
    const activeOrders = await prisma.assemblyOrder.count({
      where: { bomId, status: 'IN_PROGRESS' },
    });
    if (activeOrders > 0) {
      throw new Error('Cannot archive BOM with in-progress assembly orders');
    }

    return prisma.billOfMaterial.update({
      where: { id: bomId },
      data: { status: 'ARCHIVED', isActive: false },
    });
  }

  static async checkAvailability(
    bomId: string,
    qty: number,
    tenantId: string,
    locationId?: string,
  ) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id: bomId, tenantId },
      include: {
        items: {
          include: {
            componentProduct: {
              select: { id: true, name: true, sku: true, quantity: true, stockAtLocations: locationId ? {
                where: { locationId },
              } : false },
            },
          },
        },
      },
    });
    if (!bom) throw new Error('BOM not found');

    const results: AvailabilityResult[] = [];
    let canAssemble = true;

    for (const item of bom.items) {
      const requiredQty = Number(item.quantity) * qty * (1 + Number(item.wastagePercent) / 100);
      const availableQty = locationId
        ? ((item.componentProduct as any).stockAtLocations?.[0]?.quantity ?? 0)
        : item.componentProduct.quantity;
      const shortfall = Math.max(0, requiredQty - availableQty);
      const sufficient = shortfall === 0;
      if (!sufficient) canAssemble = false;

      results.push({
        componentProductId: item.componentProduct.id,
        productName: item.componentProduct.name,
        sku: item.componentProduct.sku,
        requiredQty: Math.ceil(requiredQty),
        availableQty,
        shortfall: Math.ceil(shortfall),
        sufficient,
      });
    }

    return { canAssemble, components: results };
  }

  static async createAssemblyOrder(input: CreateAssemblyOrderInput, tenantId: string, userId: string) {
    const bom = await prisma.billOfMaterial.findFirst({
      where: { id: input.bomId, tenantId },
    });
    if (!bom) throw new Error('BOM not found');
    if (bom.status !== 'ACTIVE') throw new Error('BOM must be ACTIVE to create assembly orders');

    const assemblyNumber = await generateNumber('ASM', tenantId);

    return prisma.assemblyOrder.create({
      data: {
        assemblyNumber,
        bomId: input.bomId,
        type: input.type || 'ASSEMBLY',
        quantity: input.quantity,
        locationId: input.locationId,
        notes: input.notes,
        createdById: userId,
        tenantId,
      },
      include: {
        bom: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });
  }

  static async completeAssembly(orderId: string, tenantId: string, userId: string) {
    const order = await prisma.assemblyOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        bom: {
          include: {
            product: true,
            items: { include: { componentProduct: true } },
          },
        },
      },
    });
    if (!order) throw new Error('Assembly order not found');
    if (order.status === 'COMPLETED') throw new Error('Order already completed');
    if (order.status === 'CANCELLED') throw new Error('Cannot complete cancelled order');

    const isAssembly = order.type === 'ASSEMBLY';

    await prisma.$transaction(async (tx) => {
      for (const item of order.bom.items) {
        const requiredQty = Math.ceil(
          Number(item.quantity) * order.quantity * (1 + Number(item.wastagePercent) / 100)
        );

        if (isAssembly) {
          // ASSEMBLY: consume components
          await tx.product.update({
            where: { id: item.componentProductId },
            data: { quantity: { decrement: requiredQty } },
          });

          // Create stock movement for consumption
          await tx.stockMovement.create({
            data: {
              productId: item.componentProductId,
              type: 'ASSEMBLY_CONSUME',
              quantity: -requiredQty,
              reason: `Assembly ${order.assemblyNumber}: consumed for ${order.bom.product.name}`,
              tenantId,
            },
          });

          // Update stock at location if specified
          if (order.locationId) {
            const existing = await tx.stockAtLocation.findFirst({
              where: { productId: item.componentProductId, locationId: order.locationId },
            });
            if (existing) {
              await tx.stockAtLocation.update({
                where: { id: existing.id },
                data: { quantity: { decrement: requiredQty } },
              });
            }
          }
        } else {
          // DISASSEMBLY: produce components
          await tx.product.update({
            where: { id: item.componentProductId },
            data: { quantity: { increment: requiredQty } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.componentProductId,
              type: 'ASSEMBLY_PRODUCE',
              quantity: requiredQty,
              reason: `Disassembly ${order.assemblyNumber}: recovered from ${order.bom.product.name}`,
              tenantId,
            },
          });

          if (order.locationId) {
            const existing = await tx.stockAtLocation.findFirst({
              where: { productId: item.componentProductId, locationId: order.locationId },
            });
            if (existing) {
              await tx.stockAtLocation.update({
                where: { id: existing.id },
                data: { quantity: { increment: requiredQty } },
              });
            } else {
              await tx.stockAtLocation.create({
                data: {
                  productId: item.componentProductId,
                  locationId: order.locationId,
                  quantity: requiredQty,
                },
              });
            }
          }
        }
      }

      // Handle the finished product
      const finishedQty = order.quantity;
      if (isAssembly) {
        // ASSEMBLY: produce finished goods
        await tx.product.update({
          where: { id: order.bom.productId },
          data: { quantity: { increment: finishedQty } },
        });

        await tx.stockMovement.create({
          data: {
            productId: order.bom.productId,
            type: 'ASSEMBLY_PRODUCE',
            quantity: finishedQty,
            reason: `Assembly ${order.assemblyNumber}: produced ${finishedQty} units`,
            tenantId,
          },
        });

        if (order.locationId) {
          const existing = await tx.stockAtLocation.findFirst({
            where: { productId: order.bom.productId, locationId: order.locationId },
          });
          if (existing) {
            await tx.stockAtLocation.update({
              where: { id: existing.id },
              data: { quantity: { increment: finishedQty } },
            });
          } else {
            await tx.stockAtLocation.create({
              data: {
                productId: order.bom.productId,
                locationId: order.locationId,
                quantity: finishedQty,
              },
            });
          }
        }
      } else {
        // DISASSEMBLY: consume finished goods
        await tx.product.update({
          where: { id: order.bom.productId },
          data: { quantity: { decrement: finishedQty } },
        });

        await tx.stockMovement.create({
          data: {
            productId: order.bom.productId,
            type: 'ASSEMBLY_CONSUME',
            quantity: -finishedQty,
            reason: `Disassembly ${order.assemblyNumber}: consumed ${finishedQty} units`,
            tenantId,
          },
        });

        if (order.locationId) {
          const existing = await tx.stockAtLocation.findFirst({
            where: { productId: order.bom.productId, locationId: order.locationId },
          });
          if (existing) {
            await tx.stockAtLocation.update({
              where: { id: existing.id },
              data: { quantity: { decrement: finishedQty } },
            });
          }
        }
      }

      // Mark order as completed
      await tx.assemblyOrder.update({
        where: { id: orderId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    return this.getAssemblyOrder(orderId, tenantId);
  }

  static async cancelAssembly(orderId: string, tenantId: string) {
    const order = await prisma.assemblyOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new Error('Assembly order not found');
    if (order.status === 'COMPLETED') throw new Error('Cannot cancel completed order');
    if (order.status === 'CANCELLED') throw new Error('Order already cancelled');

    return prisma.assemblyOrder.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });
  }

  static async getAssemblyOrder(orderId: string, tenantId: string) {
    const order = await prisma.assemblyOrder.findFirst({
      where: { id: orderId, tenantId },
      include: {
        bom: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } },
            items: {
              include: {
                componentProduct: { select: { id: true, name: true, sku: true, unit: true, costPrice: true } },
              },
            },
          },
        },
        location: { select: { id: true, name: true, code: true } },
      },
    });
    if (!order) throw new Error('Assembly order not found');
    return order;
  }

  static async listAssemblyOrders(
    tenantId: string,
    filter?: { search?: string; status?: string; type?: string },
    page = 1,
    pageSize = 20,
  ) {
    const where: any = { tenantId };
    if (filter?.status && filter.status !== 'ALL') {
      where.status = filter.status;
    }
    if (filter?.type) {
      where.type = filter.type;
    }
    if (filter?.search) {
      where.OR = [
        { assemblyNumber: { contains: filter.search, mode: 'insensitive' } },
        { bom: { product: { name: { contains: filter.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.assemblyOrder.findMany({
        where,
        include: {
          bom: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
          location: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.assemblyOrder.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async getComponentUsage(productId: string, tenantId: string) {
    return prisma.bOMItem.findMany({
      where: {
        componentProductId: productId,
        bom: { tenantId },
      },
      include: {
        bom: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });
  }
}
