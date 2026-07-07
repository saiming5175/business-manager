// Centralized, fail-loud reading of the public Supabase env vars.
// These are NEXT_PUBLIC_* and are inlined at build time, so a missing value
// means the deployment was built without them configured. We surface a clear,
// actionable error instead of the cryptic "@supabase/ssr" throw / blank 500.

export interface SupabaseEnv {
  url?: string;
  anonKey?: string;
}

/** Read the public Supabase env vars from process.env (values inlined at build). */
export function readSupabaseEnv(): SupabaseEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/** Names of the required env vars that are missing (empty string counts as missing). */
export function missingSupabaseEnv(env: SupabaseEnv): string[] {
  const missing: string[] = [];
  if (!env.url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return missing;
}

/** Human-readable, actionable message naming the missing vars. */
export function supabaseEnvErrorMessage(missing: string[]): string {
  return (
    `Server misconfiguration: missing Supabase environment variable(s): ${missing.join(', ')}. ` +
    `In Vercel, set them under Settings → Environment Variables for the Production environment, ` +
    `then redeploy with a fresh build (uncheck "Use existing Build Cache"). ` +
    `Locally, set them in .env.local.`
  );
}

/** Return the validated env, or throw a clear error if either var is missing. */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const env = readSupabaseEnv();
  const missing = missingSupabaseEnv(env);
  if (missing.length > 0) {
    throw new Error(supabaseEnvErrorMessage(missing));
  }
  return { url: env.url!, anonKey: env.anonKey! };
}
