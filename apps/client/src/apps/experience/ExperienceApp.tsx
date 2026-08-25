import { EXPERIENCE_CONTENT, EXPERIENCE_PAGE_CONTENT, PROJECTS_CONTENT } from '@/lib/content';
import { LinkGlyph, LightbulbGlyph, CompassGlyph, RocketGlyph, TargetGlyph, CodeGlyph } from '@/os/icons';

/**
 * One tint per timeline entry, cycling if EXPERIENCE_CONTENT ever grows
 * past this list — purely a visual rhythm device (matches the pattern
 * already established in JourneyPipeline.tsx's STAGE_TINTS), not tied to
 * any per-entry meaning.
 */
const TIMELINE_TINTS = ['#a78bfa', '#38bdf8', '#2dd4bf', '#fb923c', '#fb7185'];
const TRAIT_ICONS = [CompassGlyph, RocketGlyph, TargetGlyph];
const TRAIT_TINTS = ['#c084fc', '#38bdf8', '#4ade80'];

/**
 * A highlight renders as a short pill if it reads like a label (no
 * sentence-ending period, reasonably short), otherwise as wrapped prose.
 * This exists because EXPERIENCE_CONTENT.highlights are real full
 * sentences Krishna wrote (not the reference's short tag-style labels),
 * and forcing every sentence into a cramped pill would visually mangle
 * them — see docs/08-content-apps.md's Experience section for the full
 * reasoning.
 */
function isPillLike(text: string) {
  return text.length <= 40 && !text.endsWith('.');
}

/**
 * Experience window — a header card (current role + real company link),
 * a "My Journey" timeline built generically over EXPERIENCE_CONTENT (works
 * whether it holds one entry or several — Krishna adds more directly to
 * content.ts as his history grows, no UI changes needed), a real tech-stack
 * grid derived from PROJECTS_CONTENT (no fabricated libraries), and a
 * closing quote+traits card in Krishna's own words.
 *
 * Deliberately NOT included, per explicit decision during this build: a
 * percentage-based "skill bars" panel (the reference's "What I Do Best")
 * and a fabricated "Impact" stats panel (modules/users/% reduced) — both
 * had no honest data behind them, and KRISHNAOS_HANDS_ON_CONTEXT.md's
 * Phase E notes explicitly warn against percentage skill ratings for the
 * same reason.
 */
export function ExperienceApp() {
  const current = EXPERIENCE_CONTENT[0];
  const { eyebrow, badges, quote, traits } = EXPERIENCE_PAGE_CONTENT;

  // Real company link, sourced from the matching PROJECTS_CONTENT entry
  // rather than a new field on Experience — Udhyog Saathi's canonical URL
  // already lives there once, per the project's "one source of truth"
  // rule (see docs/08-content-apps.md's note on FEATURED_PROJECTS).
  const companyProject = PROJECTS_CONTENT.find((p) => p.title === current.company);
  const companyLink = companyProject?.links.live;

  // Tech stack grid: de-duplicated union of every project's real stack,
  // not a hand-typed list — so it can never claim a library Krishna hasn't
  // actually used in a real project.
  const techStack = Array.from(new Set(PROJECTS_CONTENT.flatMap((p) => p.stack))).sort();

  return (
    <div className="flex flex-col gap-os-5">
      {/* Header row: role/company card on the left, tech-stack grid on the right */}
      <div className="grid grid-cols-1 gap-os-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
            <TargetGlyph className="h-3.5 w-3.5" />
            {eyebrow}
          </span>

          <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">{current.title}</h2>

          <div className="flex items-center gap-os-1">
            <p className="text-os-body font-semibold text-[color:var(--color-os-text-secondary)]">
              {current.company}
            </p>
            {companyLink && (
              <a
                href={companyLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${current.company}`}
                className="text-[color:var(--color-os-accent)] hover:opacity-80"
              >
                <LinkGlyph className="h-4 w-4" />
              </a>
            )}
          </div>

          <p className="text-os-body text-[color:var(--color-os-text-secondary)]">{current.highlights[0]}</p>

          <div className="flex flex-wrap gap-os-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <div className="flex items-center gap-os-2">
            <CodeGlyph className="h-4 w-4 text-[color:var(--color-os-accent)]" />
            <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
              Tech Stack I Use
            </h3>
          </div>
          <div className="flex flex-wrap gap-os-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* My Journey: a vertical rail timeline over every EXPERIENCE_CONTENT
          entry. Built generically over the array (not hardcoded to one
          entry) so adding a second/third role to content.ts later needs
          no UI changes — only the timeline grows. */}
      <div className="flex flex-col gap-os-3">
        <div className="flex items-center gap-os-2">
          <CompassGlyph className="h-4 w-4 text-[color:var(--color-os-accent)]" />
          <h3 className="text-os-title font-semibold text-[color:var(--color-os-text-primary)]">My Journey</h3>
        </div>

        <div className="relative flex flex-col gap-os-4 pl-os-6">
          {/* Connecting rail — a single vertical line behind every dot,
              same dashed-line device JourneyPipeline.tsx uses horizontally. */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-[7px] top-3 w-px"
            style={{
              backgroundImage:
                'repeating-linear-gradient(180deg, var(--color-os-glass-border) 0 6px, transparent 6px 14px)',
            }}
          />

          {EXPERIENCE_CONTENT.map((exp, i) => {
            const tint = TIMELINE_TINTS[i % TIMELINE_TINTS.length];
            const isCurrent = exp.endDate === 'present';

            return (
              <div key={exp.id} className="relative flex flex-col gap-os-2">
                <span
                  aria-hidden
                  className="absolute left-[-1.5rem] top-1.5 h-3.5 w-3.5 rounded-full border-2"
                  style={{ borderColor: tint, backgroundColor: isCurrent ? tint : 'var(--color-os-bg)' }}
                />

                <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
                  <div className="flex flex-col gap-os-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-os-1 lg:w-[220px] lg:shrink-0">
                      <p className="text-os-caption font-semibold" style={{ color: tint }}>
                        {exp.startDate} – {exp.endDate === 'present' ? 'Present' : exp.endDate}
                      </p>
                      <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                        {exp.title}
                      </p>
                      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{exp.company}</p>
                      {isCurrent && (
                        <span className="w-fit rounded-os-full bg-[color:var(--color-os-accent)]/15 px-os-2 py-0.5 text-os-caption font-medium text-[color:var(--color-os-accent)]">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-os-2">
                      {exp.highlights
                        .filter((h) => !isPillLike(h))
                        .map((h, hi) => (
                          <p key={hi} className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                            {h}
                          </p>
                        ))}

                      {exp.highlights.some(isPillLike) && (
                        <div className="flex flex-wrap gap-os-2">
                          {exp.highlights.filter(isPillLike).map((h) => (
                            <span
                              key={h}
                              className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Closing quote + trait cards */}
      <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-[minmax(0,1.3fr)_1fr]">
        <div className="flex flex-col items-start gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-os-full bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]">
            <LightbulbGlyph className="h-6 w-6" />
          </span>
          <div>
            <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">{quote.heading}</p>
            {quote.lines.map((line) => (
              <p key={line} className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3 lg:grid-cols-1">
          {traits.map((trait, i) => {
            const Icon = TRAIT_ICONS[i % TRAIT_ICONS.length];
            const tint = TRAIT_TINTS[i % TRAIT_TINTS.length];
            return (
              <div key={trait.title} className="flex items-start gap-os-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-os-md"
                  style={{ backgroundColor: `${tint}22`, color: tint }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
                    {trait.title}
                  </p>
                  <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{trait.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
