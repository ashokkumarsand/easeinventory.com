# EaseInventory - System Architecture

> **Last Updated**: January 27, 2026  
> **Version**: 1.0 (Post-MVP)

---

## System Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB["Web App<br/>(Next.js 16)"]
        MOBILE["Mobile App<br/>(Future: React Native)"]
    end
    
    subgraph API["API Layer"]
        ROUTES["Next.js API Routes"]
        AUTH["NextAuth.js"]
        MIDDLEWARE["Tenant Middleware"]
    end
    
    subgraph Services["Service Layer"]
        PRISMA["Prisma ORM"]
        WHATSAPP["WhatsApp Service<br/>(MSG91/Gupshup)"]
        FILE["File Upload<br/>(Supabase Storage)"]
    end
    
    subgraph Data["Data Layer"]
        SUPABASE[("Supabase PostgreSQL")]
        STORAGE[("Supabase Storage")]
    end
    
    WEB --> ROUTES
    MOBILE --> ROUTES
    ROUTES --> AUTH
    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> PRISMA
    ROUTES --> WHATSAPP
    ROUTES --> FILE
    PRISMA --> SUPABASE
    FILE --> STORAGE
```

---

## Multi-Tenant Architecture

```mermaid
flowchart LR
    subgraph Tenants["Tenant Isolation"]
        T1["shop-alpha.easeinventory.com"]
        T2["electronics-hub.easeinventory.com"]
        T3["service-center.easeinventory.com"]
    end
    
    subgraph Routing["Host-based Routing"]
        MW["Middleware<br/>extracts slug"]
        DB["tenantId filter<br/>on all queries"]
    end
    
    subgraph Custom["Custom Domains"]
        CD1["inventory.mybrand.com"]
        DNS["DNS CNAME Verification"]
    end
    
    T1 --> MW
    T2 --> MW
    T3 --> MW
    MW --> DB
    
    CD1 --> DNS
    DNS --> MW
```

---

## API Route Structure

| Category | Endpoint | Methods | Description |
|----------|----------|---------|-------------|
| **Auth** | `/api/register` | POST | Multi-tenant registration |
| **Auth** | `/api/check-slug` | GET | Subdomain availability |
| **Auth** | `/api/auth/[...nextauth]` | * | NextAuth handlers |
| **Onboarding** | `/api/onboarding` | POST | KYC document submission |
| **Users** | `/api/users` | GET, POST | Team roster management |
| **Users** | `/api/users/[id]` | PUT, DELETE | User updates |
| **Products** | `/api/products` | GET, POST | Inventory catalog |
| **Inventory** | `/api/inventory` | GET | Stock overview |
| **Inventory** | `/api/inventory/locations` | GET, POST | Multi-location support |
| **Inventory** | `/api/inventory/transfers` | GET, POST, PATCH | Inter-site transfers |
| **Deliveries** | `/api/deliveries` | GET | Dispatch tracking |
| **Repairs** | `/api/repairs` | GET, POST, PATCH | Service center tickets |
| **Repairs** | `/api/repairs/[id]` | GET, PATCH | Ticket details |
| **Invoices** | `/api/invoices` | GET, POST | Financial billing |
| **Invoices** | `/api/invoices/[id]` | GET, PATCH | Invoice details |
| **Invoices** | `/api/invoices/export/gstr1` | GET | GST compliance export |
| **HR** | `/api/hr/employees` | GET, POST | Employee roster |
| **HR** | `/api/hr/attendance` | GET, POST | Punch in/out |
| **HR** | `/api/hr/leaves` | GET, POST, PATCH | Leave management |
| **HR** | `/api/hr/payroll/calculate` | POST | Salary engine |
| **Suppliers** | `/api/suppliers` | GET, POST | Vendor directory |
| **Suppliers** | `/api/suppliers/[id]` | GET, PATCH | Supplier details |
| **Settlements** | `/api/settlements` | GET, PATCH | Consignment payouts |
| **Tenant** | `/api/tenant/settings` | GET, PATCH | Domain/branding config |
| **Public** | `/api/public/[slug]` | GET | Public tenant pages |

---

## Dashboard Module Map

```mermaid
graph TD
    DASH["Dashboard"]
    
    DASH --> INV["Inventory"]
    DASH --> REP["Repairs"]
    DASH --> INV_M["Invoices"]
    DASH --> DEL["Delivery"]
    DASH --> HR["HR"]
    DASH --> TEAM["Team"]
    DASH --> SUPP["Suppliers"]
    DASH --> SET["Settings"]
    
    INV --> INV_LIST["Product List"]
    INV --> INV_CAT["Categories"]
    INV --> INV_TRANS["Transfers"]
    
    HR --> HR_EMP["Employees"]
    HR --> HR_LEAVE["Leaves"]
    
    DASH --> ATT["Attendance"]
    
    SUPP --> SUPP_LIST["Supplier List"]
    SUPP --> SUPP_SETTLE["Settlements"]
```

---

## Security & RBAC

### Predefined Roles

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access to all modules |
| **MANAGER** | All operations except tenant settings |
| **ACCOUNTANT** | Invoices, Repairs (cost finalization), GSTR-1 |
| **TECHNICIAN** | Repairs (diagnosis, notes, parts) |
| **SALES_STAFF** | Inventory, Invoices, Deliveries |
| **VIEWER** | Read-only access to all modules |
| **STAFF** | Limited inventory and delivery access |

### Implementation

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant Hook as usePermissions()
    participant API as API Route
    participant MW as Middleware
    participant DB as Prisma
    
    UI->>Hook: Check permission
    Hook-->>UI: Show/hide component
    
    UI->>API: Request data
    API->>MW: Validate session
    MW->>MW: Check role in session
    MW->>DB: Apply tenantId filter
    DB-->>API: Filtered data
    API-->>UI: Response
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React, HeroUI, Framer Motion |
| **Styling** | CSS Modules, Tailwind (optional) |
| **State** | React Hooks, Server Components |
| **API** | Next.js Route Handlers |
| **Auth** | NextAuth.js v5 |
| **ORM** | Prisma (PostgreSQL) |
| **Database** | Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **Messaging** | MSG91 / Gupshup (WhatsApp) |
| **QR Codes** | qrcode.react |
| **Charts** | (To be added) |

---

## Deployment Architecture

```mermaid
graph LR
    subgraph Vercel["Vercel Edge"]
        EDGE["Edge Functions"]
        SSR["SSR / ISR"]
    end
    
    subgraph Supabase["Supabase"]
        PG["PostgreSQL"]
        STORAGE["Storage Buckets"]
        AUTH_SB["(Future) Supabase Auth"]
    end
    
    subgraph External["External Services"]
        MSG91["MSG91 API"]
        CF["Cloudflare<br/>(Custom Domains)"]
    end
    
    EDGE --> PG
    SSR --> PG
    SSR --> STORAGE
    SSR --> MSG91
    CF --> EDGE
```
