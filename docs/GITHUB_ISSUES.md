# EaseInventory - Product Roadmap & Issues

This document contains all planned GitHub issues for EaseInventory development, organized by Epic/Module.

---

## Epic 1: Inventory Management

### INV-001: Create Inventory (Admin)
**Labels:** `enhancement`, `inventory`, `priority:high`

As an Admin, I can create a new inventory with:
- Name, location, and assigned manager
- Default status: Active
- All operations logged to audit trail

**Acceptance Criteria:**
- [ ] Admin-only permission check
- [ ] Form with name, location, manager dropdown
- [ ] Inventory created with Active status
- [ ] Audit log entry created

---

### INV-002: Inventory Status Management
**Labels:** `enhancement`, `inventory`, `priority:high`

As an Admin, I can:
- Mark empty inventory as deleted
- Mark non-empty inventory as Unoperational or On Hold
- Restart paused inventories

**Acceptance Criteria:**
- [ ] Delete only if inventory is empty
- [ ] Status transitions: Active → OnHold → Unoperational
- [ ] Audit log for all status changes

---

### INV-003: Add Items to Inventory
**Labels:** `enhancement`, `inventory`, `priority:high`

As a Manager, I can add items with:
- Product name, model number, serial number (optional)
- Lot number (optional), pricing (cost, MRP, sale)
- Custom fields (user-defined key-value pairs)

**Acceptance Criteria:**
- [ ] Required fields validation
- [ ] Custom field builder UI
- [ ] Item linked to inventory

---

### INV-004: Inventory-Level Discounts
**Labels:** `enhancement`, `inventory`, `priority:medium`

As an Admin, I can set a blanket discount percentage on an inventory.

**Acceptance Criteria:**
- [ ] Discount applies to all items unless overridden
- [ ] Discount displayed in item listings

---

### INV-005: Item-Level Discount Override
**Labels:** `enhancement`, `inventory`, `priority:medium`

As a Manager, I can:
- Set item-specific discount (overrides inventory discount)
- Exclude items from any discount

**Acceptance Criteria:**
- [ ] Item discount takes priority
- [ ] "Exclude from discount" toggle

---

### INV-006: Inventory Audit Trail
**Labels:** `enhancement`, `inventory`, `priority:medium`

System logs all inventory operations with:
- Timestamp, user, action, old/new values

**Acceptance Criteria:**
- [ ] Log viewable by Admin
- [ ] Filter by date range, user, action type

---

## Epic 2: Repair & Service Center

### REP-001: Create Repair Ticket
**Labels:** `enhancement`, `repairs`, `priority:high`

As a Receptionist, I can create a ticket with:
- Product name, model, serial number
- Customer name, WhatsApp number
- Photo uploads of item condition

**Acceptance Criteria:**
- [ ] Auto-generate unique ticket number
- [ ] QR code for ticket sticker
- [ ] Multiple photo support

---

### REP-002: Ticket Number QR Code
**Labels:** `enhancement`, `repairs`, `priority:high`

System generates printable QR/barcode for each ticket.

**Acceptance Criteria:**
- [ ] QR contains ticket ID
- [ ] Printable sticker format

---

### REP-003: Assign Technician
**Labels:** `enhancement`, `repairs`, `priority:high`

As an Admin/Manager, I can assign tickets to technicians.

**Acceptance Criteria:**
- [ ] Technician dropdown (filtered by role)
- [ ] Reassignment supported

---

### REP-004: Technician Maintenance Logging
**Labels:** `enhancement`, `repairs`, `priority:high`

As a Technician, I can:
- Log maintenance notes
- Add parts used (linked to inventory items)

**Acceptance Criteria:**
- [ ] Notes saved per ticket
- [ ] Parts deducted from inventory

---

### REP-005: Accounts Cost Finalization
**Labels:** `enhancement`, `repairs`, `priority:high`

As an Accountant, I can:
- Review parts and labor
- Set final cost
- Mark ticket Ready for Pickup

**Acceptance Criteria:**
- [ ] Total = Parts + Labor
- [ ] Status change triggers notification

---

### REP-006: WhatsApp Notifications
**Labels:** `enhancement`, `repairs`, `priority:medium`

Automated WhatsApp messages at:
- Ticket created
- Status changes
- Ready for pickup

**Acceptance Criteria:**
- [ ] Integration with WhatsApp Business API
- [ ] Message templates

---

## Epic 3: Invoicing & Billing

### BIL-001: Generate GST Invoice
**Labels:** `enhancement`, `billing`, `priority:high`

As an Accountant, I can generate invoices with:
- Customer details, line items, tax breakdown
- HSN/SAC codes, CGST/SGST/IGST

**Acceptance Criteria:**
- [ ] Auto-calculate tax by state
- [ ] Sequential invoice numbering

---

### BIL-002: Payment Tracking
**Labels:** `enhancement`, `billing`, `priority:high`

Track payment status: Unpaid, Partial, Paid, Overdue.

