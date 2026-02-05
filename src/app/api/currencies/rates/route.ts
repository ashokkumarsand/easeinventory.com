import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Exchange rate API (using exchangerate-api.com - free tier)
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

// GET - Fetch current exchange rates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get stored rates from database
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        symbol: true,
        exchangeRate: true,
        updatedAt: true,
      },
      orderBy: { code: 'asc' },
    });

    // Build rates object
    const rates: Record<string, number> = {};
    currencies.forEach(c => {
      rates[c.code] = Number(c.exchangeRate);
    });

    return NextResponse.json({
      base: 'USD',
      rates,
      currencies,
      lastUpdated: currencies[0]?.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    return NextResponse.json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
  }
}

// POST - Update exchange rates from external API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    // Only admins can update rates
    if (!session?.user || !['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest rates from external API
    const response = await fetch(EXCHANGE_RATE_API);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates from external API');
    }

    const data: ExchangeRateResponse = await response.json();

    // Update rates in database
    const updates = [];
    for (const [code, rate] of Object.entries(data.rates)) {
      updates.push(
        prisma.currency.updateMany({
          where: { code },
          data: { exchangeRate: rate },
        })
      );
    }

    await Promise.all(updates);

    // Fetch updated currencies
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({
      message: 'Exchange rates updated successfully',
      base: data.base,
      date: data.date,
      updatedCount: currencies.length,
      currencies,
    });
  } catch (error) {
    console.error('Update exchange rates error:', error);
    return NextResponse.json({ error: 'Failed to update exchange rates' }, { status: 500 });
  }
}
