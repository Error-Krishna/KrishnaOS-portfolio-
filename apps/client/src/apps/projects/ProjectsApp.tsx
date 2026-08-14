import { PROJECTS_CONTENT } from '@/lib/content';

/**
 * Projects window content — a Finder-style grid, per UX flow doc §4's
 * description of the Projects tour step opening "a Projects window/Finder-
 * style grid." `featured` (see shared-types Project) isn't used to filter
 * here — the full catalog shows in this app; Recruiter Mode (Phase 6) is
 * what filters down to `featured: true` projects only, per the coding
 * prompt §5's note that both views read from the same data source.
 */
export function ProjectsApp() {
  return (
    <div className="grid grid-cols-1 gap-os-4 sm:grid-cols-2">
      {PROJECTS_CONTENT.map((project) => {
        const hasLinks = project.links.live || project.links.github || project.links.caseStudy;
        return (
          <article
            key={project.id}
            className="flex flex-col gap-os-2 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-4"
          >
            <h3 className="text-os-body font-semibold">{project.title}</h3>
            <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{project.summary}</p>
            <div className="flex flex-wrap gap-os-1">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-os-full bg-[color:var(--color-os-glass)] px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]"
                >
                  {tech}
                </span>
              ))}
            </div>
            {hasLinks && (
              <div className="flex gap-os-3 pt-os-1">
                {project.links.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                  >
                    Live
                  </a>
                )}
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {project.links.caseStudy && (
                  <a
                    href={project.links.caseStudy}
                    target="_blank"
                    rel="noreferrer"
                    className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                  >
                    Case study
                  </a>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
