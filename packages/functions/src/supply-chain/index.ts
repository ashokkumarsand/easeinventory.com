import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "supply-chain", status: "ok" }));

// TODO: Phase 5 — extract supply chain routes
// app.get("/purchase-orders", listPurchaseOrders);
// app.post("/purchase-orders", createPurchaseOrder);
// app.get("/goods-receipts", listGoodsReceipts);
// app.get("/returns", listReturns);

export const handler = handle(app);
