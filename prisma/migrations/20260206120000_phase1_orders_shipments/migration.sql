-- Phase 1: Orders, Shipments, Carriers, COD Management

-- New Enums
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'ON_HOLD');
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED');
CREATE TYPE "PickStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "CarrierProvider" AS ENUM ('SHIPROCKET', 'DELHIVERY', 'OWN_FLEET');
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO_INITIATED', 'RTO_DELIVERED', 'CANCELLED', 'LOST');
CREATE TYPE "NDRStatus" AS ENUM ('ACTION_REQUIRED', 'REATTEMPT_REQUESTED', 'RTO_REQUESTED', 'RESOLVED');
CREATE TYPE "CODRemittanceStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');

-- Sales Orders
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT,
    "shipping_name" TEXT NOT NULL,
    "shipping_phone" TEXT NOT NULL,
    "shipping_email" TEXT,
    "shipping_address" TEXT NOT NULL,
    "shipping_city" TEXT NOT NULL,
    "shipping_state" TEXT NOT NULL,
    "shipping_pincode" TEXT NOT NULL,
    "shipping_country" TEXT NOT NULL DEFAULT 'India',
    "billing_name" TEXT,
    "billing_phone" TEXT,
    "billing_address" TEXT,
    "billing_city" TEXT,
    "billing_state" TEXT,
    "billing_pincode" TEXT,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_mode" "PaymentMode",
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "is_cod" BOOLEAN NOT NULL DEFAULT false,
    "cod_amount" DECIMAL(12,2),
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "source_location_id" TEXT,
    "invoice_id" TEXT,
    "weight_grams" INTEGER,
    "length_cm" INTEGER,
    "breadth_cm" INTEGER,
    "height_cm" INTEGER,
    "channel" TEXT,
    "notes" TEXT,
    "internal_notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- Sales Order Items
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "sku" TEXT,
    "hsn_code" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "picked_qty" INTEGER NOT NULL DEFAULT 0,
    "packed_qty" INTEGER NOT NULL DEFAULT 0,
    "shipped_qty" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- Pick Lists
CREATE TABLE "pick_lists" (
    "id" TEXT NOT NULL,
    "pick_number" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "status" "PickStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pick_lists_pkey" PRIMARY KEY ("id")
);

-- Pick List Items
CREATE TABLE "pick_list_items" (
    "id" TEXT NOT NULL,
    "pick_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "source_location_id" TEXT,
    "required_qty" INTEGER NOT NULL,
    "picked_qty" INTEGER NOT NULL DEFAULT 0,
    "scanned_barcode" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pick_list_items_pkey" PRIMARY KEY ("id")
);

-- Carrier Accounts
CREATE TABLE "carrier_accounts" (
    "id" TEXT NOT NULL,
    "provider" "CarrierProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT,
    "api_secret" TEXT,
    "api_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "pickup_location_id" TEXT,
    "pickup_location_name" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_accounts_pkey" PRIMARY KEY ("id")
);

-- Shipments
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "shipment_number" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "carrier_account_id" TEXT,
    "carrier_name" TEXT,
    "carrier_order_id" TEXT,
    "courier_company_id" INTEGER,
    "awb_number" TEXT,
    "label_url" TEXT,
    "manifest_url" TEXT,
    "tracking_url" TEXT,
    "weight_grams" INTEGER,
    "length_cm" INTEGER,
    "breadth_cm" INTEGER,
    "height_cm" INTEGER,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "current_event" TEXT,
    "cod_amount" DECIMAL(12,2),
    "cod_collected" BOOLEAN NOT NULL DEFAULT false,
    "cod_remitted_at" TIMESTAMP(3),
    "cod_remittance_id" TEXT,
    "ndr_status" "NDRStatus",
    "ndr_reason" TEXT,
    "ndr_action_taken" TEXT,
    "ndr_attempts" INTEGER NOT NULL DEFAULT 0,
    "eway_bill_number" TEXT,
    "pod_photo" TEXT,
    "pod_signature" TEXT,
    "delivered_at" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "in_transit_at" TIMESTAMP(3),
    "out_for_delivery_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- Shipment Tracking Events
CREATE TABLE "shipment_tracking" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "status_code" TEXT,
    "description" TEXT,
    "location" TEXT,
    "city" TEXT,
    "raw_payload" JSONB,
    "event_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_tracking_pkey" PRIMARY KEY ("id")
);

