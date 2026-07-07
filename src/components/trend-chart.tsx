'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrendPoint } from '@/data/insights';

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  year,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  year: number;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-muted-foreground mb-2 font-medium">
          {label} {year}
        </p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
            {p.name}: RM {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function TrendChart({ data, year }: { data: MonthlyTrendPoint[]; year: number }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={{ fill: '#6B7898', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: '#6B7898', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v / 1000}k`}
        />
        <Tooltip content={<CustomTooltip year={year} />} />
        <Area type="monotone" dataKey="grossSales" name="Sales" stroke="#6366F1" strokeWidth={2} fill="url(#gSales)" />
        <Area type="monotone" dataKey="netProfit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#gProfit)" />
        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" strokeWidth={2} fill="url(#gExpenses)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
