import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Import all service apps
// For now these are skeletons - they'll be filled as routes are extracted
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({ origin: "http://localhost:3000", credentials: true }));

// Health check
app.get("/health", (c) => c.json({
  status: "ok",
  services: ["orders", "inventory", "analytics", "finance", "supply-chain", "platform"],
  mode: "local-development",
}));

// Mount service routes (will be populated during extraction phases)
// app.route("/api/orders", ordersApp);
// app.route("/api/inventory", inventoryApp);
// app.route("/api/analytics", analyticsApp);
// app.route("/api/finance", financeApp);
// app.route("/api/supply-chain", supplyChainApp);
// app.route("/api/platform", platformApp);

// Placeholder routes for each service
app.get("/api/orders/health", (c) => c.json({ service: "orders", status: "ok" }));
app.get("/api/inventory/health", (c) => c.json({ service: "inventory", status: "ok" }));
app.get("/api/analytics/health", (c) => c.json({ service: "analytics", status: "ok" }));
app.get("/api/finance/health", (c) => c.json({ service: "finance", status: "ok" }));
app.get("/api/supply-chain/health", (c) => c.json({ service: "supply-chain", status: "ok" }));
app.get("/api/platform/health", (c) => c.json({ service: "platform", status: "ok" }));

const port = parseInt(process.env.SERVICES_PORT || "4000");

console.log(`\n🚀 EaseInventory Microservices (Local Dev)`);
console.log(`  Gateway:    http://localhost:${port}`);
console.log(`  Health:     http://localhost:${port}/health`);
console.log(`  Services:   orders, inventory, analytics, finance, supply-chain, platform`);
console.log(`  Mode:       local-development\n`);

serve({ fetch: app.fetch, port });
