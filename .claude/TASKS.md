# EaseInventory Task Tracker

> This file tracks all tasks requested by the user. Updated by Claude at the start of each prompt.
> Format: [STATUS] Task description | Date | Commit (if any)

## Status Legend
- [ ] Pending
- [~] In Progress
- [x] Completed
- [-] Cancelled

---

## Completed Tasks (from git history)
- [x] Comprehensive UI styling overhaul and new features | commit: a03674b3
- [x] Add UI audit infrastructure and improve theme consistency | commit: a36c0644
- [x] Standardize dashboard page styling with consistent theme support | commit: 64631355
- [x] Add dual font typography system and theme utility classes | commit: 517d9bae
- [x] Comprehensive navigation and UI fixes | commit: f40624fd
- [x] Add notification popover with mock data | commit: eb838d8b
- [x] Plan-based feature gating, analytics dashboard, and 404 improvements | commit: 8638ad92
- [x] Restructure URLs to remove /dashboard prefix | commit: 1797b571
- [x] Add UX audit skill | commit: a3f4c2ed
- [x] Install find-skills from skills.sh | commit: 734b3879
- [x] Migrate from HeroUI to shadcn/ui component library | commit: 0b2bddd8
- [x] Customize light/dark themes to match logo colors | commit: c04d8f97
- [x] Improve theme contrast and handle missing currencies table | commit: eef30ffe
- [x] Premium landing page redesign with wave effects & multi-currency system | commit: d086ab6b
- [x] HowItWorks: extend progress line full width & move numbers below titles | commit: bf06ddb5
- [x] HowItWorks: move step number above title | commit: 0ab9223e
- [x] Update company address to Pune | commit: 47b436d7
- [x] Add agent files | commit: bab87ae7
- [x] Rename Tooltip.tsx to tooltip.tsx for case-sensitive systems | commit: fa001235
- [x] Add const assertion to framer-motion ease array for TypeScript | commit: f8342aa7

---

## Current Session — Landing Page Complete Redesign (2026-02-06)

### Phase 1: Foundation
- [x] T1: Theme system — already in place from prior work | 2026-02-06
- [x] T2: Global styles — already in place (skip-nav, reduced-motion, focus rings) | 2026-02-06

### Phase 2: Section-by-Section Redesign
- [x] T3: Navbar — already matches spec (auth-aware, glassmorphic, scroll-spy) | 2026-02-06
- [x] T4: Hero — centered layout, ambient effects, gradient text, logo cloud | commit: 05c295a8
- [x] T5: Features ("Precision Stack") — 3x2 glassmorphic cards, Lucide icons | commit: 98ec6870
- [x] T6: Mission ("Antigravity Mission") — split layout, floating stats, count-up | commit: a24d34a9
- [x] T7: HowItWorks ("Operational Protocols") — horizontal stepper | commit: b8fe2dcc
- [x] T8: Pricing ("Momentum Engine") — recommended card glow, yearly default | commit: c893cb15
- [x] T9: Testimonials ("Success Chronicles") — decorative quotes, amber stars | commit: b3073aa2
- [x] T10: Contact/CTA — glassmorphic inputs, "Get Integrated" copy | commit: a2829185
- [x] T11: FAQ ("Intelligence Hub") — centered accordion, "Still stuck?" footer | commit: 9122cb7b
- [x] T12: Footer — restructured links, glassmorphic badges | commit: f13f45b2
- [x] T13: CTA Banner — gradient glassmorphic banner | commit: f13f45b2
- [x] T14: Skip-to-content link + main landmark | commit: 3ecb3766

### Phase 3: Polish
- [x] T15: Responsive testing & fixes — mobile, tablet, desktop | commit: 4a4049be
- [x] T16: Final accessibility audit — WCAG 2.1 AA (ARIA roles, touch targets, focus, semantics) | commit: 4a4049be

### Phase 4: Feature Pages
- [x] T17: Create shared FeaturePageTemplate + rewrite all 6 feature pages + link from landing | 2026-02-06

---

### Phase 5: Admin Tools
- [x] T18: Admin preview mode — bypass Coming Soon for SUPER_ADMIN/internal staff | 2026-02-06

---

## Warehouse Operations, Delivery & Shipment Management (2026-02-06)

