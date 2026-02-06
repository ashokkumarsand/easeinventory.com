-- Phase 5: Inventory Intelligence
-- Adds demand analytics, reorder suggestions, KPI snapshots, and product/supplier intelligence fields

-- CreateEnum
CREATE TYPE "DemandPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ReorderSuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DISMISSED', 'CONVERTED_TO_PO');

-- CreateEnum
CREATE TYPE "ReorderUrgency" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- AlterTable: Product — add intelligence fields
ALTER TABLE "products" ADD COLUMN "reorder_point" INTEGER;
ALTER TABLE "products" ADD COLUMN "safety_stock" INTEGER;
ALTER TABLE "products" ADD COLUMN "economic_order_qty" INTEGER;
ALTER TABLE "products" ADD COLUMN "abc_class" TEXT;
ALTER TABLE "products" ADD COLUMN "xyz_class" TEXT;
ALTER TABLE "products" ADD COLUMN "lead_time_days" INTEGER;
ALTER TABLE "products" ADD COLUMN "is_perishable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Supplier — add intelligence fields
ALTER TABLE "suppliers" ADD COLUMN "avg_lead_time_days" INTEGER;
ALTER TABLE "suppliers" ADD COLUMN "reliability_score" DECIMAL(5,2);

-- CreateTable: DemandSnapshot
CREATE TABLE "demand_snapshots" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "period_type" "DemandPeriodType" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "order_count" INTEGER NOT NULL DEFAULT 0,
    "moving_avg_7d" DECIMAL(10,4),
    "moving_avg_30d" DECIMAL(10,4),
    "std_deviation" DECIMAL(10,4),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demand_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ReorderSuggestion
CREATE TABLE "reorder_suggestions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "suggested_qty" INTEGER NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "reorder_point" INTEGER NOT NULL,
    "safety_stock" INTEGER NOT NULL,
    "avg_daily_demand" DECIMAL(10,4) NOT NULL,
    "lead_time_days" INTEGER NOT NULL,
    "estimated_cost" DECIMAL(14,2) NOT NULL,
    "supplier_id" TEXT,
    "status" "ReorderSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "urgency" "ReorderUrgency" NOT NULL DEFAULT 'NORMAL',
    "days_until_stockout" INTEGER,
    "converted_po_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InventoryKpiSnapshot
CREATE TABLE "inventory_kpi_snapshots" (
    "id" TEXT NOT NULL,
    "period_date" TIMESTAMP(3) NOT NULL,
    "period_type" "DemandPeriodType" NOT NULL,
    "inventory_turnover" DECIMAL(10,4),
    "gmroi" DECIMAL(10,4),
    "avg_days_of_supply" DECIMAL(10,2),
    "fill_rate" DECIMAL(5,4),
    "stockout_rate" DECIMAL(5,4),
    "total_inventory_value" DECIMAL(16,2),
    "dead_stock_value" DECIMAL(14,2),
    "dead_stock_count" INTEGER,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demand_snapshots_tenant_id_idx" ON "demand_snapshots"("tenant_id");
CREATE INDEX "demand_snapshots_product_id_period_type_idx" ON "demand_snapshots"("product_id", "period_type");
CREATE INDEX "demand_snapshots_period_start_idx" ON "demand_snapshots"("period_start");
CREATE UNIQUE INDEX "demand_snapshots_product_id_period_type_period_start_key" ON "demand_snapshots"("product_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "reorder_suggestions_tenant_id_idx" ON "reorder_suggestions"("tenant_id");
CREATE INDEX "reorder_suggestions_status_idx" ON "reorder_suggestions"("status");
CREATE INDEX "reorder_suggestions_urgency_idx" ON "reorder_suggestions"("urgency");
CREATE INDEX "reorder_suggestions_product_id_idx" ON "reorder_suggestions"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_kpi_snapshots_tenant_id_period_date_period_type_key" ON "inventory_kpi_snapshots"("tenant_id", "period_date", "period_type");
CREATE INDEX "inventory_kpi_snapshots_tenant_id_idx" ON "inventory_kpi_snapshots"("tenant_id");
CREATE INDEX "inventory_kpi_snapshots_period_date_idx" ON "inventory_kpi_snapshots"("period_date");

-- AddForeignKey
ALTER TABLE "demand_snapshots" ADD CONSTRAINT "demand_snapshots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "demand_snapshots" ADD CONSTRAINT "demand_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reorder_suggestions" ADD CONSTRAINT "reorder_suggestions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reorder_suggestions" ADD CONSTRAINT "reorder_suggestions_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reorder_suggestions" ADD CONSTRAINT "reorder_suggestions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_kpi_snapshots" ADD CONSTRAINT "inventory_kpi_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
