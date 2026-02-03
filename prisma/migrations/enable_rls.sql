-- ============================================================
-- EaseInventory: Enable Row Level Security (RLS) on All Tables
-- ============================================================
-- Run this in your Supabase SQL Editor
-- This script enables RLS and creates policies for service-role access
-- ============================================================

-- ==================== STEP 1: Enable RLS on All Tables ====================

-- Core Multi-Tenant Tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Inventory Tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_at_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignment_settlements ENABLE ROW LEVEL SECURITY;

-- Customer & Sales Tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Repair Service Tables
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;

-- HR Tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Admin Tables
ALTER TABLE public.backoffice_staffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;


-- ==================== STEP 2: Create Service Role Bypass Policies ====================
-- These policies allow your backend (using service_role key) to access all data

-- Tenants
CREATE POLICY "Service role can do anything on tenants" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

-- Users  
CREATE POLICY "Service role can do anything on users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Accounts
CREATE POLICY "Service role can do anything on accounts" ON public.accounts
  FOR ALL USING (auth.role() = 'service_role');

-- Sessions
CREATE POLICY "Service role can do anything on sessions" ON public.sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Verification Tokens
CREATE POLICY "Service role can do anything on verification_tokens" ON public.verification_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Waitlist
CREATE POLICY "Service role can do anything on waitlist" ON public.waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- Categories
CREATE POLICY "Service role can do anything on categories" ON public.categories
  FOR ALL USING (auth.role() = 'service_role');

-- Products
CREATE POLICY "Service role can do anything on products" ON public.products
  FOR ALL USING (auth.role() = 'service_role');

-- Suppliers
CREATE POLICY "Service role can do anything on suppliers" ON public.suppliers
  FOR ALL USING (auth.role() = 'service_role');

-- Stock Movements
CREATE POLICY "Service role can do anything on stock_movements" ON public.stock_movements
  FOR ALL USING (auth.role() = 'service_role');

-- Locations
CREATE POLICY "Service role can do anything on locations" ON public.locations
  FOR ALL USING (auth.role() = 'service_role');

-- Stock at Locations
CREATE POLICY "Service role can do anything on stock_at_locations" ON public.stock_at_locations
  FOR ALL USING (auth.role() = 'service_role');

-- Stock Transfers
CREATE POLICY "Service role can do anything on stock_transfers" ON public.stock_transfers
  FOR ALL USING (auth.role() = 'service_role');

-- Stock Transfer Items
CREATE POLICY "Service role can do anything on stock_transfer_items" ON public.stock_transfer_items
  FOR ALL USING (auth.role() = 'service_role');

-- Consignment Settlements
CREATE POLICY "Service role can do anything on consignment_settlements" ON public.consignment_settlements
  FOR ALL USING (auth.role() = 'service_role');

-- Customers
CREATE POLICY "Service role can do anything on customers" ON public.customers
  FOR ALL USING (auth.role() = 'service_role');

-- Invoices
CREATE POLICY "Service role can do anything on invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'service_role');

-- Invoice Items
CREATE POLICY "Service role can do anything on invoice_items" ON public.invoice_items
  FOR ALL USING (auth.role() = 'service_role');

-- Deliveries
CREATE POLICY "Service role can do anything on deliveries" ON public.deliveries
  FOR ALL USING (auth.role() = 'service_role');

-- Repair Tickets
CREATE POLICY "Service role can do anything on repair_tickets" ON public.repair_tickets
  FOR ALL USING (auth.role() = 'service_role');

-- Employees
CREATE POLICY "Service role can do anything on employees" ON public.employees
  FOR ALL USING (auth.role() = 'service_role');

-- Attendances
CREATE POLICY "Service role can do anything on attendances" ON public.attendances
  FOR ALL USING (auth.role() = 'service_role');

-- Leaves
CREATE POLICY "Service role can do anything on leaves" ON public.leaves
  FOR ALL USING (auth.role() = 'service_role');

-- Holidays
CREATE POLICY "Service role can do anything on holidays" ON public.holidays
  FOR ALL USING (auth.role() = 'service_role');

-- Payslips
CREATE POLICY "Service role can do anything on payslips" ON public.payslips
  FOR ALL USING (auth.role() = 'service_role');

-- Backoffice Staff
CREATE POLICY "Service role can do anything on backoffice_staffs" ON public.backoffice_staffs
  FOR ALL USING (auth.role() = 'service_role');

-- Promotions
CREATE POLICY "Service role can do anything on promotions" ON public.promotions
  FOR ALL USING (auth.role() = 'service_role');

-- Refund Requests
CREATE POLICY "Service role can do anything on refund_requests" ON public.refund_requests
  FOR ALL USING (auth.role() = 'service_role');

-- Inventory Requests
CREATE POLICY "Service role can do anything on inventory_requests" ON public.inventory_requests
  FOR ALL USING (auth.role() = 'service_role');

-- Security Logs
CREATE POLICY "Service role can do anything on security_logs" ON public.security_logs
  FOR ALL USING (auth.role() = 'service_role');


-- ==================== STEP 3: Create Public Waitlist Policy ====================
-- Allow anonymous users to insert into waitlist (for landing page form)

CREATE POLICY "Anyone can insert into waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);


-- ==================== VERIFICATION ====================
-- Run this to verify RLS is enabled on all tables:

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
