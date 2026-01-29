import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all holidays
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
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

    // Check if user has admin/manager permissions
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

    // Check if holiday already exists for this date
    const existing = await prisma.holiday.findUnique({
      where: { date: new Date(date) }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'A holiday already exists on this date' },
        { status: 400 }
      );
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        isOptional: isOptional || false
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

// DELETE - Remove a holiday
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ message: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Holiday ID is required' }, { status: 400 });
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
