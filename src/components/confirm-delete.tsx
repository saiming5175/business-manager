'use client';

import { X, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function IconButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label={label}
      aria-busy={pending}
      disabled={pending}
      className={
        pending
          ? 'text-red-400'
          : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all active:opacity-80'
      }
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
    </button>
  );
}

function TextButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-busy={pending}
      disabled={pending}
      className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:underline active:opacity-80 disabled:opacity-70"
    >
      {pending && <Loader2 size={12} className="animate-spin" />}
      {pending ? 'Removing…' : label}
    </button>
  );
}

export function ConfirmDelete({
  action,
  label,
  iconOnly,
}: {
  action: () => void;
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('Delete this record?')) e.preventDefault(); }}>
      {iconOnly ? <IconButton label={label ?? 'Delete'} /> : <TextButton label={label ?? 'Delete'} />}
    </form>
  );
}
