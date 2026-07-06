import { NextResponse } from 'next/server';
import { requireUserId } from '@/data/auth';
import { periodFromParams } from '@/lib/period';
import { getExpensesForExport } from '@/data/export';
import { buildExpenseWorkbook } from '@/lib/export';

export async function GET(request: Request) {
  const userId = await requireUserId();
  const { searchParams } = new URL(request.url);
  const period = periodFromParams({
    kind: searchParams.get('kind') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
  });

  const rows = await getExpensesForExport(userId, period);
  const wb = await buildExpenseWorkbook(rows);
  const buffer = await wb.xlsx.writeBuffer();

  const stamp =
    period.kind === 'all' ? 'all'
      : period.kind === 'year' ? `${period.year}`
        : `${period.year}-${String(period.month).padStart(2, '0')}`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="expenses-${stamp}.xlsx"`,
    },
  });
}
