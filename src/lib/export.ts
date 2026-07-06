import ExcelJS from 'exceljs';
import type { PaymentAccount } from '@/lib/types';

export interface ExportExpenseRow {
  orderId: string;
  orderDate: string; // 'YYYY-MM-DD'
  itemName: string;
  paymentAccount: PaymentAccount;
  quantity: number;
  costRmb: number | null;
  costMyr: number;
}

export function sortByOrderDateAsc(rows: ExportExpenseRow[]): ExportExpenseRow[] {
  return [...rows].sort((a, b) =>
    a.orderDate < b.orderDate ? -1 : a.orderDate > b.orderDate ? 1 : 0,
  );
}

export async function buildExpenseWorkbook(rows: ExportExpenseRow[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Expenses');
  ws.columns = [
    { header: 'Order Number', key: 'orderId', width: 20 },
    { header: 'Date of Purchase', key: 'orderDate', width: 16 },
    { header: 'Item', key: 'itemName', width: 30 },
    { header: 'Account', key: 'account', width: 12 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Price(RMB)', key: 'costRmb', width: 12 },
    { header: 'Price(MYR)', key: 'costMyr', width: 12 },
  ];
  ws.getRow(1).font = { bold: true };

  for (const r of sortByOrderDateAsc(rows)) {
    ws.addRow({
      orderId: r.orderId,
      orderDate: r.orderDate,
      itemName: r.itemName,
      account: r.paymentAccount === 'business' ? 'Business' : 'Personal',
      quantity: r.quantity,
      costRmb: r.costRmb ?? '',
      costMyr: r.costMyr,
    });
  }
  return wb;
}
