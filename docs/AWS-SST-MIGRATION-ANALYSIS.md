# AWS SST Migration Analysis — EaseInventory at Enterprise Scale

> **Date**: 2026-02-09
> **Scope**: Architecture, cost, and migration plan for 5,000 enterprise tenants on AWS using SST

---

## Executive Summary

| Metric | Current (Vercel + Supabase) | Proposed (AWS + SST) |
|--------|---------------------------|----------------------|
| Hosting | Vercel | SST v3 → Lambda + CloudFront + S3 |
| Database | Supabase PostgreSQL | Aurora Serverless v2 PostgreSQL |
| Search | None (SQL LIKE queries) | OpenSearch or PostgreSQL FTS |
| Cache | None | ElastiCache Redis |
| Auth | NextAuth.js + JWT | NextAuth.js + JWT (no change) |
| Async Jobs | None (gap) | SQS + Lambda workers |
| Monitoring | Vercel dashboard | CloudWatch + SST Console |
| CDN | Vercel Edge | CloudFront (Mumbai PoP) |
| Est. Monthly Cost | ~$80-120 (current scale) | **$2,800-3,300/mo** (5K tenants) |
| Est. Annual Cost | ~$1,000-1,400 | **$33,600-39,600/year** |

**Bottom line**: Full AWS with SST costs ~$3,300/month at 5,000 enterprise tenants (250K users). This is **3-6x cheaper** than Vercel Pro/Enterprise at the same scale, with full infrastructure control, Indian data residency (ap-south-1), and no vendor lock-in.

---

## Current Architecture Snapshot

| Component | Count | Details |
|-----------|-------|---------|
| API Routes | 228 files, 353 handlers | REST API (no GraphQL) |
| Prisma Models | 82 | Complex multi-tenant relational schema |
| Services | 37 | Static class method pattern |
| External Integrations | 7 | Shiprocket, ClearTax, Razorpay, WhatsApp, Claude AI, Nodemailer, Google OAuth |
| Languages | 4 | en, hi, ar, pt (next-intl) |
| Background Jobs | 0 | Architecture gap — needs SQS/Lambda |
| Real-time Features | 0 | Polling-based only |
| File Generation | PDF + CSV/Excel | pdfmake for invoices/POs |

---

## Proposed AWS Architecture with SST v3

### Infrastructure Diagram

```
                    ┌──────────────────────────────────────────┐
                    │              Route 53                     │
                    │   easeinventory.com                       │
                    │   *.easeinventory.com (tenant subdomains) │
                    └──────────────┬───────────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────────┐
                    │           CloudFront CDN                  │
                    │   WAF (OWASP rules, rate limiting)        │
                    │   ACM SSL (wildcard *.easeinventory.com)  │
                    └──────┬──────────────────┬────────────────┘
                           │                  │
                    ┌──────▼──────┐   ┌──────▼──────┐
                    │  S3 Bucket  │   │   Lambda    │
                    │  (static    │   │   (SSR +    │
                    │   assets)   │   │   API)      │
                    └─────────────┘   └──────┬──────┘
                                             │
                    ┌────────────────────┬────┴─────┬───────────────┐
                    │                    │          │               │
             ┌──────▼──────┐   ┌────────▼───┐  ┌──▼────────┐  ┌──▼──────────┐
             │   Aurora     │   │ ElastiCache│  │  SQS      │  │  S3 Uploads │
             │   Postgres   │   │  Redis     │  │  Queues   │  │  (PDFs,     │
             │   v2         │   │  (cache +  │  │  + Lambda │  │   exports)  │
             │  (Multi-AZ)  │   │   session) │  │  workers  │  └─────────────┘
             └──────────────┘   └────────────┘  └───────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │  EventBridge   │
                                              │  (scheduled    │
                                              │   tasks/cron)  │
                                              └────────────────┘

             ┌─────────────────────────────────────────────────────┐
             │  Monitoring: CloudWatch + SST Console + Alarms      │
             │  Logging: CloudWatch Logs (30-day retention)        │
             │  Tracing: X-Ray (optional)                          │
             └─────────────────────────────────────────────────────┘
```

### SST Configuration

