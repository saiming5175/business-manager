'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Business Manager</h1>
      <form action={action} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email"
          className="rounded border p-3" />
        <input name="password" type="password" required placeholder="Password"
          className="rounded border p-3" />
        <button disabled={pending} className="rounded bg-black p-3 text-white">
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </main>
  );
}
