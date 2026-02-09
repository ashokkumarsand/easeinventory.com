import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "inventory", status: "ok" }));

// TODO: Phase 4 — extract inventory routes from Next.js
// app.get("/products", listProducts);
// app.post("/products", createProduct);
// app.get("/stock-check", checkStock);
// app.post("/stock/adjust", adjustStock);

export const handler = handle(app);