```typescript
// sst.config.ts
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "easeinventory",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: { region: "ap-south-1" }, // Mumbai for Indian customers
      },
    };
  },
  async run() {
    // 1. VPC
    const vpc = new sst.aws.Vpc("Vpc", {
      bastion: true,
      nat: "ec2", // cheaper than NAT Gateway
    });

    // 2. Database — Aurora Serverless v2 PostgreSQL
    const db = new sst.aws.Aurora("Database", {
      engine: "postgres",
      vpc,
      scaling: {
        min: $app.stage === "production" ? "2 ACU" : "0.5 ACU",
        max: $app.stage === "production" ? "32 ACU" : "4 ACU",
      },
    });

    // 3. Cache — ElastiCache Redis
    const redis = new sst.aws.Redis("Cache", { vpc });

    // 4. File storage
    const uploads = new sst.aws.Bucket("Uploads");

    // 5. Async job queue
    const jobQueue = new sst.aws.Queue("JobQueue");
    jobQueue.subscribe("src/workers/job-handler.handler");

    // 6. Scheduled tasks (cron)
    new sst.aws.Cron("DailyAnalytics", {
      schedule: "rate(1 day)",
      job: "src/workers/daily-analytics.handler",
    });

    // 7. Secrets
    const secrets = [
      new sst.Secret("NextAuthSecret"),
      new sst.Secret("GoogleClientId"),
      new sst.Secret("GoogleClientSecret"),
      new sst.Secret("RazorpayKeyId"),
      new sst.Secret("RazorpayKeySecret"),
      new sst.Secret("AnthropicApiKey"),
      new sst.Secret("WhatsAppAccessToken"),
    ];

    // 8. Next.js App
    const web = new sst.aws.Nextjs("Web", {
      vpc,
      link: [db, redis, uploads, jobQueue, ...secrets],
      domain: {
        name: "easeinventory.com",
        aliases: ["*.easeinventory.com"],
        redirects: ["www.easeinventory.com"],
      },
      server: {
        memory: "1024 MB",
        architecture: "arm64",    // 20% cheaper
        timeout: "30 seconds",
      },
      warm: $app.stage === "production" ? 10 : 0,
      environment: {
        DATABASE_URL: $interpolate`postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`,
        NEXTAUTH_URL: "https://easeinventory.com",
      },
    });

    return { url: web.url };
  },
});
```

---

## Detailed Cost Breakdown — 5,000 Enterprise Tenants

### Assumptions
- 5,000 tenants × ~50 users each = **250,000 total users**
- ~10M page views/month
- ~50M Lambda invocations/month
- ~500GB database
- ~2TB CDN bandwidth/month
- Region: ap-south-1 (Mumbai)

### Per-Service Monthly Costs

| # | Service | Configuration | Monthly Cost |
|---|---------|--------------|-------------|
| 1 | **Aurora PostgreSQL Serverless v2** | 8 ACUs avg, 500GB, Multi-AZ | **$1,902** |
| 2 | **Lambda** (SSR + API + workers) | 50M invocations, 512MB, 200ms avg | **$88** |
| 3 | **CloudFront** (flat-rate Business) | 2TB transfer, 100M requests, incl. WAF + Route 53 | **$200** |
| 4 | **S3** (static + uploads) | 50GB storage, 10M GET requests | **$8** |
| 5 | **ElastiCache Redis** | r7g.large Multi-AZ (13GB) | **$321** |
| 6 | **SQS + EventBridge** | 20M messages + 5M events | **$15** |
| 7 | **CloudWatch** | 100GB logs, 50 metrics, 20 alarms | **$85** |
| 8 | **ECR** | 10GB container images | **$1** |
| | | | |
| | **TOTAL** | | **$2,620/month** |
| | **Annual** | | **$31,440/year** |

### Optional Add-Ons

| Service | Use Case | Monthly Cost |
|---------|----------|-------------|
| **OpenSearch Serverless** | Fast product search across 5K tenants | +$702 |
| **PostgreSQL FTS** (instead of OpenSearch) | Product search via GIN indexes | +$0 (included in Aurora) |
| **Amazon Cognito** | Managed auth (250K MAUs) | +$3,600 |
| **NextAuth.js** (instead of Cognito) | Keep current auth — free | +$0 |
| **ElastiCache Reserved** (1yr) | 35% savings on Redis | -$112 |
| **RDS Proxy** | Connection pooling for Prisma | +$86 |

