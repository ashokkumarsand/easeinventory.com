# Changelog

All notable changes to EaseInventory are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 1: Enhanced Audit Trail UI
- **API Endpoints**
  - `GET /api/security/logs` - Fetch security logs with filters (action, user, date range)
  - `GET /api/security/logs/export` - Export audit logs as CSV
- **UI Components**
  - `/dashboard/settings/audit` - Main audit trail page with filtering and export
  - `AuditLogTable` component - Reusable table for displaying audit logs
  - `ActivityFeed` component - Real-time activity widget with polling
- **Lib Changes**
  - Extended `SecurityAction` enum with 40+ action types covering:
    - Authentication (login, logout, password changes)
    - User Management (CRUD, role changes)
    - Custom Roles (create, update, delete)
    - Inventory operations
    - Invoicing operations
    - HR operations
    - Settings changes

#### Phase 2: Custom Role Builder UI
- **Database Changes**
  - Added `CustomRole` model with tenant isolation
  - Added `customRoleId` to User model for custom role assignment
- **API Endpoints**
  - `GET /api/custom-roles` - List all custom roles
  - `POST /api/custom-roles` - Create new custom role
  - `GET /api/custom-roles/[id]` - Get specific custom role
  - `PATCH /api/custom-roles/[id]` - Update custom role
  - `DELETE /api/custom-roles/[id]` - Delete custom role
- **Lib Changes**
  - Added `/lib/check-permission.ts` - Permission checking middleware
  - `checkPermission()` - Check if user has specific permission
  - `requirePermission()` - Throw if user lacks permission
  - `getEffectivePermissions()` - Get all effective permissions for current user
- **UI Components**
  - Updated `/dashboard/settings/roles` with custom role creation
  - `RoleBuilderModal` component - Create/edit custom roles
  - `PermissionMatrix` component - Interactive permission checkbox grid

#### Phase 3: Holiday Calendar & Leave System
- **Database Changes**
  - Added `tenantId` to Holiday model for tenant-specific holidays
  - Added `LeaveBalance` model for tracking leave quotas
- **API Endpoints**
  - `GET /api/hr/leave-balance` - Fetch leave balances
  - `POST /api/hr/leave-balance` - Create/update leave balance
  - `PATCH /api/hr/leave-balance` - Bulk initialize balances
  - `PATCH /api/hr/holidays` - Import India national holidays
- **API Modifications**
  - Updated `POST /api/hr/leaves` - Added balance checking before leave request
  - Updated `PATCH /api/hr/leaves/[id]` - Auto-update balance on approval
  - Updated `/api/hr/holidays` - Added tenant filtering
- **UI Components**
  - `/dashboard/hr/leaves` - Leave management page
  - `LeaveBalanceWidget` component - Display remaining leave quota
  - `LeaveRequestModal` component - Submit leave request form
  - `LeaveApprovalCard` component - Approve/reject leave requests
  - Updated `/dashboard/hr/holidays` - Added "Import India Holidays" button
- **Data**
  - India national holidays (Republic Day, Independence Day, Gandhi Jayanti)
  - India common holidays for 2025 and 2026 (Diwali, Holi, Eid, etc.)

#### Phase 4: WhatsApp Improvements
- **Database Changes**
  - Added `WhatsAppMessage` model for message history tracking
  - Added `WhatsAppOptIn` model for consent management
  - Added `MessageDirection` enum (OUTBOUND, INBOUND)
  - Added `MessageStatus` enum (PENDING, SENT, DELIVERED, READ, FAILED, RETRY_SCHEDULED)
- **API Endpoints**
  - `GET /api/whatsapp/messages` - Fetch message history with stats
  - `GET /api/whatsapp/opt-in` - Check/list opt-in status
  - `POST /api/whatsapp/opt-in` - Record opt-in
  - `DELETE /api/whatsapp/opt-in` - Record opt-out
  - `POST /api/whatsapp/retry` - Retry failed message
  - `GET /api/whatsapp/retry` - Process scheduled retries (cron)
- **Lib Changes**
  - Added retry configuration (`RETRY_CONFIG`)
  - Added message cost tracking (`MESSAGE_COSTS`)
- **UI Components**
  - `/dashboard/communications` - Message history dashboard
  - `MessageHistoryTable` component - Display message history
  - `WhatsAppWidget` component - Quick send widget

### Changed
- Updated Prisma schema with new models and relations
- Enhanced roles page with custom role management

### Security
- All new API endpoints require authentication
- Audit trail logging for sensitive operations
- Permission-based access control for custom roles
- Tenant isolation for all new data models

---

## Data Model Updates

### New Models
```prisma
model CustomRole {
  id, name, description, color, permissions[], isDefault
  tenantId, createdById
  users[]
}

model LeaveBalance {
  id, employeeId, year
  casualTotal/Used, sickTotal/Used, earnedTotal/Used
}

model WhatsAppMessage {
  id, tenantId, direction, phone, messageId
  templateName, messageType, content
  status, sentAt, deliveredAt, readAt, failedAt
  errorMessage, referenceType, referenceId
  retryCount, nextRetryAt, costPaise
}

model WhatsAppOptIn {
  id, tenantId, phone
  optedIn, optInAt, optOutAt, source
}
```

### Modified Models
- `User`: Added `customRoleId` field
- `Holiday`: Added `tenantId` field for tenant-specific holidays
- `Employee`: Added `leaveBalances` relation
- `Tenant`: Added relations for `customRoles`, `holidays`, `whatsappMessages`, `whatsappOptIns`

---

## Migration Notes

After updating the codebase, run:
```bash
npx prisma generate
npx prisma migrate deploy
```

For existing tenants, you may want to:
1. Initialize leave balances for all employees: `PATCH /api/hr/leave-balance`
2. Import India holidays: `PATCH /api/hr/holidays`
