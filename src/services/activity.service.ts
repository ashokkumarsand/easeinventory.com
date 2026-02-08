import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================
// Types
// ============================================================

export interface LogActivityInput {
  tenantId: string;
  type: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  description?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityListOptions {
  entityType?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface ActivityEventItem {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  entityName: string | null;
  description: string | null;
  userId: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface ActivityListResult {
  events: ActivityEventItem[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// Service
// ============================================================

export class ActivityService {
  /**
   * Log an activity event
   */
  static async log(params: LogActivityInput) {
    const event = await prisma.activityEvent.create({
      data: {
        type: params.type,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,
        userId: params.userId,
        metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
        tenantId: params.tenantId,
      },
    });

    return {
      id: event.id,
      type: event.type,
      entityType: event.entityType,
      entityId: event.entityId,
      entityName: event.entityName,
      description: event.description,
      userId: event.userId,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
    };
  }

  /**
   * List activity events with optional filters (paginated)
   */
  static async list(
    tenantId: string,
    options: ActivityListOptions = {},
  ): Promise<ActivityListResult> {
    const {
      entityType,
      type,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = options;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (entityType) {
      where.entityType = entityType;
    }

    if (type) {
      where.type = type;
    }

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = dateFrom;
      if (dateTo) createdAt.lte = dateTo;
      where.createdAt = createdAt;
    }

    const [events, total] = await Promise.all([
      prisma.activityEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityEvent.count({ where }),
    ]);

    return {
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        entityType: e.entityType,
        entityId: e.entityId,
        entityName: e.entityName,
        description: e.description,
        userId: e.userId,
        metadata: e.metadata,
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
