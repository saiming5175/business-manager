import { describe, it, expect } from 'vitest';
import { missingSupabaseEnv, supabaseEnvErrorMessage } from '@/lib/supabase/env';

describe('missingSupabaseEnv', () => {
  it('lists both vars when nothing is set', () => {
    expect(missingSupabaseEnv({})).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
  });

  it('returns an empty list when both are present', () => {
    expect(missingSupabaseEnv({ url: 'https://x.supabase.co', anonKey: 'key' })).toEqual([]);
  });

  it('treats empty strings as missing', () => {
    expect(missingSupabaseEnv({ url: '', anonKey: 'key' })).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
    ]);
  });

  it('reports only the one that is missing', () => {
    expect(missingSupabaseEnv({ url: 'https://x.supabase.co' })).toEqual([
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
  });
});

describe('supabaseEnvErrorMessage', () => {
  it('names the missing variables and points at Vercel + .env.local', () => {
    const msg = supabaseEnvErrorMessage([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
    expect(msg).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(msg).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(msg).toContain('Vercel');
    expect(msg).toContain('.env.local');
  });
});
