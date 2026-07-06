import { requireUserId } from '@/data/auth';
import { getInsights } from '@/data/insights';
import { periodFromParams } from '@/lib/period';
import { formatMYR } from '@/lib/money';
import { PeriodSelector } from '@/components/period-selector';

const platformLabel = { shopee: 'Shopee', lazada: 'Lazada', others: 'Others' } as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const userId = await requireUserId();
  const period = periodFromParams(params);
  const s = await getInsights(userId, period);

  const cards = [
    { label: 'Gross Sales', value: s.grossSales },
    { label: 'Withdrawal Income', value: s.withdrawalIncome },
    { label: 'Total Expenses', value: s.totalExpenses },
    { label: 'Net Profit', value: s.netProfit },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Insights</h1>
      <PeriodSelector />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded border p-3">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className={`text-lg font-semibold ${c.label === 'Net Profit' && c.value < 0 ? 'text-red-600' : ''}`}>
              {formatMYR(c.value)}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-2 font-medium">By platform</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1">Platform</th><th>Gross Sales</th><th>Withdrawn</th>
            </tr>
          </thead>
          <tbody>
            {(['shopee', 'lazada', 'others'] as const).map((p) => (
              <tr key={p} className="border-t">
                <td className="py-1">{platformLabel[p]}</td>
                <td>{formatMYR(s.byPlatform[p].grossSales)}</td>
                <td>{formatMYR(s.byPlatform[p].withdrawalIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
