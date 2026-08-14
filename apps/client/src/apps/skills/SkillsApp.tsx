import { SKILLS_CONTENT } from '@/lib/content';

/**
 * Skills window content — grouped, scannable tags, not a deep-dive (that's
 * what Recruiter Mode's condensed version reuses this same data for in
 * Phase 6, per UX flow doc §6).
 */
export function SkillsApp() {
  return (
    <div className="flex flex-col gap-os-4">
      {SKILLS_CONTENT.map((group) => (
        <div key={group.id} className="flex flex-col gap-os-2">
          <h3 className="text-os-caption font-semibold uppercase tracking-wide text-[color:var(--color-os-text-tertiary)]">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-os-2">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
