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
      <div className="relative w-full md:w-2/5 md:self-start md:-translate-x-12">
        <div className="glass-panel relative overflow-visible">

          {/* PHOTO */}
          <div className="glass-panel relative h-[300px] w-full overflow-hidden rounded-os-lg ring-1 ring-[color:var(--color-os-glass-border)] shadow-[0_0_30px_rgba(80,140,255,0.18)]">
            <img
              src={ABOUT_CONTENT.photoUrl}
              alt={`Portrait of ${ABOUT_CONTENT.name}`}
              className="h-full w-full object-cover"
            />

            {/* ONLINE DOT */}
            <span
              aria-hidden="true"
              className="absolute right-os-3 top-os-3 h-4 w-4 rounded-full bg-[#4cd86f] shadow-[0_0_10px_#4cd86f] ring-2 ring-[color:var(--color-os-glass-border)]"
            />
          </div>

          {/* STATUS CARD */}
          <div className="absolute bottom-os-4 right-[-1.5rem] z-10 min-w-[220px] rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-black/65 px-os-4 py-os-3 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">

            <p className="text-xs text-[color:var(--color-os-text-muted)]">
              {ABOUT_CONTENT.status.label}
            </p>

            <div className="mt-os-1">
              {ABOUT_CONTENT.status.lines.map((line, index) => (
                <p
                  key={index}
                  className="text-sm font-medium text-white"
                >
                  {line}
                </p>
              ))}
            </div>

            {/* STATUS DOT */}
            <span
              aria-hidden="true"
              className="absolute bottom-os-3 right-os-3 h-2 w-2 rounded-full bg-[#4cd86f] shadow-[0_0_8px_#4cd86f]"
            />
          </div>

        </div>
      </div>
    </div>
  );
}