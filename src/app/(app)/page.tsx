import { requireUserId } from '@/data/auth';
import { getInsights } from '@/data/insights';
import { periodFromParams } from '@/lib/period';
import { formatMYR } from '@/lib/money';
import { PeriodSelector } from '@/components/period-selector';

const platformLabel = { shopee: 'Shopee', lazada: 'Lazada', others: 'Others' } as const;
const platformPill = { shopee: 'bg-[#EE4D2D]', lazada: 'bg-[#0F146D]', others: 'bg-faint' } as const;
const platformInitial = { shopee: 'S', lazada: 'L', others: 'O' } as const;

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
    { label: 'Gross Sales', value: s.grossSales, net: false },
    { label: 'Withdrawal Income', value: s.withdrawalIncome, net: false },
    { label: 'Total Expenses', value: s.totalExpenses, net: false },
    { label: 'Net Profit', value: s.netProfit, net: true },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em]">Insights</h1>
        <p className="mt-1 text-[13.5px] text-muted">Your business at a glance — all figures in MYR.</p>
      </div>

      <PeriodSelector />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={c.net ? 'metric metric-net' : 'metric'}>
            <div className="text-[12.5px] font-medium text-muted">{c.label}</div>
            <div
              className={`metric-value mt-2.5 ${
                c.net && c.value < 0 ? 'text-down' : ''
              }`}
            >
              {formatMYR(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-[15px] font-semibold">By platform</h3>
        <p className="mb-4 mt-0.5 text-[12.5px] text-muted">
          Gross sales and money actually withdrawn, per marketplace.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th className="r">Gross sales</th>
              <th className="r">Withdrawn</th>
            </tr>
          </thead>
          <tbody>
            {(['shopee', 'lazada', 'others'] as const).map((p) => (
              <tr key={p}>
                <td>
                  <span className="flex items-center gap-2.5 font-medium">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-[7px] text-[10px] font-bold text-white ${platformPill[p]}`}
                    >
                      {platformInitial[p]}
                    </span>
                    {platformLabel[p]}
                  </span>
                </td>
                <td className="r tnum">{formatMYR(s.byPlatform[p].grossSales)}</td>
                <td className="r tnum">{formatMYR(s.byPlatform[p].withdrawalIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
