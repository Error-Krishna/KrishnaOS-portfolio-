import { useEffect, useRef, useState } from 'react';
import { PlayGlyph, RefreshGlyph } from '@/os/icons';
import { RunnerLoadingSkeleton } from '../ProjectRunnerShell';

type StepStatus = 'pending' | 'active' | 'done';

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

const STEP_LABELS = ['Searching Jobs', 'Opening Applications', 'Auto Filling Forms', 'Submitting'];

function freshSteps(): Step[] {
  return STEP_LABELS.map((label, i) => ({ id: `s${i}`, label, status: 'pending' as StepStatus }));
}

/**
 * Job Automation System's live demo: a real multi-step pipeline runner.
 * "Run automation" validates the config inputs (keywords + location),
 * then advances four steps in sequence with genuine timed state
 * transitions (pending → active → done) and a progress bar/counter that
 * climbs alongside them — the same pending/in-progress/completed states
 * the real tool reports, just driven by `setTimeout` instead of a real
 * job board.
 */
export function JobAutomationRunner() {
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState('frontend, react');
  const [location, setLocation] = useState('Remote');
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>(freshSteps());
  const [running, setRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [target, setTarget] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(clearTimeout);
  }, []);

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setSteps(freshSteps());
    setRunning(false);
    setProcessed(0);
    setTarget(0);
    setLog([]);
  }

  function run() {
    if (running) return;
    if (!location.trim() || !keywords.trim()) {
      setError('Add at least one keyword and a location before running.');
      return;
    }
    setError(null);
    reset();
    setRunning(true);

    const keywordList = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const jobTarget = Math.min(20, Math.max(6, keywordList.length * 5));
    setTarget(jobTarget);
    setLog([`> job-automation run --keywords "${keywords}" --location "${location}"`]);

    STEP_LABELS.forEach((label, i) => {
      const t1 = setTimeout(() => {
        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'active' } : s)));
        setLog((prev) => [...prev, `→ ${label.toLowerCase()}...`]);
      }, i * 1400);
      timers.current.push(t1);

      const t2 = setTimeout(
        () => {
          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s)));
          if (i === 0) {
            setLog((prev) => [...prev, `found ${jobTarget} matching listings`]);
          }
          if (i === STEP_LABELS.length - 1) {
            setRunning(false);
            setLog((prev) => [...prev, `✓ completed — ${jobTarget} of ${jobTarget} jobs processed`]);
          }
        },
        i * 1400 + 1100,
      );
      timers.current.push(t2);
    });

    for (let p = 1; p <= jobTarget; p++) {
      const delay = 1400 + (p / jobTarget) * (STEP_LABELS.length - 2) * 1400;
      const t = setTimeout(() => setProcessed(p), delay);
      timers.current.push(t);
    }
  }

  if (loading) return <RunnerLoadingSkeleton label="Loading automation config…" />;

  const progressPct = target > 0 ? Math.round((processed / target) * 100) : 0;

  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex flex-wrap items-end gap-os-3">
        <label className="flex min-w-[160px] flex-1 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Keywords (comma separated)
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={running}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-primary)] disabled:opacity-50"
          />
        </label>
        <label className="flex min-w-[140px] flex-1 flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={running}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-primary)] disabled:opacity-50"
          />
        </label>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="flex items-center gap-os-2 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <PlayGlyph className="h-3.5 w-3.5" />
          {running ? 'Running…' : 'Run automation'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-os-2 rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
        >
          <RefreshGlyph className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
      {error && <p className="text-os-caption text-[#f87171]">{error}</p>}

      <div className="flex flex-col gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center gap-os-3 text-os-caption">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                s.status === 'done'
                  ? 'border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80]'
                  : s.status === 'active'
                    ? 'animate-pulse border-[#facc15] bg-[#facc15]/20 text-[#facc15]'
                    : 'border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-tertiary)]'
              }`}
            >
              {s.status === 'done' ? '✓' : ''}
            </span>
            <span
              className={
                s.status === 'pending'
                  ? 'text-[color:var(--color-os-text-tertiary)]'
                  : 'text-[color:var(--color-os-text-primary)]'
              }
            >
              {s.label}
            </span>
            <span className="ml-auto text-[color:var(--color-os-text-tertiary)]">
              {s.status === 'pending' ? 'Pending' : s.status === 'active' ? 'In Progress' : 'Completed'}
            </span>
          </div>
        ))}

        <div className="mt-os-2 flex flex-col gap-os-1">
          <div className="h-2 w-full overflow-hidden rounded-os-full bg-[color:var(--color-os-glass-border)]">
            <div
              className="h-full rounded-os-full bg-[color:var(--color-os-accent)] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            Processed {processed} of {target || 0} jobs
          </p>
        </div>
      </div>

      <div className="h-32 overflow-auto rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-black/40 p-os-3 font-mono text-os-caption text-[color:var(--color-os-text-secondary)]">
        {log.length === 0 ? (
          <p className="text-[color:var(--color-os-text-tertiary)]">
            No run yet — press &quot;Run automation&quot; to start.
          </p>
        ) : (
          log.map((line, i) => <p key={i}>{line}</p>)
        )}
      </div>
    </div>
  );
}
