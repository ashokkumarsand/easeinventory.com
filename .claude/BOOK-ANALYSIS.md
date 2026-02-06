# Research Handbook on Inventory Management — Gap Analysis for EaseInventory

> **Source**: "Research Handbook on Inventory Management" (Ed. Jing-Sheng Jeannette Song, 2023)
> **Analysis Date**: 2026-02-06
> **Purpose**: Identify missing features, lifecycle gaps, and business insights for EaseInventory SaaS

---

## EXECUTIVE SUMMARY

After deep analysis of all 21 chapters across 3 parts (Fundamentals, Interfaces, Context-Specific Models) and comparing with EaseInventory's current 129 API routes, 47 UI pages, 60+ Prisma models, and 9 service classes — **18 critical feature gaps** were identified spanning 6 strategic areas.

### Current Platform Strengths
- Multi-tenant architecture with RBAC
- Full order-to-ship lifecycle (PO → GRN → SO → Pick → Pack → Ship)
- Returns management with inspect/refund/restock workflow
- Wave planning for batch fulfillment
- Carrier integration (Shiprocket adapter)
- GST compliance (HSN, GSTR-1, e-invoicing, e-Way Bill)
- Multi-location inventory with stock transfers
- Product lot tracking
- Barcode generation/lookup
- HR/Payroll module

### Critical Gaps Identified from Book

| # | Gap Area | Book Chapters | Business Impact | Priority |
|---|----------|---------------|-----------------|----------|
| 1 | Demand Forecasting & Reorder Optimization | Ch 1,7,14,15,20 | HIGH — no auto-replenishment intelligence | P1 |
| 2 | ABC/XYZ Product Classification | Ch 20 | HIGH — no SKU prioritization | P1 |
| 3 | Perishable/Expiry Inventory (FEFO) | Ch 2,18 | HIGH — Indian food/pharma market | P1 |
| 4 | Safety Stock Calculator | Ch 1,3,5,7,20 | HIGH — manual guesswork today | P1 |
| 5 | Bill of Materials / Kit Assembly | Ch 9 | MEDIUM — manufacturing segment | P2 |
| 6 | Dual-Supplier Sourcing Strategy | Ch 8 | MEDIUM — supply risk mitigation | P2 |
| 7 | Dynamic Pricing Engine | Ch 13 | MEDIUM — markdown/clearance | P2 |
| 8 | Inventory Financial Analytics | Ch 16 | MEDIUM — working capital visibility | P2 |
| 9 | Behavioral Decision Support | Ch 17 | MEDIUM — ordering bias correction | P2 |
| 10 | Vendor Managed Inventory (VMI) | Ch 12 | MEDIUM — supplier collaboration | P3 |
| 11 | Bullwhip Effect Mitigation | Ch 12,17 | MEDIUM — order smoothing | P3 |
| 12 | Multi-Echelon Optimization | Ch 4,5 | LOW — advanced supply chain | P3 |
| 13 | Spare Parts Planning | Ch 19 | MEDIUM — repair module enhancement | P2 |
| 14 | Data-Driven ML Optimization | Ch 14,15 | LOW — requires data maturity | P3 |
| 15 | Remanufacturing Workflow | Ch 10 | LOW — niche manufacturing | P3 |
| 16 | Assortment Planning | Ch 20 | LOW — retail-specific | P3 |
| 17 | Inventory Accuracy Management | Ch 20 (+ P4-T2) | HIGH — already planned | P1 |
| 18 | Warehouse Capacity Planning | Ch 3,21 | MEDIUM — picking optimization | P2 |

---

## DETAILED GAP ANALYSIS BY BOOK CHAPTER

### PART I — FUNDAMENTALS

#### From Ch 1: Lost-Sales Inventory Systems
**Book Insight**: When stock runs out, B2C customers leave (lost sales), unlike B2B where they wait (backorders). The distinction changes optimal inventory policies significantly.

**Gap in EaseInventory**:
- No distinction between lost-sales vs. backorder models
- No stockout cost tracking or lost-sales analytics
- **Feature**: Track lost sales events when orders are rejected/cancelled due to stockout. Show lost revenue dashboard.

#### From Ch 2: Perishable Inventory Systems
**Book Insight**: Products with shelf lives require FIFO/FEFO issuing, age-tracking, substitution between age classes, and multi-location allocation optimized for waste minimization.

**Gap in EaseInventory**:
- `ProductLot` model exists but has NO `expiryDate` field
- No FEFO (First Expired, First Out) picking logic
- No waste/spoilage tracking or reporting
- No near-expiry alerts or markdown triggers
- **Features needed**:
  - Add `expiryDate`, `manufacturedDate`, `shelfLifeDays` to ProductLot
  - FEFO picking mode (pick nearest-expiry first)
  - Near-expiry alert dashboard
  - Waste/spoilage recording and analytics
  - Age-based markdown recommendations

