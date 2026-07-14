'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Wraps router.push for filter/tab controls that change the URL. Fires a global
 * `navstart` event so the top NavProgress bar animates immediately, and exposes
 * `pending` (true until the new route's server render commits) so the clicked
 * control can show a spinner. Without this, router.push gave no feedback for the
 * 1–2s it takes the server component to re-render.
 */
export function useFilterNav() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('navstart'));
      }
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  return { navigate, pending };
}
