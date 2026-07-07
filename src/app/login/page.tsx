'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-ink text-base font-bold text-white">
            B
          </div>
          <span className="text-[16px] font-semibold tracking-[-0.02em]">Business Manager</span>
        </div>
        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="field-label">Email</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label className="flex flex-col">
            <span className="field-label">Password</span>
            <input name="password" type="password" required placeholder="••••••••" />
          </label>
          <button disabled={pending} className="btn-primary w-full justify-center">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
          {state?.error && <p className="text-sm text-down">{state.error}</p>}
        </form>
      </div>
    </main>
  );
}
