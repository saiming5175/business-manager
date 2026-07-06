import { describe, it, expect } from 'vitest';
import { sortByOrderDateAsc, buildExpenseWorkbook, type ExportExpenseRow } from '@/lib/export';

const rows: ExportExpenseRow[] = [
  { orderId: 'B2', orderDate: '2026-07-20', itemName: 'Widget', paymentAccount: 'business', quantity: 2, costRmb: 30, costMyr: 18.5 },
  { orderId: 'A1', orderDate: '2026-07-05', itemName: 'Gadget', paymentAccount: 'personal', quantity: 1, costRmb: null, costMyr: 9.9 },
];

describe('sortByOrderDateAsc', () => {
  it('sorts ascending by order date', () => {
    const sorted = sortByOrderDateAsc(rows).map((r) => r.orderId);
    expect(sorted).toEqual(['A1', 'B2']);
  });
});

describe('buildExpenseWorkbook', () => {
  it('has the exact header order', async () => {
    const wb = await buildExpenseWorkbook(rows);
    const ws = wb.getWorksheet('Expenses')!;
    const header = ws.getRow(1).values as unknown[];
    expect(header.slice(1)).toEqual([
      'Order Number', 'Date of Purchase', 'Item', 'Account', 'Quantity', 'Price(RMB)', 'Price(MYR)',
    ]);
  });

  it('writes rows sorted ascending with mapped account label and blank RMB', async () => {
    const wb = await buildExpenseWorkbook(rows);
    const ws = wb.getWorksheet('Expenses')!;
    const first = ws.getRow(2).values as unknown[];
    expect(first.slice(1)).toEqual(['A1', '2026-07-05', 'Gadget', 'Personal', 1, '', 9.9]);
    const second = ws.getRow(3).values as unknown[];
    expect(second.slice(1)).toEqual(['B2', '2026-07-20', 'Widget', 'Business', 2, 30, 18.5]);
  });
});
