import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "finance", status: "ok" }));

// TODO: Phase 5 — extract finance routes
// app.get("/invoices", listInvoices);
// app.post("/invoices", createInvoice);
// app.get("/pricing-rules", getPricingRules);

export const handler = handle(app);
