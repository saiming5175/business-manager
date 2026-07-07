import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { readSupabaseEnv, missingSupabaseEnv, supabaseEnvErrorMessage } from '@/lib/supabase/env';

export async function middleware(request: NextRequest) {
  // Fail loud but readable if the deployment was built without Supabase env vars,
  // rather than throwing an opaque MIDDLEWARE_INVOCATION_FAILED 500.
  const env = readSupabaseEnv();
  const missing = missingSupabaseEnv(env);
  if (missing.length > 0) {
    const message = supabaseEnvErrorMessage(missing);
    console.error(`[middleware] ${message}`);
    return new NextResponse(message, {
      status: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    env.url!,
    env.anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  if (!user && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/).*)'],
};
