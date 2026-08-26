import type { Project } from '@krishnaos/shared-types';
import { RunnerComingSoon, RunnerLoadingSkeleton } from '../ProjectRunnerShell';

interface ProjectRuntimeProps {
  project: Project;
}

/**
 * Generic project runtime entry point.
 *
 * Runtime behavior comes from the repository manifest rather than from
 * project-specific React components.
 */
export function ProjectRuntime({ project }: ProjectRuntimeProps) {
  const runtime = project.runtime;

  if (!runtime) {
    return <RunnerComingSoon project={project} />;
  }

  switch (runtime.type) {
    case 'remote':
      return <RemoteProjectRuntime project={project} />;

    case 'embedded':
      return <EmbeddedProjectRuntime project={project} />;

    case 'sandbox':
      return <SandboxProjectRuntime project={project} />;

    case 'static':
      return <StaticProjectRuntime project={project} />;

    default:
      return <RunnerComingSoon project={project} />;
  }
}

function RemoteProjectRuntime({ project }: ProjectRuntimeProps) {
  const url = project.runtime?.type === 'remote'
    ? project.runtime.url
    : undefined;

  if (!url) {
    return <RunnerComingSoon project={project} />;
  }

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
      <div className="flex items-center gap-os-2 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-2">
        <span className="h-2 w-2 rounded-full bg-[color:var(--color-os-accent)]" />
        <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Remote application
        </span>
      </div>

      <iframe
        title={`${project.title} live application`}
        src={url}
        className="min-h-[480px] w-full flex-1 border-0"
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
}

function EmbeddedProjectRuntime({ project }: ProjectRuntimeProps) {
  return (
    <div className="flex flex-col gap-os-3 rounded-os-lg border border-dashed border-[color:var(--color-os-glass-border)] p-os-6">
      <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
        {project.title}
      </p>

      <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
        This project is configured as an embedded runtime.
      </p>

      <RunnerLoadingSkeleton label="Embedded runtime adapter is being initialized…" />
    </div>
  );
}

function SandboxProjectRuntime({ project }: ProjectRuntimeProps) {
  return (
    <RunnerComingSoon project={project} />
  );
}

function StaticProjectRuntime({ project }: ProjectRuntimeProps) {
  return (
    <RunnerComingSoon project={project} />
  );
}
