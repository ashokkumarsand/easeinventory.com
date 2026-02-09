# Microservices Architecture Analysis — EaseInventory on AWS SST

> **Date**: 2026-02-09
> **Purpose**: Define service boundaries, communication patterns, and SST project structure before migration

---

## Current Monolith Profile

| Metric | Count |
|--------|-------|
| API Routes | 228 files, 353 HTTP handlers |
| Prisma Models | 82 |
| Service Classes | 37 |
| External Integrations | 7 (Shiprocket, ClearTax, Razorpay, WhatsApp, Claude AI, Nodemailer, Google OAuth) |
| Background Jobs | 0 (architecture gap) |
| Real-time Features | 0 (polling only) |

---

## Proposed Microservice Decomposition

### 12 Bounded Contexts → 7 Deployable Services

After analyzing all 228 routes and their data dependencies, pure 12-service split creates too much cross-service chatter. The optimal architecture groups related domains into **7 thick services** (each a single Lambda with Hono routing internally).

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                           │
│                    api.easeinventory.com                         │
│                    app.easeinventory.com                         │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
│  Next.js    │ │  Order     │ │ Inventory │ │  Analytics    │
│  Frontend   │ │  Service   │ │  Service  │ │  Service      │
│  (SSR)      │ │            │ │           │ │               │
│  app.*      │ │  17 routes │ │ 28 routes │ │  51 routes    │
└─────────────┘ └─────┬──────┘ └─────┬─────┘ └───────┬───────┘
                      │              │                │
              ┌───────▼──────────────▼────────────────▼───────┐
              │              EventBridge Bus                    │
              │         (async event fan-out)                   │
              └──────┬──────────────┬──────────────┬──────────┘
                     │              │              │
              ┌──────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
              │  Finance    │ │  Supply   │ │  Platform     │
              │  Service    │ │  Chain    │ │  Service      │
              │             │ │  Service  │ │               │
              │  11 routes  │ │  35 routes│ │  42 routes    │
              └─────────────┘ └───────────┘ └───────────────┘
                                                    │
                                             ┌──────▼──────┐
                                             │  Worker     │
                                             │  Service    │
                                             │  (async)    │
                                             │  SQS+Lambda │
                                             └─────────────┘
