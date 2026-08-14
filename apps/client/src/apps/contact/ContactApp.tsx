import { useState, type FormEvent } from 'react';
import { submitContactForm } from '@/lib/apiClient';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Contact window content, wired to the real POST /api/contact → MongoDB
 * flow (coding prompt Phase 4 item 11 — "your legitimate backend-flex
 * moment"). Validation is hand-rolled and deliberately mirrors
 * contactController.ts's `validateContactPayload` on the server (same
 * email regex, same required-field checks, same 5000-char message cap) —
 * per AGENTS.md's backend conventions, this is a route simple enough not
 * to warrant a validation library, so client and server both hand-validate
 * rather than sharing a validation function that doesn't exist yet.
 *
 * Client-side validation exists purely for immediate UX feedback (no round
 * trip needed to catch an empty field) — the server is still the source of
 * truth and re-validates independently; this is a UX optimization, not a
 * security boundary.
 */
export function ContactApp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): string | null => {
    if (name.trim().length < 1) return 'Name is required.';
    if (!EMAIL_RE.test(email)) return 'A valid email is required.';
    if (message.trim().length < 1) return 'Message is required.';
    if (message.length > 5000) return 'Message is too long (max 5000 characters).';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);
    const res = await submitContactForm({ name: name.trim(), email: email.trim(), message: message.trim() });

    if (res.success) {
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setStatus('error');
      setErrorMessage(res.error.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-os-2 text-center">
        <p className="text-os-body font-medium">Message sent.</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Thanks for reaching out — I&rsquo;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-os-3">
      <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
        />
      </label>

      <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
        />
      </label>

      <label className="flex flex-1 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="flex-1 resize-none rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
        />
      </label>

      {status === 'error' && errorMessage && (
        <p role="alert" className="text-os-caption text-[#ff5f57]">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-os-sm bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-body font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
