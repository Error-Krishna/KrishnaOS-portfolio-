import type { Project } from '@krishnaos/shared-types';
import { useHotReloadRuntime } from './useHotReloadRuntime';

interface HotReloadRuntimeProps {
  project: Project;
}

const FILES = [
  { path: 'cmd/hotreload/main.go', type: 'go' },
  { path: 'internal/watcher/watcher.go', type: 'go' },
  { path: 'internal/process/process.go', type: 'go' },
  { path: 'internal/config/config.go', type: 'go' },
  { path: 'README.md', type: 'markdown' },
] as const;

const PHASE_LABELS = {
  idle: 'Idle',
  debouncing: 'Debouncing',
  building: 'Building',
  stopping: 'Stopping',
  restarting: 'Restarting',
  running: 'Running',
  failed: 'Failed',
} as const;

export function HotReloadRuntime({ project }: HotReloadRuntimeProps) {
  const {
    phase,
    events,
    changedFile,
    changeFile,
    clearEvents,
  } = useHotReloadRuntime();

  const phaseLabel = PHASE_LABELS[phase];

  return (
    <div className="flex min-h-[520px] flex-col gap-os-4">
      <header className="flex flex-col gap-os-2">
        <div className="flex flex-wrap items-center justify-between gap-os-3">
          <div>
            <p className="text-os-caption font-medium text-[color:var(--color-os-accent)]">
              Developer Tool Runtime
            </p>
            <h2 className="text-os-title font-semibold text-[color:var(--color-os-text-primary)]">
              {project.title}
            </h2>
          </div>

          <div className="flex items-center gap-os-2 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                phase === 'running'
                  ? 'bg-green-500'
                  : phase === 'failed'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`}
            />
            <span className="text-os-caption font-medium">
              {phaseLabel}
            </span>
          </div>
        </div>

        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Simulate HotReload's file watcher, debounce, rebuild, and process
          restart lifecycle.
        </p>
      </header>

      <div className="grid gap-os-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <section className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-3">
          <div className="mb-os-3 flex items-center justify-between">
            <div>
              <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
                Project files
              </p>
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                Click a file to modify it
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {FILES.map((file) => {
              const isChanged = changedFile === file.path;

              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => changeFile(file.path)}
                  className={`flex items-center gap-os-2 rounded-os-sm px-os-2 py-os-2 text-left text-os-caption transition-colors ${
                    isChanged
                      ? 'bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]'
                      : 'text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass-highlight)]'
                  }`}
                >
                  <span className="text-[color:var(--color-os-text-tertiary)]">
                    {file.type === 'go' ? 'GO' : 'MD'}
                  </span>
                  <span className="min-w-0 truncate">{file.path}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <div className="mb-os-4 flex items-center justify-between gap-os-3">
            <div>
              <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
                Hot reload pipeline
              </p>
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                {changedFile
                  ? `Latest change: ${changedFile}`
                  : 'Waiting for a filesystem change'}
              </p>
            </div>
          </div>

          <div className="grid gap-os-2 sm:grid-cols-5">
            {[
              ['Watch', phase !== 'idle'],
              ['Debounce', ['debouncing', 'building', 'stopping', 'restarting'].includes(phase)],
              ['Build', ['building', 'stopping', 'restarting'].includes(phase)],
              ['Stop', ['stopping', 'restarting'].includes(phase)],
              ['Restart', ['restarting', 'running'].includes(phase)],
            ].map(([label, active]) => (
              <div
                key={label as string}
                className={`rounded-os-md border p-os-3 ${
                  active
                    ? 'border-[color:var(--color-os-accent)] bg-[color:var(--color-os-accent)]/10'
                    : 'border-[color:var(--color-os-glass-border)]'
                }`}
              >
                <p className="text-os-caption font-medium">{label as string}</p>
                <p className="mt-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                  {active ? 'Active' : 'Waiting'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="min-h-0 flex-1 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[#111] p-os-4">
        <div className="mb-os-3 flex items-center justify-between">
          <div>
            <p className="text-os-caption font-semibold text-white">
              Runtime output
            </p>
            <p className="text-os-caption text-white/50">
              Filesystem watcher events
            </p>
          </div>

          <button
            type="button"
            onClick={clearEvents}
            className="rounded-os-full border border-white/15 px-os-3 py-1 text-os-caption text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            Clear
          </button>
        </div>

        <div
          className="max-h-56 overflow-auto font-mono text-xs"
          aria-live="polite"
        >
          {events.length === 0 ? (
            <p className="text-white/40">
              Waiting for filesystem events…
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="shrink-0 text-white/35">
                    {event.timestamp}
                  </span>
                  <span
                    className={
                      event.kind === 'success'
                        ? 'text-green-400'
                        : event.kind === 'warning'
                          ? 'text-yellow-400'
                          : event.kind === 'error'
                            ? 'text-red-400'
                            : 'text-white/75'
                    }
                  >
                    {event.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
