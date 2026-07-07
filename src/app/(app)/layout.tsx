import { getCurrentUser } from '@/data/auth';
import { redirect } from 'next/navigation';
import { DesktopSidebar, MobileHeader, MobileBottomNav } from '@/components/app-nav';
import { NavProgress } from '@/components/nav-progress';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavProgress />

      <DesktopSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileHeader />

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">{children}</main>

        <MobileBottomNav />
      </div>
    </div>
  );
}
