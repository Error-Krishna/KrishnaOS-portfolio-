import { useEffect, useRef, useState } from 'react';
import { PlayGlyph, StopGlyph, TrashGlyph } from '@/os/icons';
import { RunnerLoadingSkeleton } from '../ProjectRunnerShell';

type LogKind = 'info' | 'change' | 'restart' | 'ok';

interface LogLine {
  id: number;
  text: string;
  kind: LogKind;
}

const LOG_KIND_STYLES: Record<LogKind, string> = {
  info: 'text-[color:var(--color-os-text-tertiary)]',
  change: 'text-[#facc15]',
  restart: 'text-[#60a5fa]',
  ok: 'text-[#4ade80]',
};

const SAMPLE_FILES = ['server.js', 'config.json', 'routes/api.ts', 'lib/db.ts', 'main.go', '.env'];

let idSeq = 0;
function nextId() {
  idSeq += 1;
  return idSeq;
}

/**
 * HotReload's live demo: a real Start/Stop file-watcher loop, running
 * entirely client-side. Pressing "Start watching" begins emitting
 * simulated file-change → restart log lines on an interval; the
 * "Debounce (ms)" input genuinely controls how fast that interval fires,
 * so it isn't a decorative control. Stop halts the interval, Clear empties
 * the log. This simulates the CLI's real watch → debounce → restart loop;
 * the actual tool watches a real filesystem — see the source link above.
 */
export function HotReloadRunner() {
  const [booting, setBooting] = useState(true);
  const [watchPath, setWatchPath] = useState('./src');
  const [debounceMs, setDebounceMs] = useState(300);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [logs]);

  function pushLog(text: string, kind: LogKind) {
    setLogs((prev) => [...prev.slice(-40), { id: nextId(), text, kind }]);
  }

  function start() {
    if (running) return;
    setRunning(true);
    pushLog(`> hotreload start --watch ${watchPath}`, 'info');
    pushLog('watching for changes...', 'info');
    intervalRef.current = setInterval(
      () => {
        const file = SAMPLE_FILES[Math.floor(Math.random() * SAMPLE_FILES.length)];
        pushLog(`${file}  changed`, 'change');
        window.setTimeout(() => pushLog('restarting server...', 'restart'), 250);
        window.setTimeout(() => pushLog('✓ server restarted', 'ok'), 700);
      },
      Math.max(900, debounceMs * 4),
    );
  }

  function stop() {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pushLog('watcher stopped', 'info');
  }

  function clear() {
    setLogs([]);
  }

  if (booting) return <RunnerLoadingSkeleton label="Booting CLI…" />;

  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex flex-wrap items-end gap-os-3">
        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Watch path
          <input
            value={watchPath}
            onChange={(e) => setWatchPath(e.target.value)}
            disabled={running}
            className="rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 font-mono text-os-caption text-[color:var(--color-os-text-primary)] disabled:opacity-50"
          />
        </label>
        <label className="flex flex-col gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Debounce (ms)
          <input
            type="number"
            min={50}
            max={1000}
            step={50}
            value={debounceMs}
            onChange={(e) => setDebounceMs(Number(e.target.value) || 300)}
            className="w-24 rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-2 py-1 font-mono text-os-caption text-[color:var(--color-os-text-primary)]"
          />
        </label>

        {!running ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-os-2 rounded-os-full bg-[#4ade80] px-os-4 py-os-2 text-os-caption font-medium text-black transition-opacity hover:opacity-90"
          >
            <PlayGlyph className="h-3.5 w-3.5" />
            Start watching
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-os-2 rounded-os-full bg-[#f87171] px-os-4 py-os-2 text-os-caption font-medium text-black transition-opacity hover:opacity-90"
          >
            <StopGlyph className="h-3.5 w-3.5" />
            Stop
          </button>
        )}

        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-os-2 rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]"
        >
          <TrashGlyph className="h-3.5 w-3.5" />
          Clear
        </button>

        <span className="ml-auto flex items-center gap-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          <span
            className={`h-2 w-2 rounded-full ${running ? 'animate-pulse bg-[#4ade80]' : 'bg-[color:var(--color-os-glass-border)]'}`}
          />
          {running ? 'Watching' : 'Idle'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="h-64 overflow-auto rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-black/40 p-os-3 font-mono text-os-caption"
      >
        {logs.length === 0 ? (
          <p className="text-[color:var(--color-os-text-tertiary)]">
            No output yet — press &quot;Start watching&quot; to simulate a real file-watch session.
          </p>
        ) : (
          logs.map((l) => (
            <p key={l.id} className={LOG_KIND_STYLES[l.kind]}>
              {l.text}
            </p>
          ))
        )}
      </div>
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        This simulates HotReload&apos;s real file-watch → debounce → restart loop client-side. The actual CLI runs
        locally against a real filesystem — see the source link above.
      </p>
    </div>
  );
}
