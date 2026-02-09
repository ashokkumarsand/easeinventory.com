// API Gateway V2 definitions for microservices
// These will be activated during Phases 2-5 of the Strangler Fig migration
//
// Phase 1 (current): All API routes live in Next.js
// Phase 2: Analytics API extracted
// Phase 3: Order API extracted
// Phase 4: Inventory API extracted
// Phase 5: Finance, Supply Chain, Platform APIs extracted
//
// Example (to be activated in Phase 2):
//
// import { vpc } from "./vpc";
// import { database, databaseUrl } from "./database";
// import { cache, cacheUrl } from "./cache";
// import { bus } from "./events";
//
// export const analyticsApi = new sst.aws.ApiGatewayV2("AnalyticsApi");
// analyticsApi.route("GET /analytics/{proxy+}", {
//   handler: "packages/functions/src/analytics/index.handler",
//   environment: {
//     DATABASE_URL: databaseUrl,
//     REDIS_URL: cacheUrl,
//     EVENT_BUS_NAME: bus.name,
//   },
//   vpc,
// });

export {};
