import { useState, type FormEvent } from "react";
import { submitContactForm } from "@/lib/apiClient";
import { PROFILE_LINKS, CONTACT_PAGE_CONTENT } from "@/lib/content";
import { LinkGlyph, MapPinGlyph, PhoneGlyph, RocketGlyph } from "@/os/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "error";

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
 *
 * Rebuilt for the reference-image redesign: a "Get In Touch" header, a
 * 2x2 info-card grid (Email/Phone/Location/LinkedIn), an "open to
 * opportunities" tag row, and the same form now with an added optional
 * Subject field. Subject is a genuine cross-stack schema addition — see
 * ContactPayload (shared-types), ContactSubmission.ts (Mongoose model),
 * and contactController.ts (server validation), all updated alongside
 * this file — not just a new input with nowhere for the value to go.
 * Krishna confirmed Subject should be optional, matching this form's
 * `required` attribute and the server's non-required schema field.
 *
 * Phone and Location are real (phone confirmed by Krishna for public
 * display this session; it previously existed only in private notes).
 * Location is deliberately shown at country level only ("India"), per
 * Krishna's explicit choice, not the more specific detail also on file
 * privately. Email/LinkedIn reuse PROFILE_LINKS rather than a second copy
 * of those URLs.
 */
export function ContactApp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): string | null => {
    if (name.trim().length < 1) return "Name is required.";
    if (!EMAIL_RE.test(email)) return "A valid email is required.";
    if (message.trim().length < 1) return "Message is required.";
    if (message.length > 5000)
      return "Message is too long (max 5000 characters).";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    const trimmedSubject = subject.trim();
    const res = await submitContactForm({
      name: name.trim(),
      email: email.trim(),
      ...(trimmedSubject.length > 0 ? { subject: trimmedSubject } : {}),
      message: message.trim(),
    });

    if (res.success) {
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setStatus("error");
      setErrorMessage(res.error.message);
    }
  };

  if (status === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-os-2 text-center">
        <p className="text-os-body font-medium">Message sent.</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Thanks for reaching out — I&rsquo;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const { tagline, phone, location, opportunityLabel, opportunityTags } =
    CONTACT_PAGE_CONTENT;

  return (
    <div className="grid grid-cols-1 gap-os-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* Left column: header, info cards, opportunity tags */}
      <div className="flex flex-col gap-os-4">
        <div className="flex flex-col gap-os-2">
          <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
            <RocketGlyph className="h-3.5 w-3.5" />
            Let&rsquo;s Connect
          </span>
          <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
            Get{" "}
            <span className="text-[color:var(--color-os-accent)]">
              In Touch
            </span>
          </h2>
          <p className="max-w-sm text-os-body text-[color:var(--color-os-text-secondary)]">
            {tagline}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-os-3">
          <a
            href={PROFILE_LINKS.email}
            className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3 transition-colors hover:border-[color:var(--color-os-accent)]"
          >
            <span className="flex items-center gap-os-1 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              <LinkGlyph className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="truncate text-os-caption text-[color:var(--color-os-text-secondary)]">
              {PROFILE_LINKS.email.replace("mailto:", "")}
            </span>
          </a>

          <div className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
            <span className="flex items-center gap-os-1 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              <PhoneGlyph className="h-3.5 w-3.5" />
              Phone
            </span>
            <span className="text-os-caption text-[color:var(--color-os-text-secondary)]">
              {phone}
            </span>
          </div>

          <div className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
            <span className="flex items-center gap-os-1 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              <MapPinGlyph className="h-3.5 w-3.5" />
              Location
            </span>
            <span className="text-os-caption text-[color:var(--color-os-text-secondary)]">
              {location}
            </span>
          </div>

          <a
            href={PROFILE_LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3 transition-colors hover:border-[color:var(--color-os-accent)]"
          >
            <span className="flex items-center gap-os-1 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              <LinkGlyph className="h-3.5 w-3.5" />
              LinkedIn
            </span>
            <span className="truncate text-os-caption text-[color:var(--color-os-text-secondary)]">
              {PROFILE_LINKS.linkedin.replace("https://", "")}
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-os-2 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
            {opportunityLabel}
          </p>
          <div className="flex flex-wrap gap-os-2">
            {opportunityTags.map((tag) => (
              <span
                key={tag}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-0.5 text-os-caption text-[color:var(--color-os-text-secondary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: the real working form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
      >
        <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
          Send me a message
        </h3>

        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
          />
        </label>

        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
          />
        </label>

        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          Subject{" "}
          <span className="text-[color:var(--color-os-text-tertiary)]">
            (optional)
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
          />
        </label>

        <label className="flex flex-1 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="flex-1 resize-none rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-body text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
          />
        </label>

        {status === "error" && errorMessage && (
          <p
            role="alert"
            className="text-os-caption text-[color:var(--color-os-danger)]"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-os-sm bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-body font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send Message →"}
        </button>
      </form>
    </div>
  );
}
