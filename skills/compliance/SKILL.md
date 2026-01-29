---
name: compliance
description: Rules and verification logic for ISO 27001, ISO 9001, and Indian GST legal compliance.
---

# Ease Inventory Compliance Skill

This skill ensures that all changes to the Ease Inventory codebase adhere to strictly defined security, quality, and legal standards.

## 🛡️ 1. ISO 27001: Security & Data Protection
- **Encryption at Rest**: All PII (Personally Identifiable Information) must be encrypted using `AES-256-GCM`.
  - Sensitive Fields: `gstNumber`, `phone`, `accountNumber`.
  - Logic: Use `encrypt()` and `decrypt()` from `@/lib/security`.
- **Audit Logging**: Any sensitive modification (CRUD on Tenant, Supplier, User) MUST be logged.
  - Implementation: Use `logSecurityAction()` from `@/lib/audit`.

## 🏆 2. ISO 9001: Quality Management
- **No Broken Pieces**: Unimplemented features must be documented in `TODO.md` and hidden from the UI using feature flags or environment checks.
- **Internationalization**: No hardcoded UI strings. Use `next-intl` (e.g., `t('key')`).
- **Precision**: Financial values must use `Decimal` compatible types (BigInt or string strings) in the DB to avoid float errors.

## ⚖️ 3. Indian GST Legal Guidelines
- **HSN/SAC**: B2B invoices must include a valid HSN/SAC code.
- **Tax Rules**: Automate CGST/SGST vs IGST switching based on the state prefix of the GSTIN.

## 🔍 Verification
Run the verification script to check for compliance regressions:
```bash
bash skills/compliance/scripts/verify.sh
```
