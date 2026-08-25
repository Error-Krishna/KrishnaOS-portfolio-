import { EDUCATION_CONTENT, EDUCATION_PAGE_CONTENT } from '@/lib/content';
import { EducationGlyph, LightbulbGlyph } from '@/os/icons';

const TIMELINE_TINTS = ['#a78bfa', '#38bdf8', '#2dd4bf'];

/**
 * Education window — deliberately kept simple. KRISHNAOS_HANDS_ON_CONTEXT.md's
 * Phase G is explicit that Education should stay plain information rather
 * than become another decorated dashboard ("KrishnaOS demonstrates
 * engineering through interaction where interaction adds value, while
 * simple information stays simple"), and Krishna confirmed keeping it
 * minimal when a reference image showed a much more decorated version
 * (subject-tag pills, institution logo tiles, a stat footer, a large hero
 * illustration). What's here: a small header, and the existing
 * institution/degree/date list dressed up only as far as a small
 * connecting timeline rail — reusing the same visual device already
 * established in ExperienceApp.tsx's "My Journey" timeline, not a new one.
 *
 * Deliberately NOT included: per-entry subject tags, a stat footer
 * (Core Subjects / Concepts Learned / Curiosity), an institution logo
 * tile, and a large decorative illustration — none of these exist as real
 * content, and adding them would have pushed this page toward exactly the
 * "flashy OS animation showcase" Phase G says to avoid.
 */
export function EducationApp() {
  const { eyebrow, tagline, closingNote } = EDUCATION_PAGE_CONTENT;

  return (
    <div className="flex flex-col gap-os-5">
      <div className="flex flex-col gap-os-2">
        <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
          <EducationGlyph className="h-3.5 w-3.5" />
          {eyebrow}
        </span>
        <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">My Education</h2>
        <p className="max-w-md text-os-body text-[color:var(--color-os-text-secondary)]">{tagline}</p>
      </div>

      <div className="relative flex flex-col gap-os-4 pl-os-6">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-[7px] top-3 w-px"
          style={{
            backgroundImage:
              'repeating-linear-gradient(180deg, var(--color-os-glass-border) 0 6px, transparent 6px 14px)',
          }}
        />

        {EDUCATION_CONTENT.map((edu, i) => {
          const tint = TIMELINE_TINTS[i % TIMELINE_TINTS.length];
          const isCurrent = i === 0;

          return (
            <div key={edu.id} className="relative flex flex-col gap-os-1">
              <span
                aria-hidden
                className="absolute left-[-1.5rem] top-1.5 h-3.5 w-3.5 rounded-full border-2"
                style={{ borderColor: tint, backgroundColor: isCurrent ? tint : 'var(--color-os-bg)' }}
              />

              <div className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3">
                <p className="text-os-caption font-semibold" style={{ color: tint }}>
                  {edu.startDate} – {edu.endDate}
                </p>
                <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                  {edu.degree}
                </h3>
                <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{edu.institution}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-os-3 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-3">
        <LightbulbGlyph className="h-5 w-5 shrink-0 text-[color:var(--color-os-accent)]" />
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{closingNote}</p>
      </div>
    </div>
  );
}
