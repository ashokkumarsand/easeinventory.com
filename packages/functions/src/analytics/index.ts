import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "analytics", status: "ok" }));

// TODO: Phase 2 — first service to extract (read-heavy)
// app.get("/analytics/demand/:productId", getDemandAnalytics);
// app.get("/analytics/kpis", getKPIs);
// app.get("/analytics/safety-stock", getSafetyStock);

export const handler = handle(app);
