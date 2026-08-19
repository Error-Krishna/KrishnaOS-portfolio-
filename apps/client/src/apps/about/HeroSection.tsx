import { ABOUT_CONTENT } from '@/lib/content';

export function HeroSection() {
  return (
    <div className="flex flex-col gap-os-6 md:flex-row md:items-stretch">
      {/* LEFT COLUMN */}
      <div className="flex w-full flex-col gap-os-3 md:w-3/5 md:pr-12">
        <span className="self-start inline-block rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          {ABOUT_CONTENT.welcomeBadge}
        </span>

        <h1 className="text-os-display font-bold">
          I'm{' '}
          <span className="text-[color:var(--color-os-accent)]">
            Krishna
          </span>{' '}
          Goyal
        </h1>

        <p className="text-os-body text-[color:var(--color-os-text-secondary)]">
          {ABOUT_CONTENT.headline}
        </p>

        <p className="text-os-body text-[color:var(--color-os-text-secondary)]">
          {ABOUT_CONTENT.bio[0]}
        </p>

        <div className="flex flex-wrap gap-os-2">
          {ABOUT_CONTENT.badges.map((badge, i) => (
            <span
              key={i}
              className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN — PHOTO */}
<div className="relative w-full md:w-2/5">
  {/* PHOTO — its own overflow-hidden box, nothing else lives inside it */}
  <div className="glass-panel relative h-[300px] w-full overflow-hidden ring-1 ring-[color:var(--color-os-glass-border)]">
    <img
      src={ABOUT_CONTENT.photoUrl}
      alt={`Portrait of ${ABOUT_CONTENT.name}`}
      className="h-full w-full object-cover"
    />
    <span
      aria-hidden="true"
      className="absolute right-os-3 top-os-3 h-4 w-4 rounded-full bg-[#4cd86f] shadow-[0_0_10px_#4cd86f] ring-2 ring-[color:var(--color-os-glass-border)]"
    />
  </div>

  {/* STATUS CARD — sibling of the photo, not nested inside it, so it isn't clipped */}
  <div className="glass-panel absolute bottom-os-4 right-[-1rem] z-10 min-w-[200px] px-os-4 py-os-3">
    <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
      {ABOUT_CONTENT.status.label}
    </p>
    <div className="mt-os-1">
      {ABOUT_CONTENT.status.lines.map((line, index) => (
        <p key={index} className="text-os-body font-medium text-[color:var(--color-os-text-primary)]">
          {line}
        </p>
      ))}
    </div>
  </div>
</div>
    </div>
  );
}