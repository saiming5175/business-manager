import { TrendingUp, Wallet, Receipt, ArrowUpRight } from 'lucide-react';
import { requireUserId } from '@/data/auth';
import { getInsights, getMonthlyTrend } from '@/data/insights';
import { periodFromParams } from '@/lib/period';
import { formatMYR, sumMoney } from '@/lib/money';
import { PeriodSelector } from '@/components/period-selector';
import { PlatformBadge, KpiCard } from '@/components/ui-kit';
import { TrendChart } from '@/components/trend-chart';
import type { Platform } from '@/lib/types';

const PLATFORMS: Platform[] = ['shopee', 'lazada', 'others'];

function pctDelta(current: number, previous: number): { delta: string; positive: boolean } | null {
  if (previous === 0) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change >= 0 ? '+' : '';
  return { delta: `${sign}${change.toFixed(1)}%`, positive: change >= 0 };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const userId = await requireUserId();
  const period = periodFromParams(params);
  const now = new Date();
  const year = period.kind === 'all' ? now.getFullYear() : period.year;

  const [s, trend] = await Promise.all([
    getInsights(userId, period),
    getMonthlyTrend(userId, year),
  ]);

  // Only compute real month-over-month deltas when viewing a specific month.
  let deltas: {
    grossSales: ReturnType<typeof pctDelta>;
    withdrawn: ReturnType<typeof pctDelta>;
    expenses: ReturnType<typeof pctDelta>;
    netProfit: ReturnType<typeof pctDelta>;
  } | null = null;

  if (period.kind === 'month') {
    const currentIdx = period.month - 1;
    if (currentIdx > 0) {
      const current = trend[currentIdx];
      const previous = trend[currentIdx - 1];
      deltas = {
        grossSales: pctDelta(current.grossSales, previous.grossSales),
        withdrawn: pctDelta(current.withdrawn, previous.withdrawn),
        expenses: pctDelta(current.expenses, previous.expenses),
        netProfit: pctDelta(current.netProfit, previous.netProfit),
      };
    }
  }

  const platformRows = PLATFORMS.map((p) => {
    const grossSales = s.byPlatform[p].grossSales;
    const withdrawn = s.byPlatform[p].withdrawalIncome;
    return { platform: p, grossSales, withdrawn, pending: sumMoney([grossSales, -withdrawn]) };
  });
  const totalGrossSales = sumMoney(platformRows.map((r) => r.grossSales));
  const totalWithdrawn = sumMoney(platformRows.map((r) => r.withdrawn));
  const totalPending = sumMoney([totalGrossSales, -totalWithdrawn]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Financial summary by period</p>
        </div>
        <PeriodSelector />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Gross Sales"
          value={formatMYR(s.grossSales)}
          delta={deltas?.grossSales?.delta}
          positive={deltas?.grossSales?.positive}
          icon={TrendingUp}
          color="bg-indigo-500/15 text-indigo-400"
        />
        <KpiCard
          label="Withdrawn"
          value={formatMYR(s.withdrawalIncome)}
          delta={deltas?.withdrawn?.delta}
          positive={deltas?.withdrawn?.positive}
          icon={Wallet}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <KpiCard
          label="Total Expenses"
          value={formatMYR(s.totalExpenses)}
          delta={deltas?.expenses?.delta}
          positive={deltas?.expenses?.positive}
          icon={Receipt}
          color="bg-amber-500/15 text-amber-400"
        />
        <KpiCard
          label="Net Profit"
          value={formatMYR(s.netProfit)}
          delta={deltas?.netProfit?.delta}
          positive={deltas?.netProfit?.positive}
          icon={ArrowUpRight}
          color="bg-violet-500/15 text-violet-400"
        />
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">Monthly Trend</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Sales
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Expenses
            </span>
          </div>
        </div>
        <TrendChart data={trend} year={year} />
      </div>

      {/* Platform Breakdown */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">By Platform</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gross Sales
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Withdrawn
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pending
                </th>
              </tr>
            </thead>
            <tbody>
              {platformRows.map((row, i) => (
                <tr
                  key={row.platform}
                  className={
                    i < platformRows.length - 1
                      ? 'hover:bg-white/[0.02] transition-colors border-b border-border'
                      : 'hover:bg-white/[0.02] transition-colors'
                  }
                >
                  <td className="px-5 py-3.5">
                    <PlatformBadge platform={row.platform} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-foreground">
                    {formatMYR(row.grossSales)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-emerald-400">
                    {formatMYR(row.withdrawn)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-amber-400">
                    {formatMYR(row.pending)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-white/[0.02]">
                <td className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-foreground">
                  {formatMYR(totalGrossSales)}
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-emerald-400">
                  {formatMYR(totalWithdrawn)}
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-amber-400">
                  {formatMYR(totalPending)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