### Phase 1: Outbound MVP — Order Fulfillment & Shipping (Week 1-2)
- [x] P1-T1: Schema + migration — SalesOrder, PickList, CarrierAccount, Shipment, CODRemittance models + enums | 2026-02-06
- [x] P1-T2: Number generator utility (SO-YYYY-XXXX pattern) | 2026-02-06
- [x] P1-T3: SalesOrder CRUD API + order.service.ts | 2026-02-06
- [x] P1-T4: Carrier adapter interface + Shiprocket + mock adapters | 2026-02-06
- [x] P1-T5: Shipment API + shipment.service.ts (create, AWB, label, tracking) | 2026-02-06
- [x] P1-T6: Pick/pack workflow API | 2026-02-06
- [x] P1-T7: Webhook receiver for carrier status updates | 2026-02-06
- [x] P1-T8: COD tracking API | 2026-02-06
- [x] P1-T9: Permissions + plan gating for orders/shipments modules | 2026-02-06
- [x] P1-T10: Orders list/detail/create UI pages | 2026-02-06
- [x] P1-T11: Shipments dashboard + detail UI | 2026-02-06
- [x] P1-T12: COD management UI | 2026-02-06
- [x] P1-T13: Carrier settings UI | 2026-02-06
- [x] P1-T14: Sidebar nav + WhatsApp templates | 2026-02-06

### Phase 2: Inbound — Purchase & Receiving (Week 3-4)
- [x] P2-T1: PurchaseOrder + GoodsReceipt schema + migration | 2026-02-06
- [x] P2-T2: PO CRUD API + purchase-order.service.ts | 2026-02-06
- [x] P2-T3: GRN workflow API + goods-receipt.service.ts | 2026-02-06
- [x] P2-T4: PO pages (list, detail, create) | 2026-02-06
- [x] P2-T5: GRN pages (list, detail, create) | 2026-02-06
- [x] P2-T6: PO PDF generation | 2026-02-06
- [x] P2-T7: ClearTax GSP adapter for real e-Way Bill | 2026-02-06
- [x] P2-T8: NDR management UI + API | 2026-02-06

### Phase 3: Returns & Advanced Operations (Week 5-6) — COMPLETE
- [x] P3-T1: ReturnRequest + Wave schema + migration | 2026-02-06
- [x] P3-T2: Return workflow API + UI | 2026-02-06
- [x] P3-T3: Wave planning API + UI | 2026-02-06
- [-] P3-T4: Delhivery carrier adapter → moved to Backlog (Shiprocket already aggregates Delhivery)
- [-] P3-T5: Multi-carrier rate comparison → moved to Backlog (Shiprocket already returns multi-courier rates)

### Phase 4: Analytics & Polish (Week 7-8) — IN PROGRESS
- [-] P4-T1: Fleet models → moved to Backlog (most tenants use 3rd-party carriers)
- [x] P4-T2: CycleCount schema + workflow | 2026-02-06
- [-] P4-T3: Warehouse KPI dashboard → merged into P5-T4
- [x] P4-T4: Shipping KPI dashboard | 2026-02-06
- [x] P4-T5: COD analytics + reconciliation | 2026-02-06
- [-] P4-T6: Fleet management UI → moved to Backlog (depends on P4-T1)
- [x] P4-T7: Cycle counting UI | 2026-02-06

---

## Book-Informed Expansion — From "Research Handbook on Inventory Management" (2026-02-06)
> Full analysis: `.claude/BOOK-ANALYSIS.md`

### Phase 5: Inventory Intelligence (HIGHEST PRIORITY — Foundation for All)
- [x] P5-T0: Foundation — schema, permissions, plan features, nav | 2026-02-06 | commit: f674fbea
- [x] P5-T1: Demand analytics engine — sales velocity, moving averages, seasonal detection per SKU | 2026-02-06 | commit: 9cf75300
- [x] P5-T2: Safety stock & reorder point calculator — based on demand stats, lead time, service level | 2026-02-06 | commit: 5b28447b
- [x] P5-T3: ABC/XYZ classification — auto-classify products, matrix dashboard, strategy recommendations | 2026-02-06 | commit: e1ee8f7b
- [x] P5-T4: Inventory KPI dashboard — turnover, GMROI, days-of-supply, fill rate, stockout rate, aging | 2026-02-06 | commit: 6931c3df
- [x] P5-T5: Perishable/expiry management — expiryDate on lots, FEFO picking, near-expiry alerts, waste tracking | 2026-02-06 | commit: 30952ec7
- [x] P5-T6: Smart reorder suggestions — auto-generated PO suggestions based on reorder points + lead times | 2026-02-06 | commit: bc37c85f
- [x] P5-T7: Dead stock & slow mover detection — aging analysis, markdown recommendations | 2026-02-06

### Phase 6: Supply Chain Optimization
- [x] P6-T1: Multi-supplier per SKU — ProductSupplier model, preferred/emergency supplier config | 2026-02-07
- [x] P6-T2: Supplier performance tracking — actual vs. promised lead time, quality score, on-time % | 2026-02-07
- [x] P6-T3: BOM / Kit management — BOM model, component availability, kit assembly workflow | 2026-02-07
- [x] P6-T4: Inventory valuation & working capital — total value, carrying cost, capital tied up, GMROI | 2026-02-07
- [x] P6-T5: Supplier payment terms — net-30/60/90 tracking, trade credit visibility
- [x] P6-T6: Order smoothing — dampen order variability to reduce bullwhip effect

