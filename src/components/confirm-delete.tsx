'use client';

export function ConfirmDelete({ action, label = 'Delete' }: { action: () => void; label?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('Delete this record?')) e.preventDefault(); }}>
      <button className="text-sm text-red-600">{label}</button>
    </form>
  );
}
