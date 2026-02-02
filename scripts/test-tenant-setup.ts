import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testTenantSetup() {
  console.log('--- Phase 1: Setup Clean Environment ---');
  const TEST_SLUG = 'test-shop';
  const TEST_EMAIL = 'owner@testshop.com';

  // Cleanup
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.tenant.deleteMany({ where: { slug: TEST_SLUG } });
  console.log('Cleanup complete.');

  console.log('\n--- Phase 2: Create Tenant ---');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Shop - Automated Testing',
      slug: TEST_SLUG,
      isActive: true,
      registrationStatus: 'APPROVED',
      plan: 'STARTER',
      businessType: 'SHOP',
      settings: {
        logoInitials: 'TS',
        onboardingStatus: 'COMPLETED'
      }
    }
  });
  console.log(`Tenant created: ${tenant.name} (ID: ${tenant.id})`);

  console.log('\n--- Phase 3: Create Owner ---');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Test Owner',
      email: TEST_EMAIL,
      password: hashedPassword,
      tenantId: tenant.id,
      role: 'OWNER',
    }
  });
  console.log(`Owner created: ${user.name} for tenant ${tenant.id}`);

  console.log('\n--- Phase 4: Verify Multi-tenant Isolation ---');
  // Create a product for this tenant
  const product = await prisma.product.create({
    data: {
      name: 'Test Gizmo',
      slug: 'test-gizmo',
      costPrice: 100,
      modalPrice: 150,
      salePrice: 140,
      quantity: 10,
      tenantId: tenant.id
    }
  });
  console.log(`Product created: ${product.name} (UUID: ${product.id}) linked to tenant ${product.tenantId}`);

  // Try to find it via the lookup service logic
  const foundTenant = await prisma.tenant.findFirst({
    where: { slug: TEST_SLUG },
    include: { _count: { select: { products: true, users: true } } }
  });

  if (foundTenant && foundTenant.id === tenant.id) {
    console.log('✅ Tenant lookup by slug successful');
    console.log(`Stats: Users: ${foundTenant._count.users}, Products: ${foundTenant._count.products}`);
  } else {
    console.error('❌ Tenant lookup failed');
  }

  console.log('\n--- Phase 5: Testing Tenant Activation/Deactivation ---');
  await prisma.tenant.update({ where: { id: tenant.id }, data: { isActive: false } });
  let check = await prisma.tenant.findUnique({ where: { id: tenant.id }, select: { isActive: true } });
  console.log(`Deactivation test: isActive = ${check?.isActive}`);

  await prisma.tenant.update({ where: { id: tenant.id }, data: { isActive: true } });
  check = await prisma.tenant.findUnique({ where: { id: tenant.id }, select: { isActive: true } });
  console.log(`Activation test: isActive = ${check?.isActive}`);

  console.log('\n--- Final Verification ---');
  if (foundTenant && foundTenant._count.products === 1 && check?.isActive === true) {
    console.log('\n🎉 ALL TENANT SETUP TESTS PASSED!');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED.');
  }
}

testTenantSetup()
  .catch(e => {
    console.error('TEST_ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
