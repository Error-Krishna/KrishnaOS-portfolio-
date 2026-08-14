import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ClockGlyph, GithubGlyph, TimelineGlyph, WeatherGlyph } from '@/os/icons';
import { useIsMobile } from '@/lib/useMediaQuery';

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? 'Error-Krishna';

const DEVELOPMENT_MILESTONES = [
  { label: 'Phase 1', value: 'Foundation' },
  { label: 'Phase 2', value: 'Boot + Welcome' },
  { label: 'Phase 3', value: 'OS Shell' },
  { label: 'Phase 4', value: 'Content Apps' },
  { label: 'Phase 5', value: 'Guided Tour' },
  { label: 'Phase 6', value: 'Recruiter Mode' },
  { label: 'Phase 7', value: 'Polish' },
] as const;

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Fog',
  48: 'Fog',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Showers',
  95: 'Thunderstorm',
};

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

function useWeather() {
  const [state, setState] = useState<{
    label: string;
    temperature?: number;
    summary?: string;
  }>({ label: 'Location pending' });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ label: 'Weather unavailable' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`,
          );
          const json = (await response.json()) as {
            current?: { temperature_2m?: number; weather_code?: number };
          };

          const weatherCode = json.current?.weather_code;
          setState({
            label: weatherCode != null ? WEATHER_CODES[weatherCode] ?? 'Weather' : 'Weather',
            temperature: json.current?.temperature_2m,
            summary: 'Local conditions',
          });
        } catch {
          setState({ label: 'Weather unavailable' });
        }
      },
      () => setState({ label: 'Location blocked' }),
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 },
    );
  }, []);

  return state;
}

function useGithubAvatar() {
  return useMemo(() => `https://github.com/${GITHUB_USERNAME}.png`, []);
}

interface WidgetShellProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

function WidgetShell({ title, icon, children }: WidgetShellProps) {
  return (
    <section className="glass-panel flex flex-col gap-os-3 p-os-4">
      <div className="flex items-center gap-os-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-os-md bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]">
          {icon}
        </span>
        <h2 className="text-os-body font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function StatusWidgets() {
  const isMobile = useIsMobile();
  const now = useClock();
  const weather = useWeather();
  const avatar = useGithubAvatar();

  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateLabel = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const content = (
    <>
      <WidgetShell title="Time" icon={<ClockGlyph className="h-4 w-4" />}>
        <p className="text-os-title font-semibold">{timeLabel}</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{dateLabel}</p>
      </WidgetShell>

      <WidgetShell title="Weather" icon={<WeatherGlyph className="h-4 w-4" />}>
        <p className="text-os-body font-semibold">{weather.label}</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          {weather.temperature != null ? `${Math.round(weather.temperature)}°F` : 'Live local conditions'}
        </p>
        {weather.summary && (
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{weather.summary}</p>
        )}
      </WidgetShell>

      <WidgetShell title="GitHub" icon={<GithubGlyph className="h-4 w-4" />}>
        <div className="flex items-center gap-os-3">
          <img
            src={avatar}
            alt={`GitHub avatar for ${GITHUB_USERNAME}`}
            className="h-12 w-12 rounded-os-md border border-[color:var(--color-os-glass-border)]"
          />
          <div className="min-w-0">
            <p className="truncate text-os-body font-semibold">{GITHUB_USERNAME}</p>
            <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">Contribution timeline below</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-2">
          <img
            src={`https://github.com/users/${GITHUB_USERNAME}/contributions`}
            alt="GitHub contribution graph"
            className="h-auto w-full"
          />
        </div>
      </WidgetShell>

      <WidgetShell title="Timeline" icon={<TimelineGlyph className="h-4 w-4" />}>
        <ol className="flex flex-col gap-os-2">
          {DEVELOPMENT_MILESTONES.map((milestone, index) => (
            <li key={milestone.label} className="flex items-center gap-os-2 text-os-caption">
              <span
                className={`flex h-2.5 w-2.5 rounded-full ${
                  index < 6 ? 'bg-[color:var(--color-os-accent)]' : 'bg-[color:var(--color-os-glass-border)]'
                }`}
                aria-hidden
              />
              <span className="text-[color:var(--color-os-text-secondary)]">{milestone.label}</span>
              <span className="text-[color:var(--color-os-text-tertiary)]">{milestone.value}</span>
            </li>
          ))}
        </ol>
      </WidgetShell>
    </>
  );

  if (isMobile) {
    return <div className="grid gap-os-3 px-os-4 pt-os-20 pb-os-4 md:hidden">{content}</div>;
  }

  return (
    <div className="pointer-events-none absolute right-os-4 top-12 z-20 hidden w-[min(360px,calc(100vw-2rem))] gap-os-3 md:flex md:flex-col">
      <div className="pointer-events-auto flex flex-col gap-os-3">{content}</div>
    </div>
  );
}
