import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const tenantIdSchema = z.string().cuid();

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      locationId: z.string().optional(),
    })
  ).min(1),
  notes: z.string().optional(),
});

export const adjustStockSchema = z.object({
  productId: z.string().cuid(),
  locationId: z.string().cuid(),
  quantity: z.number().int(),
  notes: z.string().min(1),
});
