'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

/**
 * Submit button that shows an instant pending state while the form's server
 * action is running, so the user knows their click registered. Must be rendered
 * inside a <form>.
 */
export function SubmitButton({
  children,
  pendingText = 'Saving…',
  icon,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ''} disabled:opacity-70 disabled:cursor-progress`}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : icon}
      {pending ? pendingText : children}
    </button>
  );
}
