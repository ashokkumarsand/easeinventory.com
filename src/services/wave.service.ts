import prisma from '@/lib/prisma';
import { generateNumber } from '@/lib/number-generator';
import type { Prisma } from '@prisma/client';

export interface CreateWaveInput {
  name?: string;
  carrierZone?: string;
  orderIds: string[];
}

export interface WaveFilter {
  status?: string;
  search?: string;
}

export class WaveService {
  static async create(input: CreateWaveInput, tenantId: string, userId: string) {
    const waveNumber = await generateNumber('WV', tenantId);

    // Validate all orders belong to tenant and are in confirmed/processing state
    const orders = await prisma.salesOrder.findMany({
      where: {
        id: { in: input.orderIds },
        tenantId,
        status: { in: ['CONFIRMED', 'PROCESSING'] },
      },
    });

    if (orders.length !== input.orderIds.length) {
      throw new Error('Some orders are invalid or not eligible for wave planning');
    }

    return prisma.wave.create({
      data: {
        waveNumber,
        name: input.name,
        carrierZone: input.carrierZone,
        createdById: userId,
        tenantId,
        orders: {
          create: input.orderIds.map((orderId, idx) => ({
            orderId,
            sequence: idx + 1,
          })),
        },
      },
      include: {
        orders: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                shippingName: true,
                shippingCity: true,
                shippingPincode: true,
                status: true,
                total: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  static async getById(id: string, tenantId: string) {
    return prisma.wave.findFirst({
      where: { id, tenantId },
      include: {
        orders: {
          include: {
            order: {
              include: {
                items: true,
                customer: { select: { name: true } },
                shipments: { select: { id: true, awbNumber: true, status: true } },
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  static async list(tenantId: string, filter: WaveFilter = {}, page = 1, pageSize = 50) {
    const where: Prisma.WaveWhereInput = { tenantId };

    if (filter.status) where.status = filter.status as any;
    if (filter.search) {
      where.OR = [
        { waveNumber: { contains: filter.search, mode: 'insensitive' } },
        { name: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [waves, total] = await Promise.all([
      prisma.wave.findMany({
        where,
        include: {
          orders: {
            include: {
              order: { select: { orderNumber: true, shippingCity: true, total: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.wave.count({ where }),
    ]);

    return { waves, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  static async start(id: string, tenantId: string) {
    const wave = await prisma.wave.findFirst({ where: { id, tenantId } });
    if (!wave) throw new Error('Wave not found');
    if (wave.status !== 'DRAFT') throw new Error('Only draft waves can be started');

    return prisma.wave.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    });
  }

  static async complete(id: string, tenantId: string) {
    const wave = await prisma.wave.findFirst({ where: { id, tenantId } });
    if (!wave) throw new Error('Wave not found');
    if (wave.status !== 'IN_PROGRESS') throw new Error('Only in-progress waves can be completed');

    return prisma.wave.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  static async cancel(id: string, tenantId: string) {
    const wave = await prisma.wave.findFirst({ where: { id, tenantId } });
    if (!wave) throw new Error('Wave not found');
    if (wave.status === 'COMPLETED') throw new Error('Cannot cancel completed waves');

    return prisma.wave.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  static async addOrders(id: string, tenantId: string, orderIds: string[]) {
    const wave = await prisma.wave.findFirst({
      where: { id, tenantId },
      include: { orders: true },
    });
    if (!wave) throw new Error('Wave not found');
    if (wave.status !== 'DRAFT') throw new Error('Can only add orders to draft waves');

    const maxSeq = wave.orders.reduce((max, o) => Math.max(max, o.sequence), 0);

    return prisma.wave.update({
      where: { id },
      data: {
        orders: {
          create: orderIds.map((orderId, idx) => ({
            orderId,
            sequence: maxSeq + idx + 1,
          })),
        },
      },
      include: { orders: { include: { order: true }, orderBy: { sequence: 'asc' } } },
    });
  }

  static async removeOrder(id: string, tenantId: string, orderId: string) {
    const wave = await prisma.wave.findFirst({ where: { id, tenantId } });
    if (!wave) throw new Error('Wave not found');
    if (wave.status !== 'DRAFT') throw new Error('Can only remove orders from draft waves');

    await prisma.waveOrder.deleteMany({
      where: { waveId: id, orderId },
    });

    return this.getById(id, tenantId);
  }
}