### Recommended Configuration

| Choice | Recommendation | Savings |
|--------|---------------|---------|
| Auth | **Keep NextAuth.js** — skip Cognito | Save $3,600/mo |
| Search | **PostgreSQL FTS first** — add OpenSearch later if needed | Save $702/mo |
| Redis | **Reserved Instance (1yr)** | Save $112/mo |
| CloudFront | **Business flat-rate plan** — includes WAF + Route 53 | Save ~$100/mo |

**Optimized Total: ~$2,500-2,800/month ($30,000-33,600/year)**

---

## Cost Comparison: AWS vs Vercel at Scale

| Deployment Model | Monthly | Annual | Notes |
|-----------------|---------|--------|-------|
| **AWS + SST (optimized)** | **$2,800** | **$33,600** | Full control, Mumbai region |
| **AWS + SST (with OpenSearch + Cognito)** | **$7,100** | **$85,200** | Premium search + managed auth |
| **Vercel Pro + AWS backend** | **$20,450+** | **$245,400+** | Function overage makes this very expensive |
| **Vercel Enterprise + AWS backend** | **$13,500-19,000** | **$162K-228K** | Better rates, still 5-7x AWS-only |

**Verdict**: AWS + SST is **5-8x cheaper** than Vercel at this scale.

---

## Fast Product Search Strategy

### Phase 1: PostgreSQL Full-Text Search (Free with Aurora)

```sql
-- Add GIN index for fast full-text search
ALTER TABLE "Product" ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(sku,'') || ' ' || coalesce(description,''))
  ) STORED;

CREATE INDEX idx_product_search ON "Product" USING GIN(search_vector);
CREATE INDEX idx_product_tenant_search ON "Product"(tenant_id, search_vector);
```

```typescript
// Prisma raw query for fast search
const results = await prisma.$queryRaw`
  SELECT id, name, sku, "salePrice"
  FROM "Product"
  WHERE "tenantId" = ${tenantId}
    AND search_vector @@ plainto_tsquery('english', ${query})
  ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${query})) DESC
  LIMIT 20
`;
```

**Performance**: Sub-50ms for millions of products with proper indexing.

### Phase 2: OpenSearch (if FTS isn't enough)

Add OpenSearch Serverless only when you need:
- Fuzzy matching / typo tolerance
- Faceted filtering (price ranges, categories)
- Relevance tuning
- Auto-suggest / typeahead

---

## User Management Best Practices

### Current: NextAuth.js + JWT (Recommended to Keep)

Your existing auth is production-grade:
- JWT sessions (stateless, fast)
- Credentials + Google OAuth
- Tenant-scoped roles (OWNER, MANAGER, ACCOUNTANT, TECHNICIAN, SALES_STAFF, STAFF, VIEWER)
- Permission system (module:action pattern)

### Enhancements for Enterprise Scale

1. **Session caching in Redis** — reduce DB lookups
2. **Rate limiting per tenant** — prevent abuse (use Redis token bucket)
3. **API key auth for integrations** — allow tenant API access without user sessions
4. **SSO / SAML** — enterprise customers expect this (add as premium feature)
5. **MFA** — TOTP via authenticator app (use `otpauth` library)

---

## Auto-Scaling Architecture

### Lambda (Compute) — Automatic

SST deploys Next.js SSR as Lambda functions. Lambda auto-scales from 0 to 1000+ concurrent executions instantly. Configuration:

```typescript
server: {
  memory: "1024 MB",          // Scale vertically
  architecture: "arm64",       // 20% cheaper, faster
},
warm: 10,                      // Keep 10 instances warm (eliminates cold starts)
```

### Aurora Serverless v2 (Database) — Automatic

```
min: 2 ACU  (~4GB RAM)   — baseline for 5K tenants
max: 32 ACU (~64GB RAM)  — handles traffic spikes
```

Aurora scales in 0.5 ACU increments within seconds. No manual intervention needed.

### ElastiCache Redis — Manual Scaling

