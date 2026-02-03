# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EaseInventory is a multi-tenant SaaS inventory management platform built for Indian businesses. It provides inventory tracking, repair management, GST-compliant invoicing, HR/payroll, and supplier management with custom subdomain support per tenant.

## Common Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build
npm run build        # Runs: prisma generate && next build

# Linting
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client after schema changes
npx prisma migrate deploy  # Apply migrations to database
npx prisma studio    # Open Prisma Studio GUI
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19 and React Compiler
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with JWT sessions (credentials + Google OAuth)
- **UI**: HeroUI (component library) + Tailwind CSS 4 + Framer Motion
- **i18n**: next-intl (supports en, hi, ar, pt)
- **Data Tables**: AG Grid for large datasets
- **Charts**: Recharts

### Multi-Tenancy Model
All tenant-scoped data requires `tenantId`. The User model links to Tenant via `tenantId`. API routes must always filter by the authenticated user's `tenantId`.

Key tenant isolation pattern:
```typescript
const data = await prisma.product.findMany({
  where: { tenantId: session.user.tenantId }
});
```

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
  - `api/` - REST API endpoints
  - `dashboard/` - Authenticated tenant dashboard
  - `admin/` - Internal backoffice (SUPER_ADMIN only)
- `src/components/` - React components (landing/, ui/, charts/, etc.)
- `src/lib/` - Utilities (auth.ts, prisma.ts, permissions.ts, security.ts)
- `src/services/` - Business logic services
- `src/hooks/` - Custom React hooks (usePermissions)
- `messages/` - i18n translation files
- `prisma/` - Database schema and migrations

### Authentication Flow
- `src/lib/auth.ts` - NextAuth configuration with JWT callbacks
- Credentials provider with workspace (tenant slug) validation
- Master admin access via env vars `ADMIN_USERNAME`/`ADMIN_PASSWORD`
- Session includes: `tenantId`, `tenantSlug`, `role`, `registrationStatus`, `isInternalStaff`

### Role-Based Access Control
Defined in `src/lib/permissions.ts`. Roles: SUPER_ADMIN, OWNER, MANAGER, ACCOUNTANT, TECHNICIAN, SALES_STAFF, VIEWER, STAFF. Permissions follow `module:action` pattern (e.g., `inventory:view`, `invoices:create`).

### Key Models (Prisma Schema)
- **Tenant** - Business entity with branding, GST info, subscription plan
- **User** - Belongs to tenant, has role and permissions
- **Product** - Inventory items with HSN codes, GST rates, consignment support
- **Invoice/InvoiceItem** - GST-compliant with e-invoicing (IRN) support
- **RepairTicket** - Service/repair tracking workflow
- **Employee/Attendance/Leave/Payslip** - HR module
- **Location/StockAtLocation/StockTransfer** - Multi-location inventory

### India-Specific Features
- GST compliance: HSN codes, GSTR-1 export, e-invoicing
- Payment: UPI integration, Razorpay subscriptions
- Compliance libs: `src/lib/compliance/gst-engine.ts`, `src/lib/compliance/hsn-master.ts`

## Development Guidelines

### Database Queries
Always include `tenantId` in queries for tenant-scoped data. Use Prisma `include` to avoid N+1 queries.

### Path Aliases
Use `@/*` for imports from `src/` (configured in tsconfig.json).

### Environment Variables
See `docs/SCALABILITY_GUIDE.md` for full list. Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
