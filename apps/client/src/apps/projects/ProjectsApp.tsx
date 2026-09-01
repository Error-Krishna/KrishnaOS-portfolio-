import { useState } from 'react';
import { PROJECTS_PAGE_CONTENT } from '@/lib/content';
import { useWindowStore } from '@/store/useWindowStore';
import { LightbulbGlyph } from '@/os/icons';
import { ProjectCard } from './ProjectCard';
import { ProjectRunnerShell } from './ProjectRunnerShell';
import { ProjectRuntime } from './runtime/ProjectRuntime';
import {
  PROJECT_CATEGORIES,
  PROJECT_RUNNERS,
  type ProjectCategory,
} from './runnerRegistry';
import { useProjectCatalog } from './useProjectCatalog';

/**
 * Projects window — a Finder-style, dashboard-style gallery (per the
 * reference design) where every real project can be *tried*, not just
 * read about.
 *
 * Pressing "Try Live" on a card swaps the grid for that project's real,
 * stateful interactive runtime (see `runtime/ProjectRuntime.tsx` and its
 * embedded/sandbox runtime registries),
 * rendered inside this same window rather than navigating away. Each demo
 * genuinely runs client-side — real filtering, a real form with
 * validation, a real simulated async pipeline with progress state — not
 * a static mockup styled to look interactive.
 *
 * Category filter pills are derived from `runnerRegistry.ts`'s category
 * assignments rather than hardcoded, matching this file's existing
 * pattern of computing rather than duplicating (see `PROJECT_CATEGORIES`
 * / `PROJECT_RUNNERS`). A project with no registry entry yet still shows
 * in "All Projects" — it just doesn't gain a category pill or a
 * "Try Live" demo label, and pressing its card falls back to
 * `RunnerComingSoon`, an honest "not wired up yet" state rather than a
 * hidden or broken project.
 */
export function ProjectsApp() {
  const [activeCategory, setActiveCategory] = useState<'All' | ProjectCategory>('All');
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const openWindow = useWindowStore((s) => s.openWindow);

  const { projects, loading, error } = useProjectCatalog();

  const {
    eyebrow,
    title,
    titleAccent,
    tagline,
    calloutHeading,
    calloutBody,
    closing,
  } = PROJECTS_PAGE_CONTENT;

  const openProject = openProjectId
    ? projects.find((project) => project.id === openProjectId)
    : undefined;

  if (openProject) {
    return (
      <ProjectRunnerShell project={openProject} onBack={() => setOpenProjectId(null)}>
        <ProjectRuntime project={openProject} />
      </ProjectRunnerShell>
    );
  }

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter(
          (project) =>
            PROJECT_RUNNERS[project.id]?.category === activeCategory,
        );

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p
          className="text-os-caption text-[color:var(--color-os-text-tertiary)]"
          aria-live="polite"
        >
          Loading projects…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-os-3 py-os-12 text-center">
        <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
          Unable to load projects
        </p>
        <p className="max-w-md text-os-caption text-[color:var(--color-os-text-tertiary)]">
          {error}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-os-5">
      <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-os-2">
          <span className="inline-flex w-fit items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption font-medium text-[color:var(--color-os-accent)]">
            {eyebrow}
          </span>
          <h2 className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
            {title} <span className="text-[color:var(--color-os-accent)]">{titleAccent}</span>
          </h2>
          <p className="max-w-md text-os-body text-[color:var(--color-os-text-secondary)]">{tagline}</p>
        </div>

        <div className="flex items-start gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-os-full bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]">
            <LightbulbGlyph className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              {calloutHeading}
            </p>
            <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{calloutBody}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-os-2">
        {(['All', ...PROJECT_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-os-full px-os-3 py-os-1 text-os-caption font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[color:var(--color-os-accent)] text-white'
                : 'border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]'
            }`}
          >
            {cat === 'All' ? 'All Projects' : cat}
          </button>
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <p className="py-os-12 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
          No projects in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-os-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={setOpenProjectId} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-start gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">{closing.heading}</p>
          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{closing.body}</p>
        </div>
        <button
          type="button"
          onClick={() => openWindow('contact')}
          className="shrink-0 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
        >
          {closing.ctaLabel}
        </button>
      </div>
    </div>
  );
}
