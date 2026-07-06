import { describe, it, expect } from 'vitest';
import { expenseSchema, salesSchema, withdrawalSchema } from '@/lib/validation';

describe('expenseSchema', () => {
  const base = {
    orderId: 'A1', orderDate: '2026-07-05', itemName: 'Gadget',
    quantity: '1', paymentAccount: 'personal', costRmb: '', costMyr: '9.9',
  };
  it('accepts a valid expense and coerces numbers', () => {
    const p = expenseSchema.parse(base);
    expect(p.quantity).toBe(1);
    expect(p.costMyr).toBe(9.9);
    expect(p.costRmb).toBeNull();
  });
  it('rejects missing order id', () => {
    expect(() => expenseSchema.parse({ ...base, orderId: '' })).toThrow();
  });
  it('rejects missing MYR', () => {
    expect(() => expenseSchema.parse({ ...base, costMyr: '' })).toThrow();
  });
});

describe('withdrawalSchema', () => {
  const base = {
    withdrawalDate: '2026-07-15', platform: 'shopee', amountMyr: '800',
    type: 'auto', orderId: '', note: '',
  };
  it('accepts shopee without order id', () => {
    expect(() => withdrawalSchema.parse(base)).not.toThrow();
  });
  it('requires order id when platform is others', () => {
    expect(() => withdrawalSchema.parse({ ...base, platform: 'others', orderId: '' })).toThrow();
    expect(() => withdrawalSchema.parse({ ...base, platform: 'others', orderId: 'X9' })).not.toThrow();
  });
});

describe('salesSchema', () => {
  it('accepts a valid monthly sales entry', () => {
    const p = salesSchema.parse({
      periodDate: '2026-07-01', platform: 'lazada', grossAmountMyr: '400', note: '',
    });
    expect(p.grossAmountMyr).toBe(400);
  });

  it('accepts an explicit zero gross amount', () => {
    const p = salesSchema.parse({
      periodDate: '2026-07-01', platform: 'lazada', grossAmountMyr: '0', note: '',
    });
    expect(p.grossAmountMyr).toBe(0);
  });

  it('rejects an empty gross amount', () => {
    expect(() => salesSchema.parse({
      periodDate: '2026-07-01', platform: 'lazada', grossAmountMyr: '', note: '',
    })).toThrow();
  });

  it('rejects a whitespace-only gross amount', () => {
    expect(() => salesSchema.parse({
      periodDate: '2026-07-01', platform: 'lazada', grossAmountMyr: '   ', note: '',
    })).toThrow();
  });
});
