import type { Project } from '@krishnaos/shared-types';
import {
  useJobAutomationRuntime,
  type JobStatus,
} from './useJobAutomationRuntime';

interface JobAutomationRuntimeProps {
  project: Project;
}

const STATUSES: JobStatus[] = [
  'Pending',
  'Applied',
  'Shortlisted',
  'OA Received',
  'Interview Scheduled',
  'Offer Received',
  'Rejected',
  'Not Applied',
];

export function JobAutomationRuntime({
  project,
}: JobAutomationRuntimeProps) {
  const {
    keywords,
    setKeywords,
    location,
    setLocation,
    selectedPlatforms,
    togglePlatform,
    jobs,
    searching,
    runSearch,
    updateJob,
    reset,
    stats,
    platforms,
  } = useJobAutomationRuntime();

  return (
    <div className="flex min-h-[560px] flex-col gap-os-4">
      <header className="flex flex-col gap-os-2">
        <div className="flex flex-wrap items-center justify-between gap-os-3">
          <div>
            <p className="text-os-caption font-medium text-[color:var(--color-os-accent)]">
              Job Search Tracker
            </p>
            <h2 className="text-os-title font-semibold text-[color:var(--color-os-text-primary)]">
              {project.title}
            </h2>
          </div>

          <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1.5 text-os-caption text-[color:var(--color-os-text-secondary)]">
            Sandbox simulation
          </span>
        </div>

        <p className="max-w-3xl text-os-caption text-[color:var(--color-os-text-secondary)]">
          Explore the job discovery and tracking workflow without making real
          applications or scraping external job platforms.
        </p>
      </header>

      <section className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
        <div className="grid gap-os-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-os-caption font-medium">
              Keywords
            </span>
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="software engineer, react"
              className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-os-caption font-medium">
              Location
            </span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="India"
              className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-os-3 py-os-2 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
            />
          </label>
        </div>

        <div className="mt-os-4">
          <p className="mb-os-2 text-os-caption font-medium">
            Platforms
          </p>

          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const selected = selectedPlatforms.includes(platform);

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  aria-pressed={selected}
                  className={`rounded-os-full border px-os-3 py-1.5 text-os-caption transition-colors ${
                    selected
                      ? 'border-[color:var(--color-os-accent)] bg-[color:var(--color-os-accent)]/15 text-[color:var(--color-os-accent)]'
                      : 'border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-tertiary)] hover:bg-[color:var(--color-os-glass-highlight)]'
                  }`}
                >
                  {platform}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-os-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runSearch}
            disabled={searching || selectedPlatforms.length === 0}
            className="rounded-os-md bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? 'Searching…' : 'Run Search'}
          </button>

          <button
            type="button"
            onClick={reset}
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass-highlight)]"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-os-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['Discovered', stats.total],
          ['Pending', stats.pending],
          ['Applied', stats.applied],
          ['Shortlisted', stats.shortlisted],
          ['Interviews', stats.interviews],
          ['Offers', stats.offers],
        ].map(([label, value]) => (
          <div
            key={label as string}
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-3"
          >
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              {label as string}
            </p>
            <p className="mt-1 text-os-title font-semibold">
              {value as number}
            </p>
          </div>
        ))}
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
        <div className="flex items-center justify-between border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3">
          <div>
            <p className="text-os-caption font-semibold">
              Job tracker
            </p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              {jobs.length === 0
                ? 'Run a search to populate the tracker'
                : `${jobs.length} jobs discovered`}
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center p-os-6 text-center">
            <div>
              <p className="text-os-body font-medium">
                No jobs discovered yet
              </p>
              <p className="mt-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                Configure your profile and run the simulated search.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.5fr_1fr_110px_150px_160px] gap-3 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                <span>Role</span>
                <span>Platform</span>
                <span>Location</span>
                <span>Status</span>
                <span>Notes</span>
              </div>

              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-[1.5fr_1fr_110px_150px_160px] gap-3 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-os-caption font-semibold">
                      {job.title}
                    </p>
                    <p className="truncate text-os-caption text-[color:var(--color-os-text-tertiary)]">
                      {job.company} · {job.salary}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <span className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                      {job.platform}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="truncate text-os-caption text-[color:var(--color-os-text-secondary)]">
                      {job.location}
                    </span>
                  </div>

                  <select
                    value={job.status}
                    onChange={(event) =>
                      updateJob(job.id, {
                        status: event.target.value as JobStatus,
                      })
                    }
                    className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-2 py-1 text-os-caption outline-none"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <input
                    value={job.notes}
                    onChange={(event) =>
                      updateJob(job.id, {
                        notes: event.target.value,
                      })
                    }
                    placeholder="Add note…"
                    className="min-w-0 rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] px-2 py-1 text-os-caption outline-none focus:border-[color:var(--color-os-accent)]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
