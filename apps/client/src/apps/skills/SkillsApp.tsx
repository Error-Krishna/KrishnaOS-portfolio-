import { SKILLS_CONTENT, SKILLS_PAGE_CONTENT, PROJECTS_CONTENT } from '@/lib/content';
import {
  CodeGlyph,
  LayersGlyph,
  ServerGlyph,
  DatabaseGlyph,
  CompassGlyph,
  WrenchGlyph,
  TerminalGlyph,
  UsersGlyph,
  RocketGlyph,
  LightbulbGlyph,
} from '@/os/icons';

/**
 * One icon + accent tint per skill group, in the same order as
 * SKILLS_CONTENT. Purely presentational — adding/reordering a group in
 * content.ts just needs a matching entry appended here (falls back to the
 * last icon/tint if the arrays ever get out of sync, so a mismatch fails
 * quietly rather than crashing the window).
 */
const GROUP_ICONS = [CodeGlyph, LayersGlyph, ServerGlyph, DatabaseGlyph, WrenchGlyph, CompassGlyph, TerminalGlyph, UsersGlyph];
const GROUP_TINTS = ['#a78bfa', '#38bdf8', '#818cf8', '#38bdf8', '#a78bfa', '#818cf8', '#38bdf8', '#4ade80'];

/**
 * Skills window — grouped, scannable tags plus a small stats header, not a
 * deep-dive (that's what Recruiter Mode's condensed version reuses this
 * same SKILLS_CONTENT data for in Phase 6, per UX flow doc §6).
 *
 * Stat numbers are computed live from real content rather than hardcoded,
 * so "20+ Technologies" etc. can never silently drift from the actual
 * SKILLS_CONTENT/PROJECTS_CONTENT arrays:
 * - Technologies = unique skill count across every group
 * - Skill Areas = SKILLS_CONTENT.length (the reference design's "Project
 *   Domains" stat wasn't derivable from real data without inventing a
 *   number, so this uses an honestly-computed equivalent instead)
 * - Major Projects = PROJECTS_CONTENT.length
 */
export function SkillsApp() {
  const { eyebrow, title, titleAccent, tagline, badges, quote } = SKILLS_PAGE_CONTENT;

  const uniqueSkillCount = new Set(SKILLS_CONTENT.flatMap((g) => g.skills)).size;
  const groupCount = SKILLS_CONTENT.length;
  const projectCount = PROJECTS_CONTENT.length;

  const stats = [
    { icon: CodeGlyph, tint: '#a78bfa', value: `${uniqueSkillCount}+`, label: 'Technologies' },
    { icon: LayersGlyph, tint: '#38bdf8', value: `${groupCount}`, label: 'Skill Areas' },
    { icon: RocketGlyph, tint: '#f97316', value: `${projectCount}+`, label: 'Major Projects' },
    { icon: LightbulbGlyph, tint: '#4ade80', value: 'Always', label: 'Learning' },
  ];

  return (
    <div className="flex flex-col gap-os-5">
      {/* Header row: eyebrow + title + tagline on the left, stat cards on the right */}
      <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-os-3">
          <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
            <LightbulbGlyph className="h-3.5 w-3.5" />
            {eyebrow}
          </span>

          <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
            {title} <span className="text-[color:var(--color-os-accent)]">{titleAccent}</span>
          </h2>

          <p className="max-w-md text-os-body text-[color:var(--color-os-text-secondary)]">{tagline}</p>

          <div className="flex flex-wrap gap-os-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 sm:grid-cols-4 lg:w-[420px]">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-os-2 text-center">
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
      </div>

      {/* Grouped skill cards */}
      <div className="grid grid-cols-1 gap-os-4 sm:grid-cols-2 xl:grid-cols-4">
        {SKILLS_CONTENT.map((group, i) => {
          const Icon = GROUP_ICONS[i] ?? GROUP_ICONS[GROUP_ICONS.length - 1];
          const tint = GROUP_TINTS[i] ?? GROUP_TINTS[GROUP_TINTS.length - 1];

          return (
            <div
              key={group.id}
              className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
            >
              <div className="flex items-center gap-os-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-os-md"
                  style={{ backgroundColor: `${tint}22`, color: tint }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">{group.label}</h3>
              </div>

              <div className="flex flex-wrap gap-os-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing quote card */}
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
    </div>
  );
}
