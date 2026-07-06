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
