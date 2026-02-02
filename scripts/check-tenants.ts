import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Tenant Testing State ---');
  
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      registrationStatus: true,
      isActive: true
    }
  });

  console.log(`Total Tenants: ${tenants.length}`);
  tenants.forEach((t, i) => {
    console.log(`${i+1}. [${t.registrationStatus}] ${t.name} (slug: ${t.slug}, domain: ${t.customDomain}, active: ${t.isActive})`);
  });

  if (tenants.length === 0) {
    console.log('No tenants found. Setup might be incomplete.');
  }

  const users = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' },
    select: { email: true, name: true }
  });
  console.log(`Super Admins: ${users.length}`);
  users.forEach(u => console.log(`- ${u.name} (${u.email})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
