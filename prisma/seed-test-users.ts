import { PrismaClient, PlanType, TenantStatus, BusinessType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'Test@1234';

interface TenantDef {
  name: string;
  slug: string;
  plan: PlanType;
  businessType: BusinessType;
  setupComplete: boolean;
  owner: { name: string; email: string; role: UserRole };
  subUsers: Array<{ name: string; email: string; role: UserRole }>;
}

const TENANTS: TenantDef[] = [
  {
    name: 'Free Electronics',
    slug: 'free-electronics',
    plan: 'FREE',
    businessType: 'SHOP',
    setupComplete: true,
    owner: { name: 'Free Owner', email: 'owner@free.test', role: 'OWNER' },
    subUsers: [
      { name: 'Free Staff', email: 'staff@free.test', role: 'STAFF' },
      { name: 'Free Viewer', email: 'viewer@free.test', role: 'VIEWER' },
    ],
  },
  {
    name: 'Starter Retail',
    slug: 'starter-retail',
    plan: 'STARTER',
    businessType: 'SHOP',
    setupComplete: true,
    owner: { name: 'Starter Owner', email: 'owner@starter.test', role: 'OWNER' },
    subUsers: [
      { name: 'Starter Manager', email: 'manager@starter.test', role: 'MANAGER' },
      { name: 'Starter Sales', email: 'sales@starter.test', role: 'SALES_STAFF' },
      { name: 'Starter Staff', email: 'staff@starter.test', role: 'STAFF' },
    ],
  },
  {
    name: 'Business Distributors',
    slug: 'business-dist',
    plan: 'BUSINESS',
    businessType: 'DISTRIBUTOR',
    setupComplete: true,
    owner: { name: 'Business Owner', email: 'owner@business.test', role: 'OWNER' },
    subUsers: [
      { name: 'Business Manager', email: 'manager@business.test', role: 'MANAGER' },
      { name: 'Business Accountant', email: 'accountant@business.test', role: 'ACCOUNTANT' },
      { name: 'Business Technician', email: 'tech@business.test', role: 'TECHNICIAN' },
      { name: 'Business Sales', email: 'sales@business.test', role: 'SALES_STAFF' },
      { name: 'Business Viewer', email: 'viewer@business.test', role: 'VIEWER' },
    ],
  },
  {
    name: 'Enterprise Corp',
    slug: 'enterprise-corp',
    plan: 'ENTERPRISE',
    businessType: 'COMPANY',
    setupComplete: true,
    owner: { name: 'Enterprise Owner', email: 'owner@enterprise.test', role: 'OWNER' },
    subUsers: [
      { name: 'Enterprise Manager', email: 'manager@enterprise.test', role: 'MANAGER' },
      { name: 'Enterprise Accountant', email: 'accountant@enterprise.test', role: 'ACCOUNTANT' },
      { name: 'Enterprise Technician', email: 'tech@enterprise.test', role: 'TECHNICIAN' },
      { name: 'Enterprise Sales', email: 'sales@enterprise.test', role: 'SALES_STAFF' },
      { name: 'Enterprise Staff', email: 'staff@enterprise.test', role: 'STAFF' },
      { name: 'Enterprise Viewer', email: 'viewer@enterprise.test', role: 'VIEWER' },
    ],
  },
  // This tenant has setupComplete: false — for testing the setup wizard
  {
    name: 'NewApproved Hardware',
    slug: 'new-approved',
    plan: 'BUSINESS',
    businessType: 'SHOP',
    setupComplete: false,
    owner: { name: 'New Owner', email: 'owner@newapproved.test', role: 'OWNER' },
    subUsers: [],
  },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);

  console.log('\n=== Seeding Test Users ===\n');

  for (const t of TENANTS) {
    // Upsert tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: {
        plan: t.plan,
        isActive: true,
        registrationStatus: TenantStatus.APPROVED,
        settings: {
          onboardingStatus: 'COMPLETED',
          documentsUploaded: true,
          setupComplete: t.setupComplete,
          ...(!t.setupComplete && { setupProgress: {} }),
        },
      },
      create: {
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        businessType: t.businessType,
        isActive: true,
        registrationStatus: TenantStatus.APPROVED,
        settings: {
          onboardingStatus: 'COMPLETED',
          documentsUploaded: true,
          setupComplete: t.setupComplete,
          ...(!t.setupComplete && { setupProgress: {} }),
        },
      },
    });

    // Upsert owner
    await prisma.user.upsert({
      where: { email: t.owner.email },
      update: { password: hash, role: t.owner.role, tenantId: tenant.id, isActive: true },
      create: {
        name: t.owner.name,
        email: t.owner.email,
        password: hash,
        role: t.owner.role,
        tenantId: tenant.id,
        isActive: true,
      },
    });

    // Upsert sub-users
    for (const u of t.subUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { password: hash, role: u.role, tenantId: tenant.id, isActive: true },
        create: {
          name: u.name,
          email: u.email,
          password: hash,
          role: u.role,
          tenantId: tenant.id,
          isActive: true,
        },
      });
    }

    console.log(`  [${t.plan}] ${t.name} (${t.slug}) — ${1 + t.subUsers.length} users${!t.setupComplete ? '  ** SETUP WIZARD **' : ''}`);
  }

  console.log('\nDone!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