Redis requires instance type changes for vertical scaling. Plan capacity:
- **r7g.large** (13GB): Handles 250K sessions + caching comfortably
- **r7g.xlarge** (26GB): If you add aggressive query caching

### CloudFront — Automatic

CDN scales globally with no configuration. Mumbai PoP provides <20ms latency for Indian users.

---

## Monitoring, Logging & Alerting

### Layer 1: SST Console (Free)

- Real-time Lambda logs with search
- Automatic error detection with source maps
- Deployment tracking
- Slack/email alerts on errors

### Layer 2: CloudWatch (Included in cost estimate)

```typescript
// Key alarms to configure
const alarms = [
  // API latency
  { metric: "Lambda/Duration", threshold: "5000ms", period: "5min" },
  // Error rate
  { metric: "Lambda/Errors", threshold: "50/min", period: "1min" },
  // Database CPU
  { metric: "Aurora/CPUUtilization", threshold: "80%", period: "5min" },
  // Database connections
  { metric: "Aurora/DatabaseConnections", threshold: "400", period: "1min" },
  // Redis memory
  { metric: "ElastiCache/DatabaseMemoryUsagePercentage", threshold: "80%", period: "5min" },
  // 5xx errors at CDN
  { metric: "CloudFront/5xxErrorRate", threshold: "1%", period: "5min" },
  // DLQ messages (failed async jobs)
  { metric: "SQS/ApproximateNumberOfMessagesVisible", threshold: "100", period: "5min" },
];
```

### Layer 3: Application-Level (Add)

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking + performance | $26/mo (Team plan) |
| **Datadog** (optional) | Full APM + infrastructure | $23/host/mo |
| **BetterUptime** | External uptime monitoring | Free tier |

### Structured Logging Pattern

```typescript
// src/lib/logger.ts
export function log(level: 'info' | 'warn' | 'error', event: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    tenantId: data.tenantId,
    userId: data.userId,
    ...data,
  }));
}

// Usage in services
log('info', 'order.created', { tenantId, orderId, items: items.length });
log('error', 'payment.failed', { tenantId, error: err.message, razorpayId });
```

CloudWatch Logs Insights can then query:
```
fields @timestamp, event, tenantId, @message
| filter level = "error"
| stats count() by event
| sort count desc
```

---

## Test Automation Strategy

### Test Pyramid

```
          ┌─────────┐
          │  E2E    │  ~20 critical flows (Playwright)
         ┌┴─────────┴┐
         │ Integration│  ~100 API tests (Vitest + Supertest)
        ┌┴────────────┴┐
        │   Unit Tests  │  ~300+ service/util tests (Vitest)
        └───────────────┘
```

### 1. Unit Tests — Vitest

```bash
npm install -D vitest @vitest/coverage-v8
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/services/**', 'src/lib/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

**What to test**: All 37 services — business logic, calculations, validation.

```typescript
// Example: src/services/__tests__/multi-echelon.service.test.ts
describe('MultiEchelonService', () => {
  describe('getAlerts', () => {
    it('returns low stock alerts when serviceLevel < 50%', async () => { ... });
    it('returns overstock alerts when serviceLevel > 200%', async () => { ... });
    it('generates rebalancing recommendations for imbalanced SKUs', async () => { ... });
    it('sorts alerts by severity: critical > warning > info', async () => { ... });
  });
});
```

### 2. Integration Tests — API Routes

```typescript
// Example: src/app/api/orders/__tests__/orders.test.ts
import { createMockSession } from '@/test/helpers';

