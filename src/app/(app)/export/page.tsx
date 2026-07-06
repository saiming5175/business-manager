'use client';

import { useState } from 'react';

export default function ExportPage() {
  const now = new Date();
  const [kind, setKind] = useState('month');
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  const params = new URLSearchParams({ kind });
  if (kind !== 'all') params.set('year', year);
  if (kind === 'month') params.set('month', month);
  const href = `/api/export?${params.toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Export Expenses</h1>
      <div className="flex flex-wrap gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border p-2">
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="all">All time</option>
        </select>
        {kind !== 'all' && (
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-24 rounded border p-2" />
        )}
        {kind === 'month' && (
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded border p-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>
      <a href={href} className="w-fit rounded bg-black px-4 py-3 text-white">Download .xlsx</a>
      <p className="text-sm text-gray-500">
        Columns: Order Number, Date of Purchase, Item, Account, Quantity, Price(RMB), Price(MYR). Sorted by order date ascending.
      </p>
    </div>
  );
}