### Phase 7: Advanced Features — COMPLETE
- [x] P7-T1: Dynamic pricing rules — inventory-level-based pricing, markdown scheduling
- [x] P7-T2: Warehouse capacity management — capacity per location, utilization dashboard
- [x] P7-T3: Spare parts linkage — connect repair tickets to spare parts, maintenance-driven forecasting
- [x] P7-T4: Quality grading on returns — Grade A/B/C/Scrap, refurbishment queue, condition-based pricing
- [ ] P7-T5: Supplier portal — read-only access for suppliers to see stock levels & velocity
- [x] P7-T6: Lost sales tracking — log stockout events, lost revenue analytics | commit: 6c0d7d0b
- [x] P7-T7: Decision support nudges — smart ordering assistant, pipeline visibility, bias alerts | commit: 22547c09
- [x] P7-T8: Lateral transshipment — location-to-location emergency transfers with approval | commit: 3e87fe95
- [x] P7-T9: Inventory placement optimizer — recommend SKU allocation across warehouses | commit: 50206f2e

### Phase 8: Operational Automation & Customer Intelligence (2026-02-08)
- [x] P8-T9: Activity feed & business event log — ActivityEvent model, service, API, UI | 2026-02-08
- [x] P8-T1: Workflow automation engine — AutomationRule model, rule builder, CRUD API, UI | 2026-02-08
- [x] P8-T2: Auto-reorder workflow — depends on P8-T1, batch evaluation, template presets | 2026-02-08
- [x] P8-T3: Customer management hub — enhanced Customer model, segment/tier, CRM pages | 2026-02-08
- [x] P8-T4: Customer segmentation & CLV analytics — RFM, CLV, at-risk detection | 2026-02-08
- [x] P8-T5: Report builder & export engine — SavedReport model, CSV/Excel, column picker | 2026-02-08
- [x] P8-T6: Scheduled reports & email delivery — extends P8-T5 with scheduling | 2026-02-08
- [x] P8-T7: Outgoing webhooks & event system — WebhookEndpoint model, HMAC, retry logic | 2026-02-08
- [x] P8-T8: Bulk operations suite — CSV upload/preview/apply for price/inventory/customers | 2026-02-08

## Onboarding Setup Wizard (2026-02-09)
- [x] Onboarding setup wizard — 7-step post-approval wizard at /setup with auth, 7 API routes, confetti UI | 2026-02-09

## Phase 9: Enterprise Features (2026-02-09)
- [x] P9-T1: Multi-echelon inventory optimization — cross-warehouse optimal stock distribution | 2026-02-09 | commit: 041dc6fa
- [ ] P9-T2: Supplier portal — read-only external access for suppliers (requires separate auth)
- [x] P9-T3: Remanufacturing workflow — disassembly BOM, yield tracking | 2026-02-09 | commit: 041dc6fa
- [x] P9-T4: Fleet management — Vehicle, Driver, Trip tracking | 2026-02-09 | commit: 041dc6fa
- [x] P9-T5: Lot genealogy & traceability — full chain + recall simulation | 2026-02-09 | commit: 041dc6fa
- [x] P9-T6: SLA management — compliance scoring, breach detection, penalties | 2026-02-09 | commit: 041dc6fa

## Phase 10: Multi-Echelon Optimization Enhancement + Blog (2026-02-09)
- [x] P10-T1: Enhanced multi-echelon with alerts — low stock alerts, rebalancing alerts across warehouses | 2026-02-09
- [x] P10-T2: Scheduled rebalancing management — schedule config via Tenant.settings | 2026-02-09
- [x] P10-T3: Blog post about multi-echelon optimization — feature spotlight article | 2026-02-09
- [x] P10-T4: Add blog to main landing page — blog section + footer link | 2026-02-09

## Phase 11: AWS SST Migration (2026-02-09)
> Architecture docs: `docs/AWS-SST-MIGRATION-ANALYSIS.md`, `docs/MICROSERVICES-ARCHITECTURE.md`
> Strategy: Strangler Fig — incremental extraction, 7 thick services

### Phase 1: Infrastructure + Monorepo Skeleton
- [x] P11-T1: SST v3 init — sst.config.ts, VPC, Aurora, Redis, S3, EventBridge | 2026-02-09
- [x] P11-T2: Core package — @app/core with Prisma, Redis, auth, events, validators | 2026-02-09
- [x] P11-T3: Functions package — @app/functions with 6 Hono service skeletons + 4 workers | 2026-02-09
- [x] P11-T4: CI/CD — GitHub Actions workflows for lint/test/build/deploy | 2026-02-09
- [x] P11-T5: Monorepo config — npm workspaces, vitest, tsconfig exclusions | 2026-02-09

