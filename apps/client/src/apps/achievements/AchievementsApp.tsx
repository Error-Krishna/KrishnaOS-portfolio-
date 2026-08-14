import { ACHIEVEMENTS_CONTENT } from '@/lib/content';

/** Achievements window content — cards with an optional external link. */
export function AchievementsApp() {
  return (
    <div className="flex flex-col gap-os-3">
      {ACHIEVEMENTS_CONTENT.map((achievement) => (
        <div
          key={achievement.id}
          className="flex flex-col gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-os-2">
            <h3 className="text-os-body font-semibold">{achievement.title}</h3>
            {achievement.date && (
              <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{achievement.date}</span>
            )}
          </div>
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{achievement.description}</p>
          {achievement.link && (
            <a
              href={achievement.link}
              target="_blank"
              rel="noreferrer"
              className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
            >
              Learn more
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
