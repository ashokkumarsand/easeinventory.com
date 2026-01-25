# EaseInventory - Comprehensive Requirements Document

## 🎯 Project Overview

**EaseInventory** is a multi-tenant SaaS platform for inventory management designed for companies, shops, and service centers. Each registered business gets their own subdomain/custom domain to host their business page and manage inventory, repairs, invoicing, and team operations.

---

## 🏗️ Architecture Overview

### Multi-Tenancy Model
- **Subdomain-based isolation**: `companyname.easeinventory.com`
- **Custom domain support**: Businesses can use their own domains with CNAME mapping
- **Branding options**: Custom logo, company name, colors (Powered by EaseInventory badge for free tier)

### Database Strategy
- **Primary Database**: PostgreSQL (for relational data, ACID compliance)
- **Cache Layer**: Redis (for sessions, real-time data)
- **File Storage**: S3-compatible storage (for images, documents)
- **Search**: Elasticsearch (for product/serial number search)

### Security & Compliance
- Data residency in Indian servers (AWS Mumbai / Azure India Central)
- End-to-end encryption for sensitive data
- Role-based access control (RBAC)
- Audit logging for all operations
- GDPR/Indian Data Protection compliance ready

---

## 📦 Core Modules

### 1. **Multi-Tenant Management**

#### 1.1 Company/Shop Registration
- Business name, type (Shop/Company/Service Center)
- GST number (optional but recommended)
- Business address with pincode
- Primary contact details
- Industry category selection

#### 1.2 Subdomain & Domain Management
- Auto-generated subdomain: `{business-slug}.easeinventory.com`
- Custom domain configuration with SSL
- DNS verification process
- Branding customization (logo, favicon, colors)

#### 1.3 Public Business Page
- Customizable landing page for each business
- Product catalog display (optional)
- Contact form for inquiries
- Operating hours display
- Social media links

---

### 2. **Inventory Management**

#### 2.1 Product Master
| Field | Description |
|-------|-------------|
| Product Name | Name of the item |
| Model Number | Manufacturer model |
| Serial Number | Unique identifier |
| Category | Product category |
| Brand | Manufacturer brand |
| HSN Code | For GST compliance |
| Images | Multiple product images |

#### 2.2 Stock Management
| Field | Description |
|-------|-------------|
| Costing Price | Purchase/cost price |
| Modal Price | MRP/standard price |
| Sale Price | Actual selling price |
| Discount | Discount percentage/amount |
| Stock Quantity | Current stock level |
| Reorder Level | Low stock alert threshold |
| Warehouse/Location | Storage location |

#### 2.3 Stock Movements
- Stock In (Purchase/Returns)
- Stock Out (Sales/Repairs)
- Stock Transfer (between locations)
- Stock Adjustment (damage/loss)
- Complete audit trail

#### 2.4 Supplier Management
- Supplier profiles (e.g., "Ramesh gives 200 products")
- Supplier-wise inventory tracking
- Purchase order management
- Supplier payment tracking

---

### 3. **Service & Repair Management**

#### 3.1 Repair Ticket System
| Field | Description |
|-------|-------------|
| Ticket Number | Auto-generated unique ID |
| Product Details | Name, Model, Serial Number |
| Customer Info | Name, WhatsApp, Email |
| Issue Description | Problem reported |
| Photos | Before repair images |
| Priority | Low/Medium/High/Urgent |
| Assigned Technician | Repair person |

#### 3.2 Repair Workflow
```
Received → Diagnosed → In Repair → Parts Added → QC → Ready → Delivered
```

#### 3.3 Technician Assignment
- Multiple technicians support
- Workload distribution view
- Technician-wise repair tracking
- Performance metrics (e.g., "10 items, 2 serviced by Person A")

#### 3.4 Parts & Maintenance Log
- Parts used in repair
- Labor description
- Time spent
- Cost of parts
- Service charges
- Warranty information

#### 3.5 WhatsApp Integration
- Send ticket confirmation
- Status updates
- Repair completion notification
- Payment reminders
- Rich messages with photos

---

### 4. **Invoicing & Billing**

#### 4.1 Invoice Generation
- Auto-calculated from inventory/repairs
- GST compliant format
- Multiple payment modes
- Partial payment support
- Invoice PDF generation
- Email/WhatsApp sharing

#### 4.2 Delivery Management
- Delivery scheduling
- Delivery person assignment
- Delivery status tracking
- Proof of delivery (signature/photo)
- Delivery charges calculation

#### 4.3 Payment Tracking
- Payment received
- Payment pending
- Payment overdue
- Payment reminders

---

### 5. **Accounting Integration**

#### 5.1 Account Review
- Repair costs submission to accounts
- Parts cost verification
- Profit margin calculation
- Expense categorization

#### 5.2 Financial Reports
- Daily/Weekly/Monthly sales
- Expense reports
- Profit & Loss
- GST reports
- Stock valuation

---

### 6. **HR & Attendance**

#### 6.1 Card Punching System
- QR code based attendance
- Biometric integration ready
- Mobile app check-in/out
- GPS location tracking (optional)

