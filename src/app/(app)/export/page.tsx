'use client';

import { useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLUMNS = [
  { name: 'Order Number', desc: 'Platform order ID' },
  { name: 'Date of Purchase', desc: 'Transaction date' },
  { name: 'Item', desc: 'Product description' },
  { name: 'Account', desc: 'Payment account used' },
  { name: 'Quantity', desc: 'Units purchased' },
  { name: 'Price (RMB)', desc: 'Cost in Chinese yuan' },
  { name: 'Price (MYR)', desc: 'Cost in Malaysian ringgit' },
];

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-secondary border border-border text-foreground text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function ExportPage() {
  const now = new Date();
  const [kind, setKind] = useState('month');
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  const params = new URLSearchParams({ kind });
  if (kind !== 'all') params.set('year', year);
  if (kind === 'month') params.set('month', month);
  const href = `/api/export?${params.toString()}`;

  const kindOptions = [
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All time' },
  ];
  const monthOptions = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));

  const filenameSuffix =
    kind === 'all' ? 'all-time' : kind === 'year' ? year : `${MONTHS[Number(month) - 1]}-${year}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Export</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Download expense records as a spreadsheet</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <FileSpreadsheet size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Expenses Report (.xlsx)</p>
            <p className="text-xs text-muted-foreground">Sorted by order date ascending</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Period</label>
            <Select value={kind} onChange={setKind} options={kindOptions} className="w-32" />
          </div>
          {kind !== 'all' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-24 bg-secondary border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          {kind === 'month' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">Month</label>
              <Select value={month} onChange={setMonth} options={monthOptions} className="w-32" />
            </div>
          )}
        </div>

        <a
          href={href}
          className="flex items-center gap-2.5 w-fit text-sm font-medium px-5 py-2.5 rounded-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download size={15} />
          {`Download ${filenameSuffix}.xlsx`}
        </a>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Included Columns</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{COLUMNS.length} columns exported per record</p>
        </div>
        <div className="divide-y divide-border">
          {COLUMNS.map((col, i) => (
            <div key={col.name} className="flex items-center gap-4 px-5 py-3">
              <span className="font-mono text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{col.name}</p>
                <p className="text-xs text-muted-foreground">{col.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
