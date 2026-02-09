import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/health", (c) => c.json({ service: "platform", status: "ok" }));

// TODO: Phase 5 — extract platform routes
// app.get("/users", listUsers);
// app.get("/webhooks", listWebhooks);
// app.get("/automations", listAutomations);
// app.get("/reports", listReports);

export const handler = handle(app);
