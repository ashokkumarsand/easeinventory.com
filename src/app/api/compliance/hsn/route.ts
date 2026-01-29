import { searchHSN } from '@/lib/compliance/hsn-master';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET - Search HSN/SAC Master Directory
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const results = searchHSN(query);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