#### From Ch 3: Capacitated Inventory Systems
**Book Insight**: When warehouse or supplier capacity is limited, standard reorder points must be adjusted. Multi-product shared capacity requires joint coordination.

**Gap in EaseInventory**:
- No warehouse capacity tracking (zone capacity, shelf limits)
- No capacity-aware replenishment logic
- **Features needed**:
  - Add capacity fields to Location model (maxUnits, maxWeight, maxVolume)
  - Capacity utilization dashboard per location
  - Capacity-aware reorder suggestions

#### From Ch 7: Robust Inventory Management
**Book Insight**: When demand distributions are unknown, use robust optimization with just mean + standard deviation to set order quantities that protect against worst-case scenarios.

**Gap in EaseInventory**:
- No demand statistics computation
- No robust ordering recommendations
- **Feature**: Compute rolling mean/stddev of demand per SKU. Offer "robust reorder quantity" that protects against uncertainty at user-specified confidence level.

#### From Ch 8: Dual-Sourcing Models
**Book Insight**: Maintain a cheap-but-slow regular supplier and an expensive-but-fast emergency supplier. Use "Tailored Base-Surge" policy — constant standing orders on regular, surge orders on express when needed.

**Gap in EaseInventory**:
- Supplier model exists but no multi-supplier-per-SKU linking
- No supplier performance tracking (actual vs. promised lead time)
- No dual-sourcing strategy configuration
- **Features needed**:
  - ProductSupplier junction table (price, leadTime, isPreferred, isEmergency)
  - Supplier lead time tracking (actual delivery dates vs. PO dates)
  - Auto-split recommendation: regular supplier for baseline, emergency for surges

#### From Ch 9: Assemble-to-Order Systems
**Book Insight**: BOM management, component commonality (shared parts across products), kit assembly, and allocation priority when shared components are scarce.

**Gap in EaseInventory**:
- No BOM/recipe management
- No kit/bundle assembly workflow
- No component commonality analysis
- **Features needed**:
  - BOM model (Product → BOMItem[] → Component Product)
  - Kit assembly workflow (assemble from components on demand)
  - Component availability check before accepting orders
  - Shared component allocation priority rules

#### From Ch 10: Returns & Remanufacturing
**Book Insight**: Returned products need quality grading, disposition decisions (restock as-is, refurbish, scrap), and separate inventory tracking for remanufactured vs. new items.

**Current State**: ReturnRequest model exists with basic inspect/refund/restock flow.
**Gap**:
- No quality grading system (Grade A/B/C/Scrap)
- No refurbishment/remanufacturing workflow
- No separate tracking of refurbished vs. new inventory
- **Features needed**:
  - Quality grade field on return inspection
  - Refurbishment queue/workflow
  - Condition-based pricing for refurbished items
  - Separate stock categories (New, Refurbished, Damaged)

### PART II — INTERFACES

#### From Ch 12: Information & Incentives
**Book Insight**: VMI (Vendor Managed Inventory) lets suppliers manage retailer stock using POS data. Information sharing reduces bullwhip effect. RFID enables automatic inventory tracking.

**Gap in EaseInventory**:
- No supplier-facing portal or API access
- No POS data sharing with suppliers
- No bullwhip effect detection or order smoothing
- **Features needed**:
  - Supplier portal with read access to stock levels and sales velocity
  - Order smoothing algorithm to reduce variability amplification
  - Information sharing dashboard for supply chain visibility

#### From Ch 13: Joint Pricing & Inventory
**Book Insight**: Optimal pricing depends on inventory level. When stock is high, lower prices to move inventory. When stock is low, raise prices. "Base-stock list-price" policy: below threshold → order more + regular price; above threshold → don't order + discount.

**Gap in EaseInventory**:
- No dynamic pricing based on inventory levels
- No markdown optimization for slow-moving stock
- No clearance sale automation
- **Features needed**:
  - Inventory-aware pricing rules (if stock > X days supply, suggest discount)
  - Markdown recommendation engine for aging/slow-moving inventory
  - Clearance workflow with progressive discount scheduling

#### From Ch 14: Statistical Learning in Inventory
**Book Insight**: Use historical sales data to learn demand patterns. SAA (Sample Average Approximation) works with just past demand samples — no distribution assumption needed. Feature-based approaches use external signals (day-of-week, weather, promotions) to predict demand.

