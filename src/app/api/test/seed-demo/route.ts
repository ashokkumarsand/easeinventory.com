import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * GET /api/test/seed-demo
 * Idempotent seed endpoint for E2E tests.
 * Creates a demo tenant with a test user, category, products, suppliers, and location.
 * Gated to non-production environments.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // 1. Tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'e2e-test' },
      update: {},
      create: {
        name: 'E2E Test Company',
        slug: 'e2e-test',
        email: 'admin@e2e.local',
        address: '100 Test Lane',
        city: 'Pune',
        primaryColor: '#0070f3',
        gstNumber: '27AABCE1234F1ZP',
      },
    });

    // 2. Test user
    const hashedPassword = await bcrypt.hash('Test123456!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@e2e.local' },
      update: { password: hashedPassword },
      create: {
        email: 'test@e2e.local',
        name: 'E2E Test User',
        password: hashedPassword,
        role: 'OWNER',
        tenantId: tenant.id,
        registrationStatus: 'APPROVED',
      },
    });

    // 3. Category
    const category = await prisma.category.upsert({
      where: { slug_tenantId: { slug: 'electronics', tenantId: tenant.id } },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        tenantId: tenant.id,
      },
    });

    // 4. Products (5)
    const productSeeds = [
      { name: 'Wireless Mouse', slug: 'wireless-mouse', costPrice: 300, salePrice: 599, quantity: 50 },
      { name: 'USB-C Hub', slug: 'usb-c-hub', costPrice: 800, salePrice: 1499, quantity: 30 },
      { name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', costPrice: 1500, salePrice: 2999, quantity: 20 },
      { name: 'Monitor Stand', slug: 'monitor-stand', costPrice: 600, salePrice: 1199, quantity: 15 },
      { name: 'Webcam HD', slug: 'webcam-hd', costPrice: 1200, salePrice: 2499, quantity: 25 },
    ];

    const products = [];
    for (const p of productSeeds) {
      const product = await prisma.product.upsert({
        where: { slug_tenantId: { slug: p.slug, tenantId: tenant.id } },
        update: { quantity: p.quantity },
        create: {
          name: p.name,
          slug: p.slug,
          costPrice: p.costPrice,
          modalPrice: p.costPrice,
          salePrice: p.salePrice,
          quantity: p.quantity,
          tenantId: tenant.id,
          categoryId: category.id,
          isActive: true,
        },
      });
      products.push(product);
    }

    // 5. Suppliers (2) — no compound unique, so findFirst + create
    const supplierSeeds = [
      { name: 'TechParts India', email: 'sales@techparts.in', phone: '+919876543210' },
      { name: 'GlobalSupply Co', email: 'info@globalsupply.com', phone: '+919876543211' },
    ];

    const suppliers = [];
    for (const s of supplierSeeds) {
      let supplier = await prisma.supplier.findFirst({
        where: { name: s.name, tenantId: tenant.id },
      });
      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: { name: s.name, email: s.email, phone: s.phone, tenantId: tenant.id },
        });
      }
      suppliers.push(supplier);
    }

    // 6. Location
    const location = await prisma.location.upsert({
      where: { code_tenantId: { code: 'WH-MAIN', tenantId: tenant.id } },
      update: {},
      create: {
        name: 'Main Warehouse',
        code: 'WH-MAIN',
        type: 'WAREHOUSE',
        tenantId: tenant.id,
        address: '100 Test Lane',
        city: 'Pune',
      },
    });

    return NextResponse.json({
      message: 'E2E seed data ready',
      tenant: { id: tenant.id, slug: tenant.slug },
      user: { id: user.id, email: user.email },
      category: { id: category.id, name: category.name },
      products: products.map(p => ({ id: p.id, name: p.name })),
      suppliers: suppliers.map(s => ({ id: s.id, name: s.name })),
      location: { id: location.id, name: location.name },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