#### 6.2 Attendance Management
- Daily attendance log
- Late arrivals tracking
- Early departures
- Overtime calculation

#### 6.3 Leave & Holiday Management
- Holiday calendar (Indian holidays)
- Leave types (Casual, Sick, Earned)
- Leave application workflow
- Leave balance tracking

#### 6.4 Salary & Payroll
- Attendance-based salary calculation
- Deductions (late, absent)
- Overtime pay
- Salary slip generation

---

### 7. **User & Permission System**

#### 7.1 Roles
| Role | Description |
|------|-------------|
| Super Admin | Platform owner |
| Business Owner | Full access to their tenant |
| Manager | Inventory + Staff management |
| Accountant | Financial operations |
| Technician | Repair operations only |
| Sales Staff | POS and inventory view |
| Viewer | Read-only access |

#### 7.2 Granular Permissions
- Module-level access
- Action-level permissions (Create/Read/Update/Delete)
- Data-level restrictions
- Custom role creation

---

### 8. **Reporting & Analytics**

#### 8.1 Dashboards
- Real-time inventory status
- Sales trends
- Repair pipeline
- Staff performance
- Low stock alerts

#### 8.2 Reports
- Inventory valuation
- Sales analysis
- Repair turnaround time
- Staff attendance
- Financial summary

---

## 🌐 Internationalization (i18n)

### Supported Languages (Phase 1)
- English (Default)
- Hindi
- Tamil
- Telugu
- Marathi
- Gujarati
- Bengali
- Kannada

### Localization Features
- Currency: INR (₹) primary
- Date format: DD/MM/YYYY
- Number format: Indian numbering system (lakhs, crores)
- GST compliance
- Indian phone number validation
- Pincode-based location

---

## 💰 Pricing Tiers

### 🆓 Free Tier
- Up to 100 inventory items
- 1 user
- Basic invoicing
- Subdomain only
- "Powered by EaseInventory" branding
- Community support

### 💼 Starter - ₹499/month
- Up to 1,000 inventory items
- 3 users
- Full invoicing
- Subdomain + Custom domain
- Remove branding
- Email support

### 🏢 Business - ₹1,499/month
- Up to 10,000 inventory items
- 10 users
- Repair management
- WhatsApp integration
- Basic HR features
- Priority support

### 🏭 Enterprise - ₹4,999/month
- Unlimited inventory
- Unlimited users
- All features
- Multi-location support
- Advanced analytics
- API access
- Dedicated support

### 🎯 Custom Plans
- For large enterprises
- On-premise deployment option
- Custom integrations
- SLA guarantees

---

## 🛡️ Security Features

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- Database encryption
- Secure key management

### Access Security
- Multi-factor authentication (MFA)
- Session management
- IP whitelisting (Enterprise)
- SSO integration (Enterprise)

### Compliance
- Data stored in India (Mumbai/Hyderabad regions)
- Regular security audits
- Backup & disaster recovery
- Data export capability

---

## 🚀 Technology Stack Recommendation

### Frontend
- **Framework**: Next.js 14 (React)
- **UI Library**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **i18n**: next-intl

### Backend
- **Framework**: Node.js with NestJS or Go with Gin
- **API**: REST + GraphQL
- **Authentication**: NextAuth.js / Keycloak

### Database
- **Primary**: PostgreSQL 15+ (Supabase or AWS RDS)
- **Cache**: Redis
- **Search**: Meilisearch / Elasticsearch
- **File Storage**: AWS S3 (Mumbai region) / Cloudflare R2

### Infrastructure
- **Hosting**: Vercel (Frontend) + AWS/Railway (Backend)
- **CDN**: Cloudflare
- **Monitoring**: Sentry, Grafana
- **CI/CD**: GitHub Actions

---

## 📱 Future Roadmap

### Phase 2
- Mobile app (React Native)
- Barcode/QR scanner
- POS integration
- Advanced analytics

### Phase 3
- AI-powered demand forecasting
- Automated reorder suggestions
- Voice commands
- Marketplace integration

---

## 🆓 Free Hosting Options

### For MVP/Development
1. **Vercel** - Free tier for Next.js (Frontend)
2. **Railway** - $5 free credits (Backend)
3. **Supabase** - Free tier PostgreSQL (500MB)
4. **Cloudflare** - Free CDN & DNS
5. **Upstash** - Free Redis (10K requests/day)

### For Production (Budget-Friendly)
1. **AWS Free Tier** - 12 months free (EC2, RDS)
2. **DigitalOcean** - $200 free credits (60 days)
3. **Google Cloud** - $300 free credits (90 days)

**Note**: For Indian data residency, AWS Mumbai (ap-south-1) or Azure India Central are recommended.

---

## 📋 Next Steps

1. ✅ Create landing page with features & pricing
2. ⬜ Set up project structure (Next.js)
3. ⬜ Design database schema
4. ⬜ Implement authentication
5. ⬜ Build core inventory module
6. ⬜ Add multi-tenant support
7. ⬜ Implement i18n
8. ⬜ Deploy MVP

---

*Document Version: 1.0*
*Last Updated: January 2026*