**Gap in EaseInventory**:
- No demand history analytics
- No forecasting engine
- No feature-based demand prediction
- **Features needed**:
  - Sales velocity calculation per SKU (daily/weekly/monthly)
  - Simple moving average + exponential smoothing forecasts
  - Seasonal pattern detection
  - Days-of-supply metric
  - Reorder point auto-calculation from demand history

#### From Ch 16: Inventory & Financial Flows
**Book Insight**: Inventory ties up working capital. Financial holding cost = unit cost × interest rate. Cash-constrained firms should order less. Trade credit (buy-now-pay-later from supplier) acts like cheap financing. Payment timing affects optimal ordering.

**Gap in EaseInventory**:
- No inventory valuation dashboard (total capital tied up)
- No working capital analysis
- No trade credit tracking with suppliers
- **Features needed**:
  - Inventory valuation report (total value by location, category, age)
  - Working capital impact dashboard (cash tied in inventory vs. revenue)
  - Supplier payment terms tracking (net-30, net-60, etc.)
  - Inventory turnover ratio and GMROI (Gross Margin ROI) metrics
  - Dead stock identification and carrying cost alerts

#### From Ch 17: Behavioral Inventory Management
**Book Insight**: Humans systematically order wrong due to: anchoring on mean demand (pull-to-center), under-weighting in-transit inventory, overprecision in forecasts. Decision support systems can correct these biases.

**Gap in EaseInventory**:
- No decision support for ordering
- No alerts for behavioral biases
- **Features needed**:
  - "Smart Reorder" assistant that shows optimal quantity vs. user's input
  - Pipeline inventory visibility (show in-transit stock prominently)
  - Order history analysis: flag if user consistently under/over-orders
  - Confidence interval display on forecasts (prevent overprecision)

### PART III — CONTEXT-SPECIFIC

#### From Ch 18: Healthcare Inventory
**Book Insight**: Perishable products in multi-location systems need FIFO/FEFO issuing, age-differentiated demand, and lateral transshipment between locations. Relevant for pharma/medical clients.

**Already partially addressed** by perishable features above.
**Additional**: Support lateral transshipment (location-to-location emergency transfers) with approval workflow.

#### From Ch 19: Spare Parts Inventory
**Book Insight**: High-value equipment needs spare parts planning tied to maintenance schedules. Emergency shipments, lateral transshipments, and predictive maintenance integration.

**Gap in EaseInventory**:
- RepairTicket model exists but no spare parts linkage
- No preventive maintenance scheduling
- No spare parts demand forecasting from maintenance history
- **Features needed**:
  - Link spare parts (Product) to RepairTicket types
  - Maintenance schedule → spare parts demand forecast
  - Critical spare parts flagging (stock-or-fail items)

#### From Ch 20: Retail Inventory Systems
**Book Insight**: Key KPIs for retail: on-shelf availability, stockout frequency, inventory turnover, GMROI, days-of-supply. ABC classification, assortment planning, case pack optimization.

**Gap in EaseInventory**:
- No ABC/XYZ classification
- No retail KPI dashboard
- No assortment planning tools
- **Features needed**:
  - ABC classification (by revenue: A=top 80%, B=next 15%, C=bottom 5%)
  - XYZ classification (by demand variability: X=stable, Y=moderate, Z=erratic)
  - Combined ABC-XYZ matrix for inventory strategy
  - Retail KPI dashboard (turnover, GMROI, stockout rate, fill rate)
  - Days-of-supply metric per SKU

#### From Ch 21: Online Retailing
**Book Insight**: Inventory placement across warehouses, order picking optimization (batch picking, zone picking, wave picking), and robotic fulfillment.

**Partially addressed** by Wave model. Additional gaps:
- No inventory placement optimization (which SKUs in which warehouse)
- No picking route optimization
- **Features needed**:
  - SKU-warehouse allocation recommendations based on demand patterns
  - Picking route optimization within wave planning
  - Split-shipment decision support (ship from closest warehouse)

---

## STRATEGIC IMPLEMENTATION PLAN

### Phase 5: Inventory Intelligence (Highest Impact, Foundation for Everything Else)

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| P5-T1 | **Demand Analytics Engine** — Sales velocity, moving averages, seasonal detection per SKU | Large | None |
| P5-T2 | **Safety Stock & Reorder Point Calculator** — Based on demand stats, lead time, service level | Medium | P5-T1 |
| P5-T3 | **ABC/XYZ Classification** — Auto-classify products, matrix dashboard | Medium | P5-T1 |
| P5-T4 | **Inventory KPI Dashboard** — Turnover, GMROI, days-of-supply, fill rate, stockout rate | Large | P5-T1 |
| P5-T5 | **Perishable/Expiry Management** — expiryDate on lots, FEFO picking, near-expiry alerts, waste tracking | Large | None |
| P5-T6 | **Smart Reorder Suggestions** — Auto-generated PO suggestions based on reorder points + lead times | Medium | P5-T2 |
| P5-T7 | **Dead Stock & Slow Mover Detection** — Aging analysis, markdown recommendations | Medium | P5-T1 |

