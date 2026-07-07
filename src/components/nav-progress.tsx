'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Slim top progress bar. Since route-level pending state isn't exposed
 * globally, we approximate it: any `useLinkStatus`-pending nav link dispatches
 * a `navstart` window event when it becomes pending, which grows the bar to
 * ~90%. When the pathname/search actually changes (route committed), the bar
 * snaps to 100% and fades out.
 */
export function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const key = `${pathname}?${searchParams.toString()}`;
  const prevKey = useRef(key);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onStart() {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
      setOpacity(1);
      setWidth(90);
    }
    window.addEventListener('navstart', onStart);
    return () => window.removeEventListener('navstart', onStart);
  }, []);

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;

    setWidth(100);
    fadeTimeout.current = setTimeout(() => {
      setOpacity(0);
      fadeTimeout.current = setTimeout(() => setWidth(0), 250);
    }, 150);
    return () => {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, [key]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2.5px',
        width: `${width}%`,
        background: 'var(--accent)',
        zIndex: 50,
        borderRadius: '0 3px 3px 0',
        transition: 'width 0.2s ease, opacity 0.25s ease',
        opacity,
      }}
    />
  );
}
