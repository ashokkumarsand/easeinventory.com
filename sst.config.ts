/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "easeinventory",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "ap-south-1", // Mumbai for Indian customers
        },
      },
    };
  },
  async run() {
    // Infrastructure
    const { vpc } = await import("./infra/vpc");
    const { database, databaseUrl } = await import("./infra/database");
    const { cache, cacheUrl } = await import("./infra/cache");
    const { bucket } = await import("./infra/storage");
    const { bus } = await import("./infra/events");

    // Workers (SQS queues + Lambda subscribers)
    const { webhookQueue, reportQueue, bulkQueue } = await import("./infra/workers");

    // Next.js frontend (keeps all API routes for Phase 1 — Strangler Fig)
    const web = new sst.aws.Nextjs("Web", {
      path: ".",
      environment: {
        DATABASE_URL: databaseUrl,
        REDIS_URL: cacheUrl,
        S3_BUCKET: bucket.name,
        EVENT_BUS_NAME: bus.name,
        WEBHOOK_QUEUE_URL: webhookQueue.url,
        REPORT_QUEUE_URL: reportQueue.url,
        BULK_QUEUE_URL: bulkQueue.url,
      },
    });

    return {
      url: web.url,
      bucketName: bucket.name,
      busName: bus.name,
    };
  },
});