### Phase 6: Supply Chain Optimization

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| P6-T1 | **Multi-Supplier per SKU** — ProductSupplier model, preferred/emergency supplier config | Medium | None |
| P6-T2 | **Supplier Performance Tracking** — Actual vs. promised lead time, quality score | Medium | P6-T1 |
| P6-T3 | **BOM / Kit Management** — BOM model, component availability, kit assembly workflow | Large | None |
| P6-T4 | **Inventory Valuation & Working Capital** — Total value, carrying cost, capital tied up | Medium | None |
| P6-T5 | **Supplier Payment Terms** — Net-30/60/90 tracking, trade credit visibility | Small | None |
| P6-T6 | **Order Smoothing** — Dampen order variability to reduce bullwhip effect | Medium | P5-T1 |

### Phase 7: Advanced Features

| Task | Description | Effort | Dependencies |
|------|-------------|--------|--------------|
| P7-T1 | **Dynamic Pricing Rules** — Inventory-level-based pricing, markdown scheduling | Medium | P5-T1 |
| P7-T2 | **Warehouse Capacity Management** — Capacity per location, utilization dashboard | Medium | None |
| P7-T3 | **Spare Parts Linkage** — Connect repair tickets to spare parts, maintenance-driven forecasting | Medium | None |
| P7-T4 | **Quality Grading on Returns** — Grade A/B/C/Scrap, refurbishment queue | Medium | None |
| P7-T5 | **Supplier Portal** — Read-only access for suppliers to see stock levels & velocity | Large | P6-T1 |
| P7-T6 | **Lost Sales Tracking** — Log stockout events, lost revenue analytics | Small | None |
| P7-T7 | **Decision Support Nudges** — Smart ordering assistant, pipeline visibility, bias alerts | Medium | P5-T2 |
| P7-T8 | **Lateral Transshipment** — Location-to-location emergency transfers with approval | Medium | None |
| P7-T9 | **Inventory Placement Optimizer** — Recommend SKU allocation across warehouses | Large | P5-T1 |

### Phase 4 (Already Planned — Unchanged)

| Task | Description | Status |
|------|-------------|--------|
| P4-T1 | Fleet models (Vehicle, Driver, Trip) | Pending |
| P4-T2 | CycleCount schema + workflow | Pending |
| P4-T3 | Warehouse KPI dashboard | → Merged into P5-T4 |
| P4-T4 | Shipping KPI dashboard | Pending |
| P4-T5 | COD analytics + reconciliation | Pending |
| P4-T6 | Fleet management UI | Pending |
| P4-T7 | Cycle counting UI | Pending |

---

## RECOMMENDED EXECUTION ORDER

```
IMMEDIATE (Phase 5 — Inventory Intelligence):
  P5-T1 → P5-T2 → P5-T3 → P5-T4 → P5-T6 → P5-T7
  P5-T5 (parallel — no dependency)

NEXT (Phase 4 remaining + Phase 6):
  P4-T2 (Cycle Counting) — foundational for accuracy
  P4-T4 (Shipping KPIs)
  P4-T5 (COD analytics)
  P6-T1 → P6-T2 (Supplier optimization)
  P6-T3 (BOM — if manufacturing clients)
  P6-T4 → P6-T5 (Financial visibility)

LATER (Phase 7):
  P7-T1 through P7-T9 based on customer demand
  P4-T1/T6 (Fleet — if delivery clients)
```

---

## KEY INSIGHT: What Makes This a Category-Defining Platform

The book reveals that **no single Indian SaaS platform combines**:
1. Demand forecasting with safety stock optimization
2. ABC/XYZ classification with reorder automation
3. Perishable/expiry management with FEFO
4. Multi-supplier strategy with performance tracking
5. Financial inventory analytics (working capital, GMROI)
6. Behavioral decision support for ordering

Implementing Phase 5 alone would differentiate EaseInventory from competitors like Zoho Inventory, Unicommerce, and Vinculum. Phase 6 adds supply chain intelligence that only enterprise ERPs (SAP, Oracle) typically provide.

The **"Inventory Intelligence" (Phase 5)** is the single most impactful investment — it transforms the platform from a record-keeping system into a decision-support system.