```

### Service Definitions

#### 1. Order Service (17 routes)
**Domain**: Sales orders, pick lists, shipments, carrier integration, NDR

| Routes | Services Used |
|--------|--------------|
| `/orders/*` (7) | OrderService |
| `/shipments/*` (8) | ShipmentService |
| `/pick-lists/*` (1) | — |
| `/carriers/*` (1) | Shiprocket adapter |

**Events Published**: `OrderCreated`, `OrderConfirmed`, `OrderShipped`, `OrderDelivered`, `OrderCancelled`
**Events Consumed**: `StockReserved`, `PaymentReceived`

---

#### 2. Inventory Service (28 routes)
**Domain**: Products, stock levels, lots, locations, BOM, assembly, cycle counts, warehouse capacity, transfers, transshipments

| Routes | Services Used |
|--------|--------------|
| `/products/*` (4) | ProductService |
| `/inventory/*` (7) | — |
| `/bom/*` (4) | BOMService |
| `/assembly-orders/*` (3) | — |
| `/cycle-counts/*` (6) | CycleCountService |
| `/warehouse-capacity/*` (2) | WarehouseCapacityService |
| `/transshipments/*` (2) | TransshipmentService |

**Events Published**: `StockAdjusted`, `StockDepleted`, `StockReceived`, `TransferCompleted`
**Events Consumed**: `OrderConfirmed` (reserve stock), `GRNCompleted` (add stock), `ReturnRestocked`

---

#### 3. Analytics Service (51 routes)
**Domain**: All analytics, intelligence, forecasting, KPIs — read-heavy, compute-heavy

| Routes | Services Used |
|--------|--------------|
| `/analytics/demand/*` (3) | DemandForecastService |
| `/analytics/forecasts/*` (5) | DemandForecastService |
| `/analytics/safety-stock/*` (2) | InventoryAnalyticsService |
| `/analytics/abc-xyz` (1) | InventoryAnalyticsService |
| `/analytics/kpis/*` (2) | InventoryAnalyticsService |
| `/analytics/multi-echelon/*` (2) | MultiEchelonService |
| `/analytics/assortment/*` (7) | AssortmentService |
| `/analytics/order-smoothing/*` (3) | OrderSmoothingService |
| `/analytics/placement-optimizer` (1) | PlacementOptimizerService |
| `/analytics/reorder-suggestions/*` (3) | — |
| `/analytics/lot-genealogy` (1) | LotGenealogyService |
| + 20 more analytics routes | Various |

**Events Published**: `ReorderSuggestionGenerated`, `AlertTriggered`
**Events Consumed**: `OrderCreated`, `StockAdjusted`, `GRNCompleted` (for snapshot generation)

**Note**: This service is read-heavy with occasional writes (snapshots, forecasts). Good candidate for a read replica connection.

---

#### 4. Finance Service (11 routes)
**Domain**: Invoices, GST compliance, dynamic pricing, COD, settlements

| Routes | Services Used |
|--------|--------------|
| `/invoices/*` (3) | — |
| `/invoices/export/gstr1` (1) | ClearTax adapter |
| `/pricing-rules/*` (4) | DynamicPricingService |
| `/settlements/*` (2) | — |
| `/cod/pending` (1) | — |

**Events Published**: `InvoiceGenerated`, `PaymentReceived`
**Events Consumed**: `OrderShipped` (generate invoice), `ReturnRefunded`

---

#### 5. Supply Chain Service (35 routes)
**Domain**: Suppliers, purchasing, goods receipts, supplier payments, returns, refurbishment, remanufacturing, repairs, spare parts, SLA, fleet, waves

| Routes | Services Used |
|--------|--------------|
| `/purchase-orders/*` (8) | PurchaseOrderService |
| `/goods-receipts/*` (5) | GoodsReceiptService |
| `/suppliers/*` (3) | — |
| `/supplier-payments/*` (3) | SupplierPaymentService |
| `/returns/*` (5) | ReturnService |
| `/refurbishment/*` (2) | RefurbishmentService |
| `/remanufacturing/*` (1) | RemanufacturingService |
| `/repairs/*` (4) | — |
| `/spare-parts` (1) | SparePartsService |
| `/sla` (1) | SLAService |
| `/fleet` (1) | FleetService |
| `/waves/*` (4) | WaveService |

**Events Published**: `GRNCompleted`, `ReturnApproved`, `ReturnRestocked`, `POSent`
**Events Consumed**: `OrderCreated` (wave planning), `StockDepleted` (auto-reorder)

---

#### 6. Platform Service (42 routes)
**Domain**: Auth, users, tenants, admin, settings, webhooks, automations, reports, bulk ops, activity, customers, HR, communications

| Routes | Services Used |
|--------|--------------|
| `/auth/*` (2) | NextAuth |
| `/users/*` (2) | — |
| `/admin/*` (6) | TenantService |
| `/settings/*` (2) | — |
| `/webhooks/*` (3) | WebhookService |
| `/automations/*` (4) | AutomationService |
| `/reports/*` (4) | ReportService |
| `/bulk/*` (2) | BulkOperationsService |
| `/activity` (1) | ActivityService |
| `/customers/*` (4) | CustomerService |
| `/hr/*` (8) | — |
| `/whatsapp/*` (5) | WhatsApp lib |
| `/notifications/*` (2) | — |
| + setup, register, onboarding, etc. | — |

**Events Published**: `UserCreated`, `TenantApproved`, `WebhookTriggered`
**Events Consumed**: All events (for activity feed, webhooks, automation triggers)

---

#### 7. Worker Service (async jobs via SQS + Lambda)
**Domain**: Background processing, scheduled tasks, heavy compute

| Job Type | Trigger | Worker |
|----------|---------|--------|
| Invoice PDF generation | SQS (from Finance) | `generate-invoice.handler` |
| Report export (CSV/Excel) | SQS (from Platform) | `generate-report.handler` |
| Webhook delivery + retry | SQS (from Platform) | `deliver-webhook.handler` |
| Analytics snapshot | EventBridge cron (daily) | `daily-analytics.handler` |
| Demand forecast refresh | EventBridge cron (weekly) | `forecast-refresh.handler` |
| WhatsApp batch send | SQS (from Platform) | `send-whatsapp.handler` |
| Bulk import processing | SQS (from Platform) | `process-bulk.handler` |
| Automation rule evaluation | EventBridge cron (hourly) | `evaluate-automations.handler` |

---

## Data Flow & Event Architecture

### EventBridge Events (Async, Loosely Coupled)

```
Order Service ──► OrderCreated ──► Inventory Service (reserve stock)
                                ──► Analytics Service (update demand)
                                ──► Supply Chain (wave planning)
                                ──► Platform (activity feed, webhooks)

Inventory Service ──► StockDepleted ──► Analytics (alert)
                                    ──► Supply Chain (auto-reorder)
                                    ──► Platform (notification)

Supply Chain ──► GRNCompleted ──► Inventory (add stock)
                               ──► Analytics (update snapshots)
                               ──► Finance (update payables)

Finance ──► InvoiceGenerated ──► Platform (webhook, WhatsApp)
         ──► PaymentReceived ──► Order Service (update status)
```

### Synchronous Calls (HTTP, Low Latency)

```
Order Service ──HTTP──► Inventory Service  (stock availability check)
Order Service ──HTTP──► Finance Service    (price calculation)
Next.js SSR   ──HTTP──► All Services       (page data fetching)
```

### Shared Database with Event Outbox

All services share one Aurora PostgreSQL database but use an **event outbox pattern**:

```
┌─────────────────────────────────────────────────┐
│           Aurora PostgreSQL (Shared)              │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Order    │ │ Product  │ │ EventOutbox      │ │
│  │ Tables   │ │ Tables   │ │ (published flag) │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
         │              │              │
    Order Service  Inventory Svc   EventBridge
    (owns writes)  (owns writes)   (reads outbox)
```

Each service **owns** its tables — other services read via events or API calls, never direct DB writes to another service's tables.

---

## Monorepo Structure

```
easeinventory/
├── sst.config.ts                       # Root SST config
├── package.json                        # npm workspaces
├── tsconfig.base.json                  # Shared TS config
│
├── infra/                              # Infrastructure-as-code
│   ├── vpc.ts                          # VPC, subnets, NAT
│   ├── database.ts                     # Aurora PostgreSQL + RDS Proxy
│   ├── cache.ts                        # ElastiCache Redis
│   ├── storage.ts                      # S3 buckets
│   ├── events.ts                       # EventBridge bus + SQS queues
│   ├── auth.ts                         # JWT authorizer config
│   ├── order-api.ts                    # Order service routes
│   ├── inventory-api.ts                # Inventory service routes
│   ├── analytics-api.ts                # Analytics service routes
│   ├── finance-api.ts                  # Finance service routes
│   ├── supply-chain-api.ts             # Supply chain service routes
│   ├── platform-api.ts                 # Platform service routes
│   ├── workers.ts                      # Async job workers + cron
│   └── web.ts                          # Next.js frontend
│
├── packages/
│   ├── core/                           # @app/core — shared code
│   │   ├── prisma/
│   │   │   └── schema.prisma           # Single shared schema
│   │   ├── src/
│   │   │   ├── db.ts                   # PrismaClient singleton
│   │   │   ├── redis.ts                # Redis client
│   │   │   ├── auth/
│   │   │   │   ├── validate.ts         # JWT validation
│   │   │   │   └── permissions.ts      # Role/permission checks
│   │   │   ├── events/
│   │   │   │   ├── types.ts            # Event type definitions
│   │   │   │   └── publish.ts          # EventBridge publisher helper
│   │   │   └── models/
│   │   │       └── validators.ts       # Zod schemas
│   │   └── package.json
│   │
│   ├── services/                       # @app/services — business logic
│   │   ├── src/
│   │   │   ├── order.service.ts
│   │   │   ├── shipment.service.ts
│   │   │   ├── inventory-analytics.service.ts
│   │   │   ├── demand-forecast.service.ts
│   │   │   ├── multi-echelon.service.ts
│   │   │   ├── purchase-order.service.ts
│   │   │   ├── goods-receipt.service.ts
│   │   │   ├── return.service.ts
│   │   │   ├── ... (all 37 services)
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── functions/                      # @app/functions — Lambda handlers
│   │   ├── src/
│   │   │   ├── orders/                 # Order service handlers
│   │   │   │   ├── index.ts            # Hono app (routes all /orders/*)
│   │   │   │   ├── create.ts
│   │   │   │   ├── list.ts
│   │   │   │   └── on-payment.ts       # Event subscriber
│   │   │   ├── inventory/
│   │   │   │   ├── index.ts            # Hono app
│   │   │   │   ├── list-products.ts
│   │   │   │   ├── adjust-stock.ts
│   │   │   │   └── on-order-created.ts # Event subscriber
│   │   │   ├── analytics/
│   │   │   │   ├── index.ts            # Hono app
│   │   │   │   ├── demand.ts
│   │   │   │   └── kpis.ts
│   │   │   ├── finance/
│   │   │   │   ├── index.ts
│   │   │   │   └── generate-invoice.ts
│   │   │   ├── supply-chain/
│   │   │   │   ├── index.ts
│   │   │   │   ├── purchase-orders.ts
│   │   │   │   └── returns.ts
│   │   │   ├── platform/
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── webhooks.ts
│   │   │   │   └── customers.ts
│   │   │   └── workers/
│   │   │       ├── daily-analytics.ts
│   │   │       ├── deliver-webhook.ts
│   │   │       ├── generate-report.ts
│   │   │       └── process-bulk.ts
│   │   └── package.json
│   │
│   └── web/                            # @app/web — Next.js frontend
│       ├── src/
│       │   ├── app/                    # Pages (SSR calls service APIs)
│       │   ├── components/
│       │   └── lib/
│       │       └── api-client.ts       # Typed HTTP client for services
│       ├── next.config.js
│       └── package.json
│
├── tests/                              # Test suites
│   ├── unit/                           # Service unit tests (Vitest)
│   ├── integration/                    # API integration tests
│   └── e2e/                            # Playwright E2E tests
│
└── .github/
    └── workflows/
        ├── ci.yml                      # Lint + test + build
        └── deploy.yml                  # SST deploy
```

---

## Service Communication Patterns

### 1. Next.js Frontend → API Services

```typescript
// packages/web/src/lib/api-client.ts
const SERVICE_URLS = {
  orders: process.env.NEXT_PUBLIC_ORDER_API_URL,
  inventory: process.env.NEXT_PUBLIC_INVENTORY_API_URL,
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_API_URL,
  finance: process.env.NEXT_PUBLIC_FINANCE_API_URL,
  supplyChain: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_API_URL,
  platform: process.env.NEXT_PUBLIC_PLATFORM_API_URL,
};

export async function apiCall(service: keyof typeof SERVICE_URLS, path: string, options?: RequestInit) {
  const url = `${SERVICE_URLS[service]}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
```

### 2. Service → Service (Sync HTTP)

```typescript
// packages/functions/src/orders/create.ts
import { Resource } from "sst";

// Check stock availability before confirming order
const stockCheck = await fetch(`${Resource.InventoryService.url}/stock-check`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId, quantity, locationId }),
});
```

### 3. Service → EventBridge (Async Events)

```typescript
// packages/core/src/events/publish.ts
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { Resource } from "sst";

const eb = new EventBridgeClient({});

export async function publishEvent(source: string, type: string, detail: Record<string, unknown>) {
  await eb.send(new PutEventsCommand({
    Entries: [{
      EventBusName: Resource.Events.name,
      Source: source,
      DetailType: type,
      Detail: JSON.stringify(detail),
    }],
  }));
}

// Usage in order service
await publishEvent("order.service", "OrderCreated", {
  orderId: order.id,
  tenantId,
  items: order.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
});
```

---

## Authentication Strategy

| Layer | Method | Details |
|-------|--------|---------|
| **Browser → Next.js** | NextAuth.js JWT cookie | Existing flow, no change |
| **Next.js SSR → Services** | JWT in `Authorization` header | Server-side calls include token |
| **Browser → Services** | JWT in `Authorization` header | Client-side API calls |
| **Service → Service** | IAM auth (AWS Signature V4) | Automatic with SST `link` |
| **Webhooks (inbound)** | Signature verification | Shiprocket/Razorpay HMAC |
| **API Gateway** | JWT Authorizer | Validates token before Lambda |

### JWT Authorizer Config

```typescript
// infra/auth.ts
export function addJwtAuth(api: ReturnType<typeof sst.aws.ApiGatewayV2>) {
  return api.addAuthorizer({
    name: "jwt",
    jwt: {
      issuer: process.env.NEXTAUTH_URL || "https://easeinventory.com",
      audiences: ["https://api.easeinventory.com"],
    },
  });
}
```

---

## Cross-Domain Data Dependencies (Critical)

These are the highest-risk areas during migration:

| Write Operation | Affected Services | Pattern |
|----------------|-------------------|---------|
| **Create SalesOrder** | Inventory (reserve stock), Finance (pricing), Analytics (demand) | Sync stock check → Async events |
| **Complete GRN** | Inventory (add ProductLot + StockAtLocation), Finance (payables) | Sync stock update → Async events |
| **Process Return** | Inventory (restock), Finance (refund), Analytics (return rate) | Async events for all |
| **Adjust Stock** | Analytics (snapshots), Platform (alerts, webhooks) | Async events |
| **Create Invoice** | Platform (WhatsApp, webhooks), Analytics (revenue) | Async events |

### Data Ownership Rules

| Model | Owner Service | Read By |
|-------|--------------|---------|
| SalesOrder, SalesOrderItem | Order | Finance, Analytics, Supply Chain |
| Product, ProductLot, StockAtLocation | Inventory | All services (read) |
| StockMovement | Inventory | Analytics, Platform |
| PurchaseOrder, GoodsReceipt | Supply Chain | Inventory, Finance, Analytics |
| Invoice, InvoiceItem | Finance | Platform, Analytics |
| Customer | Platform | Order, Finance, Analytics |
| Tenant, User | Platform | All services (auth context) |
| DemandSnapshot, KPISnapshot | Analytics | Platform (dashboards) |

---

## Migration Strategy: Strangler Fig Pattern

Don't rewrite everything at once. Migrate incrementally:

### Phase 1: Infrastructure + Next.js (Week 1-2)
- Set up SST project with monorepo structure
- Deploy Next.js frontend on SST (replaces Vercel)
- Keep all API routes inside Next.js initially
- Aurora + Redis + S3 provisioned

### Phase 2: Extract Analytics Service (Week 3)
- Easiest to extract — read-heavy, minimal writes
- 51 routes, no cross-service writes needed
- Next.js proxies `/api/analytics/*` → Analytics Lambda

### Phase 3: Extract Order Service (Week 4)
- 17 routes with clear boundaries
- Add EventBridge for `OrderCreated` → other services
- Next.js proxies `/api/orders/*` and `/api/shipments/*`

### Phase 4: Extract Inventory Service (Week 5)
- 28 routes, high data ownership
- Stock check API for Order Service sync calls
- Event-driven stock updates

### Phase 5: Extract Remaining Services (Week 6-7)
- Finance, Supply Chain, Platform
- Add Worker Service for async jobs

### Phase 6: Remove Next.js API Routes (Week 8)
- All API routes now in dedicated services
- Next.js is pure frontend (SSR + static)
- Update all frontend API calls to service URLs

---

## Cost Impact of Microservices

Splitting into 7 services adds minimal cost:

| Component | Monolith (1 Lambda) | Microservices (7 Lambdas) | Delta |
|-----------|---------------------|--------------------------|-------|
| Lambda compute | $88/mo | $95/mo | +$7 |
| API Gateway | $0 (Next.js routes) | $50/mo (50M requests) | +$50 |
| EventBridge | $0 | $5/mo (5M events) | +$5 |
| SQS | $0 | $8/mo (20M messages) | +$8 |
| Cold starts | Rare (1 warm function) | More frequent (7 functions) | Mitigated by `warm` |
| **Total delta** | | | **+$70/mo** |

The $70/month premium buys: independent scaling, fault isolation, smaller deploy units, clearer ownership, and the ability to scale individual services independently.

---

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Service count | **7 thick services** | Balance between isolation and overhead |
| API layer | **API Gateway V2** per service | JWT authorizer, rate limiting, custom domains |
| Internal routing | **Hono** within each Lambda | Lightweight, fast, type-safe |
| Database | **Shared Aurora PostgreSQL** | Avoid distributed transaction complexity |
| Events | **EventBridge** for fan-out | Native AWS, no infrastructure to manage |
| Job queue | **SQS + Lambda workers** | Guaranteed delivery, DLQ support |
| Auth | **API Gateway JWT Authorizer** | Zero overhead, validates NextAuth tokens |
| Shared code | **@app/core + @app/services** packages | DRY, single Prisma schema |
| Deploys | **Single SST app, path-based CI triggers** | Incremental deploys are fast enough |
| Frontend | **Next.js SSR calls service APIs** | Clean separation of concerns |
