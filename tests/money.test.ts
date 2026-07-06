import { describe, it, expect } from 'vitest';
import { sumMoney, formatMYR } from '@/lib/money';

describe('sumMoney', () => {
  it('sums without floating point drift', () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([10.10, 20.20, 0.70])).toBe(31);
  });
  it('returns 0 for empty input', () => {
    expect(sumMoney([])).toBe(0);
  });
});

describe('formatMYR', () => {
  it('formats to RM with 2 decimals', () => {
    expect(formatMYR(1234.5)).toBe('RM 1,234.50');
    expect(formatMYR(0)).toBe('RM 0.00');
  });
});
