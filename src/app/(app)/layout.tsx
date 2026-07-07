import { getCurrentUser } from '@/data/auth';
import { redirect } from 'next/navigation';
import { AppNav } from '@/components/app-nav';
import { NavProgress } from '@/components/nav-progress';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const email = user.email ?? '';
  const initials = email.slice(0, 2).toUpperCase() || 'U';
  const name = email.split('@')[0] || 'Account';

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <NavProgress />

      {/* Mobile top header */}
      <header className="flex items-center justify-between border-b border-hair bg-paper px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-ink text-[15px] font-bold text-white">
            B
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Business Manager</span>
        </div>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-medium text-muted">Sign out</button>
        </form>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[240px] md:shrink-0 md:flex-col md:gap-[3px] md:border-r md:border-hair md:bg-paper md:p-[14px_14px_20px] md:px-[14px] md:py-5">
        <div className="flex items-center gap-[10px] px-2 pb-5 pt-[6px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-ink text-base font-bold text-white">
            B
          </div>
          <b className="text-[15px] font-semibold tracking-[-0.02em]">Business Manager</b>
        </div>

        <div className="px-[10px] pb-1 pt-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">
          Overview
        </div>

        <AppNav />

        <div className="mt-auto flex items-center gap-[10px] border-t border-hair pt-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-hair-2 bg-canvas text-xs font-semibold text-muted">
            {initials}
          </div>
          <div className="text-[12.5px] leading-[1.3]">
            <div className="font-semibold capitalize">{name}</div>
            <form action="/auth/signout" method="post">
              <button className="text-muted">Sign out</button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-canvas px-4 pb-24 pt-4 md:max-w-[1160px] md:px-[34px] md:py-[26px] md:pb-[60px]">
        {children}
      </main>
    </div>
  );
}
