import { bus } from "./events";

// SQS Queues for async processing
export const webhookQueue = new sst.aws.Queue("WebhookQueue", {
  visibilityTimeout: "5 minutes",
});
webhookQueue.subscribe("packages/functions/src/workers/deliver-webhook.handler", {
  batch: { size: 1 },
});

export const reportQueue = new sst.aws.Queue("ReportQueue", {
  visibilityTimeout: "15 minutes",
});
reportQueue.subscribe("packages/functions/src/workers/generate-report.handler", {
  batch: { size: 1 },
});

export const bulkQueue = new sst.aws.Queue("BulkQueue", {
  visibilityTimeout: "15 minutes",
});
bulkQueue.subscribe("packages/functions/src/workers/process-bulk.handler", {
  batch: { size: 1 },
});

// Daily analytics cron (runs at 2 AM IST = 8:30 PM UTC)
bus.subscribe("packages/functions/src/workers/daily-analytics.handler", {
  pattern: {
    source: ["aws.scheduler"],
  },
});

// Note: The actual cron scheduling will be added in Phase 2
// when analytics service is extracted. For now, this is the worker skeleton.
