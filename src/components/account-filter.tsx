'use client';

import { useRouter, useSearchParams } from 'next/navigation';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const OPTIONS = [
  { value: '', label: 'All accounts' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
] as const;

export function AccountFilter() {
  const router = useRouter();
  const params = useSearchParams();
  const account = params.get('account') ?? '';

  function update(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) {
      sp.set('account', value);
    } else {
      sp.delete('account');
    }
    router.push(`?${sp.toString()}`);
  }

  return (
    <div className="flex bg-secondary rounded-lg p-1 gap-1 w-fit">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => update(o.value)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
            account === o.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
