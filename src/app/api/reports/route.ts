import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ReportService } from '@/services/report.service';

/**
 * GET /api/reports — List all saved reports
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const reports = await ReportService.list(tenantId);
    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('REPORTS_LIST_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/reports — Create a saved report
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const userId = (session.user as any).id;
    if (!tenantId) {
      return NextResponse.json({ message: 'No tenant found' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.name || !body.reportType || !body.format) {
      return NextResponse.json(
        { message: 'Missing required fields: name, reportType, format' },
        { status: 400 },
      );
    }

    const report = await ReportService.create({
      name: body.name,
      reportType: body.reportType,
      filtersJson: body.filtersJson,
      columnsJson: body.columnsJson,
      format: body.format,
      createdById: userId,
      tenantId,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error('REPORTS_CREATE_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal error' }, { status: 400 });
  }
}
