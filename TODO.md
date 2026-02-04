# Ease Inventory: TODO & Broken Pieces

This file tracks unimplemented features, technical debt, and compliance gaps. Items marked with [ISO] are critical for certification.

## 🛡️ Security & Compliance (ISO 27001 / GST)
- [x] **Data Encryption**: Encrypt `gstNumber` and `phone` in critical APIs (Tenant, Supplier, Register, Onboarding).
- [x] **Audit Logging**: Implemented sensitive data update logging for Tenant settings.
- [x] **Audit Logging Extended**: Extend `PATCH/DELETE` logging to `User` and `Supplier` models.
- [ ] **GSP Production Integration**: Swap Mock GSP client with a live provider (e.g. ClearTax).

## 🏆 Quality Management (ISO 9001)
- [x] **Contact Form**: Implement database storage and email notification in `/api/contact`.
- [x] **Localization**: Moved hardcoded strings to `messages/*.json` in all dashboard pages.
- [x] **Error Boundaries**: Add Global Error Boundaries to dashboard sub-routes to prevent full-page crashes.

## 🛠️ Feature Backlog
- [x] **Report Exports**: Implement PDF export for GST reports (currently only JSON).
- [ ] **Bulk Uploads**: Add CSV import for Products and Suppliers.
- [ ] **WhatsApp Templates**: Get official Meta approval for `invoice_sent` and `payment_reminder` templates.
- [ ] **Multi-Currency UI**: Add currency picker to Settings UI (Logic is in DB but UI needs toggle).
