import { Suspense } from 'react';
import type { Project } from '@krishnaos/shared-types';
import { RunnerComingSoon } from '../ProjectRunnerShell';
import { EMBEDDED_RUNTIMES } from './embeddedRuntimeRegistry';

interface ProjectRuntimeProps {
  project: Project;
}

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
  const url =
    project.runtime?.type === 'remote'
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
  const entry = project.runtime?.entry;
  const Runtime = entry ? EMBEDDED_RUNTIMES[entry] : undefined;

  if (!Runtime) {
    return <RunnerComingSoon project={project} />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-6">
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            Loading project runtime…
          </p>
        </div>
      }
    >
      <Runtime project={project} />
    </Suspense>
  );
}

function SandboxProjectRuntime({ project }: ProjectRuntimeProps) {
  return <RunnerComingSoon project={project} />;
}

function StaticProjectRuntime({ project }: ProjectRuntimeProps) {
  return <RunnerComingSoon project={project} />;
}
