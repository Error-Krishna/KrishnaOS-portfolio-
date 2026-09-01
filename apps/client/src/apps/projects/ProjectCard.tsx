import type { Project } from '@krishnaos/shared-types';
import { GithubGlyph, ExternalLinkGlyph, PlayGlyph } from '@/os/icons';
import { PROJECT_RUNNERS } from './runnerRegistry';
import { EMBEDDED_RUNTIMES } from './runtime/embeddedRuntimeRegistry';
import { SANDBOX_RUNTIMES } from './runtime/sandboxRuntimeRegistry';

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
}

/**
 * Whether pressing this card's action button opens a genuine in-OS
 * interactive experience (a real embedded demo, a real sandboxed tool, or
 * the project's actual live app in an iframe) versus falling through to
 * `RunnerComingSoon` (an honest "not wired up yet" state — see
 * `ProjectRunnerShell.tsx`). Read from `project.runtime` (the real catalog
 * data), not from `runnerRegistry.ts`'s display metadata, since that's the
 * one place this is actually decided (`runtime/ProjectRuntime.tsx`).
 */
function hasRealRuntime(project: Project): boolean {
  const runtime = project.runtime;

  if (!runtime) {
    return false;
  }

  switch (runtime.type) {
    case 'remote':
      return Boolean(runtime.url);

    case 'embedded':
      return Boolean(runtime.entry && EMBEDDED_RUNTIMES[runtime.entry]);

    case 'sandbox':
      return Boolean(runtime.entry && SANDBOX_RUNTIMES[runtime.entry]);

    case 'static':
      return false;

    default:
      return false;
  }
}

/**
 * A single project tile in the Finder-style grid. `runnerEntry` (from
 * `runnerRegistry.ts`) drives the category pill and the demo-label copy;
 * a project without a registry entry still renders (just without the
 * category/demo-label extras) rather than being silently excluded.
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const runnerEntry = PROJECT_RUNNERS[project.id];
  const isLive = hasRealRuntime(project);

  return (
    <article className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
      <div className="flex items-start justify-between gap-os-2">
        <div className="min-w-0">
          <div className="mb-os-1 flex flex-wrap items-center gap-os-2">
            <h3 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">{project.title}</h3>
            {runnerEntry && (
              <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-2 py-0.5 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                {runnerEntry.category}
              </span>
            )}
          </div>
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{project.summary}</p>
        </div>
        <span className="flex shrink-0 items-center gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-[#4ade80]' : 'bg-[color:var(--color-os-glass-border)]'}`} />
          {isLive ? 'Live' : 'Source only'}
        </span>
      </div>

      {runnerEntry && (
        <p className="flex items-center gap-os-1 text-os-caption text-[color:var(--color-os-accent)]">
          <PlayGlyph className="h-3 w-3" />
          {runnerEntry.demoLabel}
        </p>
      )}

      <div className="flex flex-wrap gap-os-1">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-os-full bg-[color:var(--color-os-surface-elevated)] px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-os-2 pt-os-1">
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title} GitHub repository`}
            className="flex h-8 w-8 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)]"
          >
            <GithubGlyph className="h-4 w-4" />
          </a>
        )}
        {project.links.live && (
          <a
            href={project.links.live}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${project.title}'s live site`}
            className="flex h-8 w-8 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)]"
          >
            <ExternalLinkGlyph className="h-4 w-4" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          className="ml-auto flex items-center gap-os-2 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
        >
          {isLive ? 'Try Live' : 'View Details'}
          <PlayGlyph className="h-3 w-3" />
        </button>
      </div>
    </article>
  );
}
