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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Export expenses</h1>
        <p className="mt-1 text-[13.5px] text-muted">Download a spreadsheet of your expenses for a given period.</p>
      </div>

      <div className="card flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="!min-h-0 w-auto rounded-[9px] border border-hair-2 bg-paper px-3 py-2 text-[13px] font-medium"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All time</option>
          </select>
          {kind !== 'all' && (
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-24 !min-h-0 rounded-[9px] border border-hair-2 bg-paper px-3 py-2 text-[13px] font-medium"
            />
          )}
          {kind === 'month' && (
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="!min-h-0 w-auto rounded-[9px] border border-hair-2 bg-paper px-3 py-2 text-[13px] font-medium"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        <a href={href} className="btn-primary w-fit">
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="M8 11l4 4 4-4" />
            <path d="M4 21h16" />
          </svg>
          Download .xlsx
        </a>

        <p className="text-[13px] text-muted">
          Columns: Order Number, Date of Purchase, Item, Account, Quantity, Price(RMB), Price(MYR). Sorted by order date ascending.
        </p>
      </div>
    </div>
  );
}
