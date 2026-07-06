import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppNav } from '@/components/app-nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl pb-20">
      <header className="flex items-center justify-between p-4">
        <span className="font-semibold">Business Manager</span>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500">Sign out</button>
        </form>
      </header>
      <main className="p-4">{children}</main>
      <AppNav />
    </div>
  );
}
