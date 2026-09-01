import type { ReactNode } from 'react';
import type { Project } from '@krishnaos/shared-types';
import { ArrowLeftGlyph, ExternalLinkGlyph, GithubGlyph } from '@/os/icons';

interface ProjectRunnerShellProps {
  project: Project;
  onBack: () => void;
  children: ReactNode;
}

/**
 * Shared chrome for every project's live interactive demo: a back
 * button to the grid, the project's real title/summary, and quick
 * external links to the real live site / GitHub repo when they exist.

 */
export function ProjectRunnerShell({ project, onBack, children }: ProjectRunnerShellProps) {
  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex flex-wrap items-center gap-os-3 border-b border-[color:var(--color-os-glass-border)] pb-os-3">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
        >
          <ArrowLeftGlyph className="h-3.5 w-3.5" />
          All Projects
        </button>
        <div className="min-w-0">
          <h3 className="truncate text-os-headline font-semibold text-[color:var(--color-os-text-primary)]">
            {project.title}
          </h3>
          <p className="truncate text-os-caption text-[color:var(--color-os-text-tertiary)]">{project.summary}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-os-2">
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
            >
              <ExternalLinkGlyph className="h-3.5 w-3.5" />
              Real site
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
            >
              <GithubGlyph className="h-3.5 w-3.5" />
              Source
            </a>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Small boot-style loading state every runner shows for a beat before its
 * demo data "loads" — a genuine loading state, not decorative, since each
 * runner assembles its seed data inside a `useEffect` rather than
 * synchronously on mount (mirrors a real app's initial fetch/connect
 * moment).
 */
export function RunnerLoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-os-3 py-os-12" aria-busy="true" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--color-os-glass-border)] border-t-[color:var(--color-os-accent)]" />
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{label}</p>
    </div>
  );
}

/**
 * Fallback for any `PROJECTS_CONTENT` entry with no matching
 * `runnerRegistry.ts` entry yet. An honest "not built" state, per
 * `AGENTS.md`'s rule against shipping fake/placeholder UI that looks
 * finished — rather than silently omitting the project or rendering a
 * blank panel.
 */
export function RunnerComingSoon({ project }: { project: Project }) {
  return (
    <div className="flex flex-col items-center gap-os-3 rounded-os-lg border border-dashed border-[color:var(--color-os-glass-border)] py-os-12 text-center">
      <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
        An interactive demo for {project.title} isn&apos;t wired up yet.
      </p>
      <p className="max-w-sm text-os-caption text-[color:var(--color-os-text-tertiary)]">
        In the meantime, check out the real thing:
      </p>
      <div className="flex gap-os-2">
        {project.links.live && (
          <a
            href={project.links.live}
            target="_blank"
            rel="noreferrer"
            className="rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white hover:opacity-90"
          >
            Visit live site
          </a>
        )}
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer"
            className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
          >
            View source
          </a>
        )}
      </div>
    </div>
  );
}
