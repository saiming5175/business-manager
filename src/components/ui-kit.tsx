import type { ElementType } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Platform } from '@/lib/types';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const platformBadgeLabel: Record<Platform, string> = {
  shopee: 'Shopee',
  lazada: 'Lazada',
  others: 'Others',
};

const badgeStyles: Record<string, string> = {
  Shopee: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Lazada: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Others: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

/** Platform-colored pill badge, matching the Figma `Badge` component. */
export function PlatformBadge({
  platform,
  variant,
}: {
  platform: Platform;
  variant?: 'default' | 'green' | 'amber' | 'indigo';
}) {
  const label = platformBadgeLabel[platform];
  const cls = badgeStyles[label] ?? badgeStyles[variant ?? 'default'];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        cls
      )}
    >
      {label}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  positive,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-white/[0.12] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
          <Icon size={15} />
        </div>
      </div>
      <div>
        <p className="font-mono text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        {delta && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-xs font-medium',
              positive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{delta} vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
