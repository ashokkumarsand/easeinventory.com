import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Default currencies with formatting info
const DEFAULT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1, decimalPlaces: 2, symbolPosition: 'before', isBase: true },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.92, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.79, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 83.12, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 149.50, decimalPlaces: 0, symbolPosition: 'before' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: 7.24, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.67, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 3.75, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 1.53, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: 1.36, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 1.34, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', exchangeRate: 7.82, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', exchangeRate: 0.88, decimalPlaces: 2, symbolPosition: 'after' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', exchangeRate: 4.72, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', exchangeRate: 35.80, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', exchangeRate: 1328, decimalPlaces: 0, symbolPosition: 'before' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', exchangeRate: 18.65, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', exchangeRate: 4.97, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', exchangeRate: 17.15, decimalPlaces: 2, symbolPosition: 'before' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', exchangeRate: 89.50, decimalPlaces: 2, symbolPosition: 'after' },
];

// GET - List all currencies
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Get currencies from database
      let currencies = await prisma.currency.findMany({
        where: { isActive: true },
        orderBy: [
          { isBase: 'desc' },
          { code: 'asc' }
        ],
      });

      // If no currencies exist, seed with defaults
      if (currencies.length === 0) {
        await prisma.currency.createMany({
          data: DEFAULT_CURRENCIES.map(c => ({
            code: c.code,
            name: c.name,
            symbol: c.symbol,
            exchangeRate: c.exchangeRate,
            decimalPlaces: c.decimalPlaces,
            symbolPosition: c.symbolPosition,
            isBase: c.isBase || false,
            isActive: true,
          })),
          skipDuplicates: true,
        });

        currencies = await prisma.currency.findMany({
          where: { isActive: true },
          orderBy: [
            { isBase: 'desc' },
            { code: 'asc' }
          ],
        });
      }

      return NextResponse.json({ currencies });
    } catch (dbError: any) {
      // If table doesn't exist (P2021), return default currencies
      if (dbError?.code === 'P2021') {
        console.warn('Currency table does not exist, returning defaults');
        return NextResponse.json({ currencies: DEFAULT_CURRENCIES });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Get currencies error:', error);
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 });
  }
}

// POST - Create a new currency
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    // Only admins can create currencies
    if (!session?.user || !['SUPER_ADMIN', 'OWNER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, symbol, exchangeRate, decimalPlaces, symbolPosition } = body;

    if (!code || !name || !symbol) {
      return NextResponse.json(
        { error: 'Code, name, and symbol are required' },
        { status: 400 }
      );
    }

    try {
      // Check if currency already exists
      const existing = await prisma.currency.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Currency with this code already exists' },
          { status: 409 }
        );
      }

      const currency = await prisma.currency.create({
        data: {
          code: code.toUpperCase(),
          name,
          symbol,
          exchangeRate: exchangeRate || 1,
          decimalPlaces: decimalPlaces || 2,
          symbolPosition: symbolPosition || 'before',
          isActive: true,
        },
      });

      return NextResponse.json({ currency }, { status: 201 });
    } catch (dbError: any) {
      // If table doesn't exist (P2021), return error with migration hint
      if (dbError?.code === 'P2021') {
        return NextResponse.json(
          { error: 'Currency table not set up. Please run database migrations.' },
          { status: 503 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Create currency error:', error);
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
  }
}
