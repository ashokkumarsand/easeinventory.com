// Database
export { prisma, PrismaClient } from "./db";
export type { Prisma } from "./db";

// Cache
export { getRedis, cacheGet, cacheSet, cacheInvalidate } from "./redis";

// Auth
export { validateToken, extractToken, requirePermission } from "./auth/validate";
export type { AuthUser } from "./auth/validate";
export { PERMISSIONS } from "./auth/permissions";

// Events
export { publishEvent } from "./events/publish";
export { localBus } from "./events/local-bus";
export { EVENT_SOURCE, EVENT_TYPE } from "./events/types";
export type {
  DomainEvent,
  OrderCreatedEvent,
  StockAdjustedEvent,
  GRNCompletedEvent,
} from "./events/types";

// Models / Validators
export {
  paginationSchema,
  tenantIdSchema,
  createOrderSchema,
  adjustStockSchema,
} from "./models/validators";