describe('POST /api/orders', () => {
  it('creates a sales order with valid items', async () => {
    const res = await testClient.post('/api/orders', {
      body: { customerId: 'cust1', items: [{ productId: 'prod1', quantity: 5 }] },
      session: createMockSession({ tenantId: 'tenant1', role: 'OWNER' }),
    });
    expect(res.status).toBe(201);
    expect(res.body.orderNumber).toMatch(/^SO-/);
  });

  it('rejects orders from unauthorized roles', async () => {
    const res = await testClient.post('/api/orders', {
      body: { ... },
      session: createMockSession({ tenantId: 'tenant1', role: 'VIEWER' }),
    });
    expect(res.status).toBe(403);
  });

  it('enforces tenant isolation', async () => {
    // Create order in tenant1, try to access from tenant2
    ...
  });
});
```

### 3. E2E Tests — Playwright

```bash
npm install -D @playwright/test
```

```typescript
// e2e/critical-flows.spec.ts
test.describe('Enterprise tenant flows', () => {
  test('login → create product → create order → ship', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=workspace]', 'enterprise-corp');
    await page.fill('[name=email]', 'owner@enterprise.test');
    await page.fill('[name=password]', 'Test@1234');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
    // ... continue flow
  });

  test('multi-echelon alerts tab shows color-coded alerts', async ({ page }) => { ... });
  test('purchase order → goods receipt → stock update', async ({ page }) => { ... });
  test('return → inspect → refund → restock', async ({ page }) => { ... });
});
```

### 4. CI/CD Pipeline — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: easeinventory_test
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }

      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/easeinventory_test

      - name: Unit + Integration Tests
        run: npx vitest run --coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/easeinventory_test

      - name: Build Check
        run: npm run build

      - name: E2E Tests
        run: npx playwright test
        if: github.ref == 'refs/heads/main'

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx sst deploy --stage production
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## Migration Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up AWS account with proper IAM roles
- [ ] Initialize SST project (`npx sst@latest init`)
- [ ] Configure VPC, Aurora, Redis, S3
- [ ] Migrate Prisma schema to Aurora
- [ ] Deploy Next.js via SST (staging)
- [ ] Set up Route 53 + wildcard SSL

### Phase 2: Data Migration (Week 3)
- [ ] Export Supabase PostgreSQL dump
- [ ] Import to Aurora Serverless v2
- [ ] Verify all 82 models + data integrity
- [ ] Update Prisma connection strings
- [ ] Migrate file storage to S3

### Phase 3: Background Jobs (Week 4)
- [ ] Create SQS queues for async tasks
- [ ] Implement Lambda workers for: report generation, webhook delivery, analytics snapshots
- [ ] Set up EventBridge cron for daily/weekly analytics
- [ ] Add dead-letter queues for failed jobs

### Phase 4: Search & Performance (Week 5)
- [ ] Add PostgreSQL FTS indexes for products
- [ ] Implement Redis caching layer (sessions, hot queries)
- [ ] Add Redis-based rate limiting per tenant
- [ ] Performance test with simulated 5K tenant load

### Phase 5: Monitoring & Testing (Week 6)
- [ ] Set up CloudWatch alarms (latency, errors, DB metrics)
- [ ] Configure SST Console for log viewing
- [ ] Write unit tests for all 37 services
- [ ] Write integration tests for critical API routes
- [ ] Set up E2E tests with Playwright
- [ ] Configure GitHub Actions CI/CD pipeline

### Phase 6: Production Cutover (Week 7)
- [ ] Run parallel production (Vercel + AWS) for 1 week
- [ ] DNS cutover: Route 53 → CloudFront
- [ ] Monitor for 48 hours
- [ ] Decommission Vercel deployment

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Lambda cold starts (500ms-2s) | `warm: 10` keeps instances hot; arm64 reduces init time |
| OpenNext lag behind Next.js 16 | Pin Next.js version; test thoroughly before upgrading |
| Prisma binary size on Lambda | Use `@prisma/client` with query engine only; exclude unused engines |
| Aurora connection limits | Configure Prisma connection pool (`connection_limit=10` per Lambda) |
| Data loss during migration | Run Supabase + Aurora in parallel for 1 week; verify checksums |
| Vendor lock-in | SST uses standard AWS services; can eject to raw CloudFormation/Terraform |

---

## Final Recommendation

**Go with AWS + SST v3.** The numbers are clear:

- **$2,800/month** for 5,000 enterprise tenants (250K users)
- **$33,600/year** — less than what many SaaS companies spend on a single engineer
- **Full control** over infrastructure, data residency, and scaling
- **Indian data residency** with ap-south-1 (Mumbai)
- **No vendor lock-in** — standard AWS services, can migrate anytime

The migration is a ~7-week project. Start with the SST foundation, then incrementally add search, caching, background jobs, monitoring, and test automation.
