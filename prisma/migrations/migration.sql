-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('STOCK_BELOW_REORDER', 'STOCK_BELOW_SAFETY', 'EXPIRY_APPROACHING', 'DEMAND_SPIKE', 'SLOW_MOVER_DETECTED', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "AutomationAction" AS ENUM ('CREATE_PO_SUGGESTION', 'SEND_NOTIFICATION', 'ADJUST_PRICE', 'FLAG_FOR_REVIEW', 'SEND_WEBHOOK');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('INVENTORY_SUMMARY', 'SALES_REPORT', 'SUPPLIER_REPORT', 'CUSTOMER_REPORT', 'FINANCIAL_REPORT', 'STOCK_MOVEMENT');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'EXCEL');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('VIP', 'REGULAR', 'NEW', 'AT_RISK', 'CHURNED');

-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "last_order_date" TIMESTAMP(3),
ADD COLUMN     "lifetime_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "segment" "CustomerSegment" DEFAULT 'NEW',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tier" "CustomerTier" DEFAULT 'BRONZE',
ADD COLUMN     "total_orders" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" TEXT,
    "description" TEXT,
    "user_id" TEXT,
    "metadata" JSONB,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_type" "AutomationTrigger" NOT NULL,
    "condition_json" JSONB,
    "cron_expression" TEXT,
    "action_type" "AutomationAction" NOT NULL,
    "action_config_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(3),
    "trigger_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_logs" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL,
    "action_taken" TEXT NOT NULL,
    "result_json" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "filters_json" JSONB,
    "columns_json" JSONB,
    "format" "ReportFormat" NOT NULL DEFAULT 'CSV',
    "schedule_freq" "ScheduleFrequency",
    "scheduled_emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "next_run_at" TIMESTAMP(3),
    "last_generated_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fail_count" INTEGER NOT NULL DEFAULT 0,
    "last_delivered_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status_code" INTEGER,
    "response_body" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "delivered_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_events_tenant_id_created_at_idx" ON "activity_events"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_events_entity_type_entity_id_idx" ON "activity_events"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "activity_events_type_idx" ON "activity_events"("type");

-- CreateIndex
CREATE INDEX "automation_rules_tenant_id_idx" ON "automation_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "automation_rules_is_active_trigger_type_idx" ON "automation_rules"("is_active", "trigger_type");

-- CreateIndex
CREATE INDEX "automation_logs_rule_id_idx" ON "automation_logs"("rule_id");

-- CreateIndex
CREATE INDEX "automation_logs_tenant_id_created_at_idx" ON "automation_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "saved_reports_tenant_id_idx" ON "saved_reports"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_endpoints_tenant_id_idx" ON "webhook_endpoints"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_endpoints_is_active_idx" ON "webhook_endpoints"("is_active");

-- CreateIndex
CREATE INDEX "webhook_deliveries_endpoint_id_idx" ON "webhook_deliveries"("endpoint_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_tenant_id_created_at_idx" ON "webhook_deliveries"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "customers_segment_idx" ON "customers"("segment");

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_reports" ADD CONSTRAINT "saved_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

