-- Phase 3: Returns & Wave Planning Models
-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('CUSTOMER_RETURN', 'RTO', 'EXCHANGE');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'RECEIVED', 'INSPECTING', 'INSPECTED', 'REFUND_INITIATED', 'REFUNDED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WaveStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "return_requests" (
    "id" TEXT NOT NULL,
    "return_number" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "type" "ReturnType" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "inspected_at" TIMESTAMP(3),
    "inspected_by" TEXT,
    "inspection_notes" TEXT,
    "refund_amount" DECIMAL(12,2),
    "refund_mode" TEXT,
    "refunded_at" TIMESTAMP(3),
    "restock_approved" BOOLEAN NOT NULL DEFAULT false,
    "return_shipment_id" TEXT,
    "return_awb" TEXT,
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_request_items" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition_grade" TEXT,
    "restocked" BOOLEAN NOT NULL DEFAULT false,
    "restocked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waves" (
    "id" TEXT NOT NULL,
    "wave_number" TEXT NOT NULL,
    "status" "WaveStatus" NOT NULL DEFAULT 'DRAFT',
    "name" TEXT,
    "carrier_zone" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wave_orders" (
    "id" TEXT NOT NULL,
    "wave_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wave_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "return_requests_return_number_key" ON "return_requests"("return_number");
CREATE INDEX "return_requests_tenant_id_idx" ON "return_requests"("tenant_id");
CREATE INDEX "return_requests_order_id_idx" ON "return_requests"("order_id");
CREATE INDEX "return_requests_status_idx" ON "return_requests"("status");

CREATE INDEX "return_request_items_return_id_idx" ON "return_request_items"("return_id");

CREATE UNIQUE INDEX "waves_wave_number_key" ON "waves"("wave_number");
CREATE INDEX "waves_tenant_id_idx" ON "waves"("tenant_id");
CREATE INDEX "waves_status_idx" ON "waves"("status");

CREATE UNIQUE INDEX "wave_orders_wave_id_order_id_key" ON "wave_orders"("wave_id", "order_id");
CREATE INDEX "wave_orders_wave_id_idx" ON "wave_orders"("wave_id");

-- AddForeignKey
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "return_requests" ADD CONSTRAINT "return_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "waves" ADD CONSTRAINT "waves_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wave_orders" ADD CONSTRAINT "wave_orders_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "waves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wave_orders" ADD CONSTRAINT "wave_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
