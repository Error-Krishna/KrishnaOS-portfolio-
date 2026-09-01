import { useEffect, useState } from 'react';
import { RunnerLoadingSkeleton } from '../ProjectRunnerShell';

type Range = 'week' | 'month' | 'quarter';

interface Source {
  label: string;
  value: number;
  color: string;
}

interface RangeStats {
  users: number;
  revenue: number;
  sources: Source[];
}

const RANGE_DATA: Record<Range, RangeStats> = {
  week: {
    users: 412,
    revenue: 186000,
    sources: [
      { label: 'Direct', value: 40, color: '#38bdf8' },
      { label: 'Referral', value: 28, color: '#a78bfa' },
      { label: 'Organic', value: 24, color: '#4ade80' },
      { label: 'Other', value: 8, color: '#f97316' },
    ],
  },
  month: {
    users: 2345,
    revenue: 1820000,
    sources: [
      { label: 'Direct', value: 45, color: '#38bdf8' },
      { label: 'Referral', value: 30, color: '#a78bfa' },
      { label: 'Organic', value: 20, color: '#4ade80' },
      { label: 'Other', value: 5, color: '#f97316' },
    ],
  },
  quarter: {
    users: 6120,
    revenue: 5340000,
    sources: [
      { label: 'Direct', value: 38, color: '#38bdf8' },
      { label: 'Referral', value: 34, color: '#a78bfa' },
      { label: 'Organic', value: 22, color: '#4ade80' },
      { label: 'Other', value: 6, color: '#f97316' },
    ],
  },
};

const RANGE_LABELS: Record<Range, string> = { week: 'This Week', month: 'This Month', quarter: 'This Quarter' };
const RANGE_ORDER: Range[] = ['week', 'month', 'quarter'];

/**
 * InsightLoop's live demo: a date-range selector that genuinely
 * recomputes the stat cards and donut chart from a small local dataset
 * (not just a visual toggle), plus a "Live sync" switch that simulates
 * the real product's WebSocket-driven live updates by nudging the
 * numbers on an interval while enabled.
 */
export function InsightLoopRunner() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('month');
  const [live, setLive] = useState(false);
  const [users, setUsers] = useState(RANGE_DATA.month.users);
  const [revenue, setRevenue] = useState(RANGE_DATA.month.revenue);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setUsers(RANGE_DATA[range].users);
    setRevenue(RANGE_DATA[range].revenue);
  }, [range]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setUsers((u) => Math.max(0, u + Math.round((Math.random() - 0.3) * 6)));
      setRevenue((r) => Math.max(0, r + Math.round((Math.random() - 0.3) * 4000)));
    }, 1800);
    return () => clearInterval(id);
  }, [live]);

  if (loading) return <RunnerLoadingSkeleton label="Connecting to dashboard…" />;

  const sources = RANGE_DATA[range].sources;
  let cumulative = 0;
  const segments = sources.map((s) => {
    const start = cumulative;
    cumulative += s.value;
    return { ...s, start };
  });

  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex flex-wrap items-center gap-os-2">
        {RANGE_ORDER.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-os-full px-os-3 py-os-1 text-os-caption font-medium transition-colors ${
              range === r
                ? 'bg-[color:var(--color-os-accent)] text-white'
                : 'border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]'
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-os-2 text-os-caption text-[color:var(--color-os-text-secondary)]">
          Live sync
          <button
            type="button"
            role="switch"
            aria-checked={live}
            onClick={() => setLive((v) => !v)}
            className={`relative h-6 w-11 rounded-os-full transition-colors ${
              live ? 'bg-[#4ade80]' : 'bg-[color:var(--color-os-glass-border)]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                live ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-os-3">
          <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
            <p className="text-os-title font-bold text-[#38bdf8]">{users.toLocaleString('en-IN')}</p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Users{live && ' · live'}</p>
          </div>
          <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
            <p className="text-os-title font-bold text-[#4ade80]">₹{(revenue / 100000).toFixed(1)}L</p>
            <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Revenue{live && ' · live'}</p>
          </div>
          <div className="col-span-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
            <p className="mb-os-2 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              WebSocket status
            </p>
            <p className="flex items-center gap-os-2 text-os-caption text-[color:var(--color-os-text-secondary)]">
              <span
                className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-[#4ade80]' : 'bg-[color:var(--color-os-glass-border)]'}`}
              />
              {live ? 'Connected — receiving simulated updates' : 'Idle — enable live sync to simulate the socket feed'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
          <p className="self-start text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
            Traffic Sources
          </p>
          <svg viewBox="0 0 42 42" className="h-32 w-32 -rotate-90">
            <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="var(--color-os-glass-border)" strokeWidth="4" />
            {segments.map((s) => (
              <circle
                key={s.label}
                cx="21"
                cy="21"
                r="15.9"
                fill="transparent"
                stroke={s.color}
                strokeWidth="4"
                strokeDasharray={`${s.value} ${100 - s.value}`}
                strokeDashoffset={-s.start}
              />
            ))}
          </svg>
          <div className="grid w-full grid-cols-2 gap-os-1">
            {sources.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label} {s.value}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
