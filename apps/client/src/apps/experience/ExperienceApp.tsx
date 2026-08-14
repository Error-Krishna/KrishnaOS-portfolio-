import { EXPERIENCE_CONTENT } from '@/lib/content';

/**
 * Experience window content — a condensed timeline, per coding prompt §5's
 * Experience shape (startDate/endDate/highlights). `endDate === 'present'`
 * renders as "Present" rather than the literal string, matching the
 * shared-types `Experience.endDate: string | 'present'` union.
 */
export function ExperienceApp() {
  return (
    <div className="flex flex-col gap-os-4">
      {EXPERIENCE_CONTENT.map((exp) => (
        <div
          key={exp.id}
          className="flex flex-col gap-os-1 border-l-2 border-[color:var(--color-os-glass-border)] pl-os-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-os-2">
            <h3 className="text-os-body font-semibold">{exp.title}</h3>
            <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              {exp.startDate} – {exp.endDate === 'present' ? 'Present' : exp.endDate}
            </span>
          </div>
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{exp.company}</p>
          <ul className="mt-os-1 list-disc pl-os-4 text-os-caption text-[color:var(--color-os-text-secondary)]">
            {exp.highlights.map((highlight, i) => (
              <li key={i}>{highlight}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
