import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export async function requireUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user.id;
}
