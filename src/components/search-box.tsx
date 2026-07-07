'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') ?? '';

  function update(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value) {
      sp.set('q', value);
    } else {
      sp.delete('q');
    }
    router.push(`?${sp.toString()}`);
  }

  return (
    <input
      type="text"
      defaultValue={q}
      onChange={(e) => update(e.target.value)}
      placeholder="Search item or order ID"
      className="w-full max-w-xs"
    />
  );
}