### Phase 2: Extract Analytics Service (pending)
- [ ] P11-T6: Analytics Hono app — migrate 51 analytics routes to @app/functions/analytics
- [ ] P11-T7: API Gateway V2 for analytics — JWT auth, Next.js proxy setup

### Phase 3: Extract Order Service (pending)
- [ ] P11-T8: Order Hono app — migrate 17 order/shipment routes
- [ ] P11-T9: EventBridge integration — OrderCreated, OrderShipped events

### Phase 4: Extract Inventory Service (pending)
- [ ] P11-T10: Inventory Hono app — migrate 28 inventory routes + stock check API

### Phase 5: Extract Remaining Services (pending)
- [ ] P11-T11: Finance, Supply Chain, Platform services
- [ ] P11-T12: Worker service — webhook delivery, report gen, bulk ops, analytics cron

### Phase 6: Remove Next.js API Routes (pending)
- [ ] P11-T13: Frontend API client — typed HTTP client for all services
- [ ] P11-T14: Remove Next.js API routes — pure SSR frontend

---

## Pricing Redesign: 3-Plan Model with Credits (2026-02-10)
- [x] PR-T1: Prisma schema — PlanType enum (TRIAL/BASIC/BUSINESS/ENTERPRISE + deprecated FREE/STARTER), AddOnType enum, PlanAddOn model, Tenant fields (trialEndsAt, effective limits) | 2026-02-10
- [x] PR-T2: Rewrite plan-features.ts — 54 features across 3 tiers, add-on prices, backward compat, new utilities | 2026-02-10
- [x] PR-T3: Create plan-limits.ts — server-side limit checking, recalculateEffectiveLimits | 2026-02-10
- [x] PR-T4: Backend updates — auth.ts JWT mapping, PlanContext (trial/add-on awareness), usePlanFeatures hooks, tenant service (TRIAL default), register API, payment webhook | 2026-02-10
- [x] PR-T5: New API routes — /api/plan/add-ons (CRUD), /api/plan/limits (usage vs limits) | 2026-02-10
- [x] PR-T6: Pricing page — 3-column (Basic ₹599, Business ₹3,999 recommended, Enterprise contact sales), add-on credits section, enterprise feature links | 2026-02-10
- [x] PR-T7: Billing page — trial countdown banner, limit progress bars, add-on management (Business only), 3-plan comparison | 2026-02-10
- [x] PR-T8: UpgradeModal — 3-column, trial-aware messaging | 2026-02-10
- [x] PR-T9: UpgradeBanner — trial countdown, expired trial alert, CTA button with days remaining | 2026-02-10
- [x] PR-T10: Admin pages — licenses (TRIAL filter), promotions (TRIAL/BASIC targets) | 2026-02-10
- [x] PR-T11: Payment subscription route — updated plan map and pricing (BASIC/BUSINESS/ENTERPRISE) | 2026-02-10
- [x] PR-T12: Build verification — npm run build passes, no type errors | 2026-02-10

---

## Landing Page: Fix Broken Links + Showcase All Features (2026-02-10)
- [x] LP-T1: Expand Features.tsx — 6 → 12 cards (4x3 grid) with 6 new grouped feature cards | 2026-02-10
- [x] LP-T2: Create 6 new feature pages (warehouse, supply-chain, intelligence, automation, multi-location, enterprise) | 2026-02-10
- [x] LP-T3: Fix Pricing.tsx — replace 4 broken enterprise links with 6 working feature page links | 2026-02-10
- [x] LP-T4: Create /careers page | 2026-02-10
- [x] LP-T5: Update Hero.tsx subtitle to reflect full platform scope | 2026-02-10
- [x] LP-T6: Fix Footer.tsx badge — "Free Forever Plan" → "14-Day Free Trial" | 2026-02-10
- [x] LP-T7: Build verification — npm run build passes, zero type errors | 2026-02-10

---

## Pending / Backlog (Lower Priority)
- [ ] Direct Delhivery adapter (was P3-T4) — only if customer has direct Delhivery contract
- [ ] Cross-aggregator rate comparison (was P3-T5) — only after 2+ carrier adapters exist
- [x] ML-based demand forecasting — Holt-Winters, regression, ensemble (BL-T1–T8 complete)
- [x] Assortment planning tools (retail-specific) — service, 7 API routes, 5 UI components, Intelligence tab
- [x] Missing pages giving 404 — fixed /settings/billing, /contact, /waves/new, /pricing, help sub-articles, Profile Settings link
