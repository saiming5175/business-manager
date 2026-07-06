import { describe, it, expect } from 'vitest';
import { dateInPeriod, yearMonthInPeriod } from '@/lib/period';
import type { Period } from '@/lib/types';

const all: Period = { kind: 'all' };
const year2026: Period = { kind: 'year', year: 2026 };
const july2026: Period = { kind: 'month', year: 2026, month: 7 };

describe('dateInPeriod', () => {
  it('all matches everything', () => {
    expect(dateInPeriod('2020-01-01', all)).toBe(true);
  });
  it('year matches same year only', () => {
    expect(dateInPeriod('2026-03-15', year2026)).toBe(true);
    expect(dateInPeriod('2025-12-31', year2026)).toBe(false);
  });
  it('month matches same year and month only', () => {
    expect(dateInPeriod('2026-07-01', july2026)).toBe(true);
    expect(dateInPeriod('2026-08-01', july2026)).toBe(false);
    expect(dateInPeriod('2025-07-01', july2026)).toBe(false);
  });
});

describe('yearMonthInPeriod', () => {
  it('filters by year/month integers', () => {
    expect(yearMonthInPeriod(2026, 7, july2026)).toBe(true);
    expect(yearMonthInPeriod(2026, 7, year2026)).toBe(true);
    expect(yearMonthInPeriod(2026, 7, all)).toBe(true);
    expect(yearMonthInPeriod(2026, 8, july2026)).toBe(false);
  });
});
