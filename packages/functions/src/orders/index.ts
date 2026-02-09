import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

// Health check
app.get("/health", (c) => c.json({ service: "order", status: "ok" }));

// TODO: Phase 3 — extract order routes from Next.js
// app.get("/orders", listOrders);
// app.post("/orders", createOrder);
// app.get("/orders/:id", getOrder);
// app.patch("/orders/:id/confirm", confirmOrder);
// app.get("/shipments", listShipments);
// app.post("/shipments", createShipment);

export const handler = handle(app);