**Acceptance Criteria:**
- [ ] Partial payment logging
- [ ] Overdue alerts

---

### BIL-003: GSTR-1 Export
**Labels:** `enhancement`, `billing`, `priority:medium`

Export invoices in GSTR-1 compatible format.

**Acceptance Criteria:**
- [ ] CSV/JSON export
- [ ] Date range filter

---

## Epic 4: Delivery Management

### DEL-001: Create Delivery
**Labels:** `enhancement`, `delivery`, `priority:high`

As a Manager, I can create deliveries linked to invoices or repair tickets.

**Acceptance Criteria:**
- [ ] Linked document reference
- [ ] Customer address auto-fill

---

### DEL-002: Delivery Agent Assignment
**Labels:** `enhancement`, `delivery`, `priority:high`

Assign delivery to agents with status tracking.

**Acceptance Criteria:**
- [ ] Status: Pending → In Transit → Delivered
- [ ] Proof upload (photo + signature)

---

## Epic 5: HR & Attendance

### HR-001: Employee Management
**Labels:** `enhancement`, `hr`, `priority:high`

As an Admin, I can add employees with role and salary.

**Acceptance Criteria:**
- [ ] Employee ID auto-generation
- [ ] Role assignment

---

### HR-002: Punch In/Out
**Labels:** `enhancement`, `hr`, `priority:high`

As an Employee, I can punch in/out via app.

**Acceptance Criteria:**
- [ ] Time logging with location (optional)
- [ ] Late mark calculation

---

### HR-003: Leave Application
**Labels:** `enhancement`, `hr`, `priority:medium`

As an Employee, I can apply for leave.

**Acceptance Criteria:**
- [ ] Leave types: Casual, Sick, Earned
- [ ] Manager approval workflow

---

### HR-004: Holiday Calendar
**Labels:** `enhancement`, `hr`, `priority:medium`

As an Admin, I can define company holidays.

**Acceptance Criteria:**
- [ ] National + regional holidays
- [ ] Auto-exclude from attendance

---

### HR-005: Salary Calculation
**Labels:** `enhancement`, `hr`, `priority:medium`

System calculates salary based on attendance.

**Acceptance Criteria:**
- [ ] Formula: (Base / Working Days) × Present - Deductions
- [ ] Monthly payslip generation

---

## Epic 6: Users & Permissions

### USR-001: Predefined Roles
**Labels:** `enhancement`, `users`, `priority:high`

7 predefined roles: Owner, Admin, Manager, Accountant, Technician, Delivery, Viewer.

**Acceptance Criteria:**
- [ ] Role-based route protection
- [ ] UI section hiding

---

### USR-002: Custom Roles
**Labels:** `enhancement`, `users`, `priority:low`

As an Admin, I can create custom roles with granular permissions.

**Acceptance Criteria:**
- [ ] Permission toggle matrix
- [ ] Role assignment to users

---

## Epic 7: Supplier & Consignment

### SUP-001: Supplier Management
**Labels:** `enhancement`, `supplier`, `priority:medium`

Add suppliers with name, contact, GSTIN.

**Acceptance Criteria:**
- [ ] Supplier listing page
- [ ] Link to purchase orders

---

### SUP-002: Consignment Tracking
**Labels:** `enhancement`, `supplier`, `priority:medium`

Track items received on consignment.

**Acceptance Criteria:**
- [ ] Items in/out logging
- [ ] Settlement tracking back to supplier

---

## Epic 8: Infrastructure & Domain Management

### DOM-001: Custom Domain Mapping
**Labels:** `enhancement`, `infrastructure`, `priority:medium`

As an Owner, I can map my own custom domain (e.g., inventory.mybrand.com) to the tenant workspace.

**Acceptance Criteria:**
- [ ] DNS CNAME verification logic
- [ ] SSL certificate auto-provisioning (via Vercel/Cloudflare API)
- [ ] Multi-tenant routing based on Host header

---

## Epic 9: Advanced Logistics & Warehouse

### LOG-001: Inter-inventory Stock Transfer
**Labels:** `enhancement`, `inventory`, `priority:high`

As an Admin, I can transfer stock from one warehouse/location to another.

**Acceptance Criteria:**
- [ ] Transfer request & approval workflow
- [ ] Real-time stock deduction from source and addition to destination
- [ ] Transit status tracking

---

## Epic 10: Mobile App & Attendance

### MOB-001: Biometric App Login
**Labels:** `enhancement`, `mobile`, `priority:medium`

Mobile app support for FaceID/Fingerprint authentication for staff.

**Acceptance Criteria:**
- [ ] Expo/React Native biometric module integration
- [ ] Secure token storage on device

---

### MOB-002: Geo-fenced Attendance
**Labels:** `enhancement`, `hr`, `priority:medium`

Staff can only punch in/out within a defined radius of the warehouse.

**Acceptance Criteria:**
- [ ] GPS coordinate verification
- [ ] Radius setting in Tenant Admin
