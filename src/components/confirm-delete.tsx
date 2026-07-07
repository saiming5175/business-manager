'use client';

import { X } from 'lucide-react';

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
      {iconOnly ? (
        <button
          type="submit"
          aria-label={label ?? 'Delete'}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
        >
          <X size={14} />
        </button>
      ) : (
        <button type="submit" className="text-sm font-medium text-red-400 hover:underline">
          {label ?? 'Delete'}
        </button>
      )}
    </form>
  );
}
