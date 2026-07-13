'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { recordAttachmentAction } from '@/app/(app)/expenses/attachment-actions';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

// Uploads the file directly from the browser to Supabase Storage (RLS restricts
// each user to their own {userId}/... folder), then records the metadata row via a
// server action. This bypasses Next.js/Vercel server-action body-size limits that
// caused 500s on receipt photos larger than ~1 MB.
export function AttachmentUpload({ userId, expenseId }: { userId: string; expenseId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState<'receipt' | 'proof_of_payment'>('receipt');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That file is too large (max 20 MB).');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const fileType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image';
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${userId}/${expenseId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      await recordAttachmentAction(expenseId, {
        filePath: path,
        fileType,
        originalFilename: file.name,
        tag,
      });

      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          disabled={busy}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground sm:flex-1"
        />
        <div className="relative sm:w-48">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as 'receipt' | 'proof_of_payment')}
            disabled={busy}
            className="w-full appearance-none pr-8 cursor-pointer"
          >
            <option value="receipt">Receipt</option>
            <option value="proof_of_payment">Proof of Payment</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
