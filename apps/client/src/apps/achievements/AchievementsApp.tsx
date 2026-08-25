import { ACHIEVEMENTS_CONTENT, ACHIEVEMENTS_PAGE_CONTENT, CERTIFICATIONS_CONTENT } from '@/lib/content';
import { useWindowStore } from '@/store/useWindowStore';
import { AchievementsGlyph, UsersGlyph, TargetGlyph, LightbulbGlyph } from '@/os/icons';

/**
 * Achievements window — a header, a computed stat row, a two-column grid
 * of real achievement tiles, and a closing quote card. Unlike Education,
 * this page isn't covered by KRISHNAOS_HANDS_ON_CONTEXT.md's "keep it
 * simple" instruction, so it follows the same richer dashboard treatment
 * as Skills/Experience.
 *
 * Two entries were added to ACHIEVEMENTS_CONTENT for this build — "Open
 * Source Contributor" and "Continuous Learner" — after Krishna explicitly
 * confirmed both as real and asked to use the reference's exact wording,
 * unlike Skills'/Experience's invented-content refusals where nothing
 * unconfirmed was added.
 *
 * Stat numbers are computed, not copied from the reference image:
 * - Achievements = ACHIEVEMENTS_CONTENT.length
 * - Certifications = CERTIFICATIONS_CONTENT.length (the two real
 *   certificates, not a guess)
 * - "Hackathons" reads as a live count of achievements whose title
 *   contains "Hackathon"/"Techathon" rather than a hardcoded "3" — today
 *   that's EY Techathon 5.0 + Smart India Hackathon 2023 = 2, which is
 *   honestly lower than the reference's "3" but reflects what's actually
 *   recorded (see docs/08-content-apps.md for the full reasoning).
 * - Learning = fixed label "∞", matching Skills' "Always" stat card
 *   convention of using a qualitative label rather than a fabricated
 *   number for an open-ended claim.
 *
 * The closing "Let's build more →" CTA is a real button wired to
 * `useWindowStore.openWindow('projects')`, not decorative text styled to
 * look clickable — the reference doesn't specify a destination, and
 * rendering an inert-looking button would have been misleading UI.
 * Projects is the natural real destination for "see more of what I've
 * built."
 */
export function AchievementsApp() {
  const { eyebrow, tagline, quote, ctaLabel } = ACHIEVEMENTS_PAGE_CONTENT;
  const openWindow = useWindowStore((s) => s.openWindow);

  const achievementCount = ACHIEVEMENTS_CONTENT.length;
  const certificationCount = CERTIFICATIONS_CONTENT.length;
  const hackathonCount = ACHIEVEMENTS_CONTENT.filter((a) =>
    /hackathon|techathon/i.test(a.title),
  ).length;

  const stats = [
    { icon: AchievementsGlyph, tint: '#a78bfa', value: `${achievementCount}+`, label: 'Achievements' },
    { icon: UsersGlyph, tint: '#38bdf8', value: `${hackathonCount}`, label: 'Hackathons' },
    { icon: TargetGlyph, tint: '#facc15', value: `${certificationCount}`, label: 'Certifications' },
    { icon: LightbulbGlyph, tint: '#4ade80', value: '∞', label: 'Learning' },
  ];

  return (
    <div className="flex flex-col gap-os-5">
      <div className="flex flex-col gap-os-2">
        <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
          <TargetGlyph className="h-3.5 w-3.5" />
          {eyebrow}
        </span>
        <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
          My <span className="text-[color:var(--color-os-accent)]">Achievements</span>
        </h2>
        <p className="max-w-md text-os-body text-[color:var(--color-os-text-secondary)]">{tagline}</p>
      </div>

      <div className="grid grid-cols-2 gap-os-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 text-center"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-os-full"
              style={{ backgroundColor: `${stat.tint}22`, color: stat.tint }}
            >
              <stat.icon className="h-5 w-5" />
            </span>
            <p className="text-os-body font-bold text-[color:var(--color-os-text-primary)]">{stat.value}</p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        {ACHIEVEMENTS_CONTENT.map((achievement) => (
          <div
            key={achievement.id}
            className="flex flex-col gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
          >
            <div className="flex items-start justify-between gap-os-2">
              <div className="flex items-center gap-os-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-os-md bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]">
                  <AchievementsGlyph className="h-4 w-4" />
                </span>
                <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                  {achievement.title}
                </h3>
              </div>
              {achievement.date && (
                <span className="shrink-0 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                  {achievement.date}
                </span>
              )}
            </div>
            <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{achievement.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-os-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-full bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]">
            <LightbulbGlyph className="h-5 w-5" />
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
        <button
          type="button"
          onClick={() => openWindow('projects')}
          className="shrink-0 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