-- COD Remittance
CREATE TABLE "cod_remittances" (
    "id" TEXT NOT NULL,
    "remittance_number" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "shipments_count" INTEGER NOT NULL,
    "status" "CODRemittanceStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "bank_reference" TEXT,
    "payment_mode" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cod_remittances_pkey" PRIMARY KEY ("id")
);

-- COD Remittance Items
CREATE TABLE "cod_remittance_items" (
    "id" TEXT NOT NULL,
    "remittance_id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "awb_number" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "cod_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cod_remittance_items_pkey" PRIMARY KEY ("id")
);

-- Unique Indexes
CREATE UNIQUE INDEX "sales_orders_order_number_key" ON "sales_orders"("order_number");
CREATE UNIQUE INDEX "pick_lists_pick_number_key" ON "pick_lists"("pick_number");
CREATE UNIQUE INDEX "shipments_shipment_number_key" ON "shipments"("shipment_number");
CREATE UNIQUE INDEX "shipments_awb_number_key" ON "shipments"("awb_number");
CREATE UNIQUE INDEX "cod_remittances_remittance_number_key" ON "cod_remittances"("remittance_number");

-- Regular Indexes
CREATE INDEX "sales_orders_tenant_id_idx" ON "sales_orders"("tenant_id");
CREATE INDEX "sales_orders_customer_id_idx" ON "sales_orders"("customer_id");
CREATE INDEX "sales_orders_status_idx" ON "sales_orders"("status");
CREATE INDEX "sales_orders_fulfillment_status_idx" ON "sales_orders"("fulfillment_status");
CREATE INDEX "sales_orders_created_at_idx" ON "sales_orders"("created_at");
CREATE INDEX "sales_order_items_order_id_idx" ON "sales_order_items"("order_id");
CREATE INDEX "sales_order_items_product_id_idx" ON "sales_order_items"("product_id");
CREATE INDEX "pick_lists_tenant_id_idx" ON "pick_lists"("tenant_id");
CREATE INDEX "pick_lists_order_id_idx" ON "pick_lists"("order_id");
CREATE INDEX "pick_lists_status_idx" ON "pick_lists"("status");
CREATE INDEX "pick_list_items_pick_list_id_idx" ON "pick_list_items"("pick_list_id");
CREATE INDEX "carrier_accounts_tenant_id_idx" ON "carrier_accounts"("tenant_id");
CREATE INDEX "shipments_tenant_id_idx" ON "shipments"("tenant_id");
CREATE INDEX "shipments_order_id_idx" ON "shipments"("order_id");
CREATE INDEX "shipments_awb_number_idx" ON "shipments"("awb_number");
CREATE INDEX "shipments_status_idx" ON "shipments"("status");
CREATE INDEX "shipments_ndr_status_idx" ON "shipments"("ndr_status");
CREATE INDEX "shipment_tracking_shipment_id_idx" ON "shipment_tracking"("shipment_id");
CREATE INDEX "shipment_tracking_event_at_idx" ON "shipment_tracking"("event_at");
CREATE INDEX "cod_remittances_tenant_id_idx" ON "cod_remittances"("tenant_id");
CREATE INDEX "cod_remittances_status_idx" ON "cod_remittances"("status");
CREATE INDEX "cod_remittance_items_remittance_id_idx" ON "cod_remittance_items"("remittance_id");

-- Foreign Keys
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pick_lists" ADD CONSTRAINT "pick_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pick_list_items" ADD CONSTRAINT "pick_list_items_pick_list_id_fkey" FOREIGN KEY ("pick_list_id") REFERENCES "pick_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pick_list_items" ADD CONSTRAINT "pick_list_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pick_list_items" ADD CONSTRAINT "pick_list_items_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "carrier_accounts" ADD CONSTRAINT "carrier_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_carrier_account_id_fkey" FOREIGN KEY ("carrier_account_id") REFERENCES "carrier_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_cod_remittance_id_fkey" FOREIGN KEY ("cod_remittance_id") REFERENCES "cod_remittances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shipment_tracking" ADD CONSTRAINT "shipment_tracking_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cod_remittances" ADD CONSTRAINT "cod_remittances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cod_remittance_items" ADD CONSTRAINT "cod_remittance_items_remittance_id_fkey" FOREIGN KEY ("remittance_id") REFERENCES "cod_remittances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
