import { EDUCATION_CONTENT } from '@/lib/content';

/** Education window content — simple institution/degree/date list. */
export function EducationApp() {
  return (
    <div className="flex flex-col gap-os-4">
      {EDUCATION_CONTENT.map((edu) => (
        <div key={edu.id} className="flex flex-col gap-os-1">
          <h3 className="text-os-body font-semibold">{edu.institution}</h3>
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{edu.degree}</p>
          <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            {edu.startDate} – {edu.endDate}
          </span>
        </div>
      ))}
    </div>
  );
}
