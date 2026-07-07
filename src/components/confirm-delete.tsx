'use client';

export function ConfirmDelete({ action, label = 'Delete' }: { action: () => void; label?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('Delete this record?')) e.preventDefault(); }}>
      <button className="text-sm font-medium text-down hover:underline">{label}</button>
    </form>
  );
}
