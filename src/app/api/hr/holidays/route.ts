import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// India National Holidays (fixed dates - gazetted)
const INDIA_NATIONAL_HOLIDAYS = [
  { name: 'Republic Day', month: 1, day: 26, isOptional: false },
  { name: 'Independence Day', month: 8, day: 15, isOptional: false },
  { name: 'Gandhi Jayanti', month: 10, day: 2, isOptional: false },
];

// Common Indian holidays (optional/restricted - dates vary by year)
const INDIA_COMMON_HOLIDAYS_2025 = [
  { name: 'Makar Sankranti', date: '2025-01-14', isOptional: true },
  { name: 'Pongal', date: '2025-01-14', isOptional: true },
  { name: 'Maha Shivaratri', date: '2025-02-26', isOptional: true },
  { name: 'Holi', date: '2025-03-14', isOptional: false },
  { name: 'Good Friday', date: '2025-04-18', isOptional: true },
  { name: 'Ram Navami', date: '2025-04-06', isOptional: true },
  { name: 'Mahavir Jayanti', date: '2025-04-10', isOptional: true },
  { name: 'Eid ul-Fitr', date: '2025-03-31', isOptional: false },
  { name: 'Buddha Purnima', date: '2025-05-12', isOptional: true },
  { name: 'Eid ul-Adha', date: '2025-06-07', isOptional: true },
  { name: 'Muharram', date: '2025-07-06', isOptional: true },
  { name: 'Raksha Bandhan', date: '2025-08-09', isOptional: true },
  { name: 'Janmashtami', date: '2025-08-16', isOptional: true },
  { name: 'Milad un-Nabi', date: '2025-09-05', isOptional: true },
  { name: 'Onam', date: '2025-09-05', isOptional: true },
  { name: 'Dussehra', date: '2025-10-02', isOptional: false },
  { name: 'Diwali', date: '2025-10-20', isOptional: false },
  { name: 'Diwali Holiday', date: '2025-10-21', isOptional: false },
  { name: 'Bhai Dooj', date: '2025-10-23', isOptional: true },
  { name: 'Guru Nanak Jayanti', date: '2025-11-05', isOptional: true },
  { name: 'Christmas', date: '2025-12-25', isOptional: false },
];

const INDIA_COMMON_HOLIDAYS_2026 = [
  { name: 'Makar Sankranti', date: '2026-01-14', isOptional: true },
  { name: 'Pongal', date: '2026-01-14', isOptional: true },
  { name: 'Maha Shivaratri', date: '2026-02-15', isOptional: true },
  { name: 'Holi', date: '2026-03-03', isOptional: false },
  { name: 'Good Friday', date: '2026-04-03', isOptional: true },
  { name: 'Ram Navami', date: '2026-03-26', isOptional: true },
  { name: 'Mahavir Jayanti', date: '2026-03-31', isOptional: true },
  { name: 'Eid ul-Fitr', date: '2026-03-20', isOptional: false },
  { name: 'Buddha Purnima', date: '2026-05-01', isOptional: true },
  { name: 'Eid ul-Adha', date: '2026-05-27', isOptional: true },
  { name: 'Muharram', date: '2026-06-25', isOptional: true },
  { name: 'Raksha Bandhan', date: '2026-08-28', isOptional: true },
  { name: 'Janmashtami', date: '2026-09-04', isOptional: true },
  { name: 'Milad un-Nabi', date: '2026-08-26', isOptional: true },
  { name: 'Dussehra', date: '2026-10-20', isOptional: false },
  { name: 'Diwali', date: '2026-11-08', isOptional: false },
  { name: 'Diwali Holiday', date: '2026-11-09', isOptional: false },
  { name: 'Bhai Dooj', date: '2026-11-11', isOptional: true },
  { name: 'Guru Nanak Jayanti', date: '2026-11-24', isOptional: true },
  { name: 'Christmas', date: '2026-12-25', isOptional: false },
];

// GET - List all holidays
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Fetch both global holidays (tenantId: null) and tenant-specific holidays
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        OR: [
          { tenantId: null },
          { tenantId: tenantId },
        ],
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ holidays });

  } catch (error: any) {
    console.error('HOLIDAYS_GET_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// POST - Create new holiday
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { name, date, isOptional } = body;

    if (!name || !date) {
      return NextResponse.json(
        { message: 'Holiday name and date are required' },
        { status: 400 }
      );
    }

    // Check if holiday already exists for this tenant on this date
    const existing = await prisma.holiday.findFirst({
      where: {
        date: new Date(date),
        tenantId: tenantId,
      }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'A holiday already exists on this date for your organization' },
        { status: 400 }
      );
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        isOptional: isOptional || false,
        tenantId: tenantId, // Associate with tenant
      }
    });

    return NextResponse.json({
      message: 'Holiday created successfully',
      holiday
    }, { status: 201 });

  } catch (error: any) {
    console.error('HOLIDAY_POST_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// PATCH - Import India holidays for a year
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!['OWNER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Only owners can import holidays' }, { status: 403 });
    }

    const body = await req.json();
    const year = body.year || new Date().getFullYear();
    const includeOptional = body.includeOptional !== false; // Default to true

    const holidaysToImport: { name: string; date: Date; isOptional: boolean }[] = [];

    // Add national holidays (fixed dates)
    INDIA_NATIONAL_HOLIDAYS.forEach(h => {
      holidaysToImport.push({
        name: h.name,
        date: new Date(year, h.month - 1, h.day),
        isOptional: h.isOptional,
      });
    });

    // Add variable date holidays based on year
    const variableHolidays = year === 2025 ? INDIA_COMMON_HOLIDAYS_2025
                           : year === 2026 ? INDIA_COMMON_HOLIDAYS_2026
                           : INDIA_COMMON_HOLIDAYS_2025; // Fallback

    variableHolidays.forEach(h => {
      if (includeOptional || !h.isOptional) {
        const dateYear = parseInt(h.date.split('-')[0]);
        if (dateYear === year) {
          holidaysToImport.push({
            name: h.name,
            date: new Date(h.date),
            isOptional: h.isOptional,
          });
        }
      }
    });

    // Import holidays
    let imported = 0;
    let skipped = 0;

    for (const holiday of holidaysToImport) {
      try {
        // Check if already exists for this tenant
        const existing = await prisma.holiday.findFirst({
          where: {
            date: holiday.date,
            tenantId: tenantId,
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        await prisma.holiday.create({
          data: {
            name: holiday.name,
            date: holiday.date,
            isOptional: holiday.isOptional,
            tenantId: tenantId,
          }
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({
      message: `Imported ${imported} holidays for ${year}`,
      imported,
      skipped,
      total: holidaysToImport.length,
    });

  } catch (error: any) {
    console.error('HOLIDAY_IMPORT_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Remove a holiday
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userRole = (session.user as any).role;

    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Holiday ID is required' }, { status: 400 });
    }

    // Verify holiday belongs to tenant
    const holiday = await prisma.holiday.findFirst({
      where: {
        id,
        tenantId: tenantId,
      }
    });

    if (!holiday) {
      return NextResponse.json({ message: 'Holiday not found or cannot delete global holidays' }, { status: 404 });
    }

    await prisma.holiday.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Holiday deleted successfully' });

  } catch (error: any) {
    console.error('HOLIDAY_DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
