import type { Period } from '@/lib/types';

export function dateInPeriod(iso: string, period: Period): boolean {
  if (period.kind === 'all') return true;
  const [y, m] = iso.split('-').map(Number);
  if (period.kind === 'year') return y === period.year;
  return y === period.year && m === period.month;
}

export function yearMonthInPeriod(year: number, month: number, period: Period): boolean {
  if (period.kind === 'all') return true;
  if (period.kind === 'year') return year === period.year;
  return year === period.year && month === period.month;
}

export function periodFromParams(params: { kind?: string; year?: string; month?: string }): Period {
  const now = new Date();
  const yRaw = Number(params.year);
  const year = Number.isFinite(yRaw) ? yRaw : now.getFullYear();
  const mRaw = Number(params.month);
  const month = Number.isFinite(mRaw) ? mRaw : now.getMonth() + 1;
  if (params.kind === 'all') return { kind: 'all' };
  if (params.kind === 'year') return { kind: 'year', year };
  return { kind: 'month', year, month };
}
