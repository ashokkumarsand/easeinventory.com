const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Acme Pro Electronics',
      slug: 'demo',
      email: 'hello@acme.com',
      address: '123 Tech Park, MG Road',
      city: 'Bangalore',
      primaryColor: '#0070f3',
    },
  });

  console.log('Demo tenant created:', tenant.slug);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
