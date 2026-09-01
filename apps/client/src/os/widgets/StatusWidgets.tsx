import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ClockGlyph, GithubGlyph, NoteGlyph, RocketGlyph, TimelineGlyph, WeatherGlyph } from '@/os/icons';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useWidgetBoardStore, type WidgetId, type WidgetPosition } from '@/store/useWidgetBoardStore';
import { useProjectCatalog } from '@/apps/projects/useProjectCatalog';

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME ?? 'Error-Krishna';
const MOVE_STEP = 24;
const PROJECT_ROTATE_MS = 8000;
const NOTE_STORAGE_KEY = 'krishnaos:quickNote';
const NOTE_SAVE_DEBOUNCE_MS = 400;

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

function readStoredNote(): string {
  try {
    return localStorage.getItem(NOTE_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function persistNote(value: string): void {
  try {
    localStorage.setItem(NOTE_STORAGE_KEY, value);
  } catch {
    // Ignore storage failures — the note stays editable for this session,
    // it just won't survive a refresh.
  }
}

function clampPosition(position: WidgetPosition, width: number, height: number): WidgetPosition {
  if (typeof window === 'undefined') {
    return position;
  }

  const padding = 16;
  const maxX = Math.max(padding, window.innerWidth - width - padding);
  const maxY = Math.max(48, window.innerHeight - height - padding);

  return {
    x: Math.min(Math.max(position.x, padding), maxX),
    y: Math.min(Math.max(position.y, 48), maxY),
  };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

/**
 * Elements a drag should never start from — form controls, links, and
 * anything explicitly opted out via `data-widget-interactive`. Checked via
 * `.closest()` so a click anywhere *inside* one of these (e.g. text inside
 * a button) still counts as interactive, not just a click on the element
 * itself.
 */
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [data-widget-interactive]';

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) !== null : false;
}

interface WidgetHeaderProps {
  title: string;
  icon: ReactNode;
}

function WidgetHeader({ title, icon }: WidgetHeaderProps) {
  return (
    <div className="flex items-center gap-os-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-os-md bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]">
        {icon}
      </span>
      <h2 className="text-os-body font-semibold">{title}</h2>
    </div>
  );
}

interface DraggableWidgetProps {
  id: WidgetId;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

/**
 * A single freestanding desktop widget: its own glass card, its own entry
 * in `useWidgetBoardStore.positions`, its own drag/keyboard handling.
 *
 * **The whole card is the drag surface, like a real macOS widget or
 * Stickies note** — not just a small header handle. Krishna's exact
 * complaint after the first pass ("I can't move the widget freely like I
 * can on an actual Mac") was because dragging only worked from a narrow
 * grab-bar inside the header; grabbing anywhere else on the card did
 * nothing. `handlePointerDown` now starts a drag from a pointer-down
 * *anywhere* on the card, and only bails out via `isInteractiveTarget` when
 * the press actually lands on a real control (a button, link, the Quick
 * Note textarea, etc.) — so those controls still work normally, but every
 * other pixel of the widget is grabbable.
 *
 * Every widget remains fully independent of every other one — dragging
 * one never moves another, and each remembers its own position across
 * reloads.
 */
function DraggableWidget({ id, title, icon, children }: DraggableWidgetProps) {
  const isMobile = useIsMobile();
  const position = useWidgetBoardStore((s) => s.positions[id]);
  const setPosition = useWidgetBoardStore((s) => s.setPosition);
  const resetPosition = useWidgetBoardStore((s) => s.resetPosition);
  const { ref, size } = useElementSize<HTMLElement>();
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPosition: WidgetPosition;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Re-clamp this widget (and only this widget) if the viewport shrinks
  // enough that its saved position would now sit off-screen.
  useEffect(() => {
    if (isMobile || size.width <= 0 || size.height <= 0) {
      return;
    }

    const handleResize = () => {
      const current = useWidgetBoardStore.getState().positions[id];
      setPosition(id, clampPosition(current, size.width, size.height));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id, isMobile, setPosition, size.height, size.width]);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || isMobile || isInteractiveTarget(event.target)) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId || isMobile) {
      return;
    }

    const nextPosition = clampPosition(
      {
        x: drag.startPosition.x + (event.clientX - drag.startX),
        y: drag.startPosition.y + (event.clientY - drag.startY),
      },
      size.width,
      size.height,
    );
    setPosition(id, nextPosition);
  };

  const finishDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = dragState.current;
    if (drag && drag.pointerId === event.pointerId) {
      dragState.current = null;
      setIsDragging(false);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile || isInteractiveTarget(event.target)) {
      return;
    }
    resetPosition(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (isMobile || event.currentTarget !== event.target) {
      return;
    }

    const delta = event.shiftKey ? MOVE_STEP * 4 : MOVE_STEP;
    let nextPosition = position;

    switch (event.key) {
      case 'ArrowLeft':
        nextPosition = { ...position, x: position.x - delta };
        break;
      case 'ArrowRight':
        nextPosition = { ...position, x: position.x + delta };
        break;
      case 'ArrowUp':
        nextPosition = { ...position, y: position.y - delta };
        break;
      case 'ArrowDown':
        nextPosition = { ...position, y: position.y + delta };
        break;
      default:
        return;
    }

    event.preventDefault();
    setPosition(id, clampPosition(nextPosition, size.width, size.height));
  };

  if (isMobile) {
    return (
      <section className="glass-panel flex flex-col gap-os-3 p-os-4">
        <WidgetHeader title={title} icon={icon} />
        {children}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      tabIndex={0}
      aria-label={`${title} widget. Draggable — click and drag anywhere on the card to move it, arrow keys to nudge, double-click to reset.`}
      style={{ left: position.x, top: position.y, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={`glass-panel pointer-events-auto absolute flex w-[260px] cursor-grab select-none flex-col gap-os-3 p-os-4 shadow-[0_20px_50px_rgb(0_0_0/0.3)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-os-accent)] active:cursor-grabbing ${
        isDragging ? 'shadow-[0_28px_64px_rgb(0_0_0/0.45)]' : ''
      }`}
    >
      <WidgetHeader title={title} icon={icon} />
      {children}
    </section>
  );
}

function QuickNoteWidget() {
  const [note, setNote] = useState(() => readStoredNote());
  const [justSaved, setJustSaved] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    setNote(value);
    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      persistNote(value);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1200);
    }, NOTE_SAVE_DEBOUNCE_MS);
  };

  return (
    <>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type something…"
        rows={4}
        data-widget-interactive
        className="w-full resize-none rounded-os-sm border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-2 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
      />
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        {justSaved ? 'Saved locally' : 'Autosaves to this browser'}
      </p>
    </>
  );
}

/**
 * Rotates through the live, GitHub-synced project catalog (same source
 * as the Projects window and Recruiter Mode — see `useProjectCatalog`)
 * rather than a separate hardcoded list, so this widget can never drift
 * out of sync with what "Featured" actually means elsewhere in KrishnaOS.
 */
function FeaturedProjectWidget() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { projects, loading, error } = useProjectCatalog();
  const featuredProjects = useMemo(() => projects.filter((project) => project.featured), [projects]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || featuredProjects.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % featuredProjects.length);
    }, PROJECT_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, featuredProjects.length]);

  if (loading) {
    return <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Loading projects…</p>;
  }

  if (error) {
    return <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Projects unavailable right now.</p>;
  }

  if (featuredProjects.length === 0) {
    return (
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        No featured projects yet.
      </p>
    );
  }

  const project = featuredProjects[index % featuredProjects.length];
  const primaryLink = project.links.live ?? project.links.github ?? project.links.caseStudy;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="flex flex-col gap-os-2"
    >
      <div className="flex items-center gap-os-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-md bg-[color:var(--color-os-accent)] text-os-body font-semibold text-white">
          {project.title.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-os-body font-semibold">{project.title}</p>
          <p className="truncate text-os-caption text-[color:var(--color-os-text-secondary)]">{project.summary}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-os-1">
        {project.stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="rounded-os-full bg-[color:var(--color-os-glass)] px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {primaryLink ? (
          <a
            href={primaryLink}
            target="_blank"
            rel="noreferrer"
            className="text-os-caption font-medium text-[color:var(--color-os-accent)] hover:underline"
          >
            View Project →
          </a>
        ) : (
          <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">No link set yet</span>
        )}

        {featuredProjects.length > 1 && (
          <div className="flex items-center gap-os-1" data-widget-interactive>
            {featuredProjects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Show ${p.title}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index
                    ? 'bg-[color:var(--color-os-accent)]'
                    : 'bg-[color:var(--color-os-glass-border)] hover:bg-[color:var(--color-os-text-tertiary)]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusWidgets() {
  const isMobile = useIsMobile();
  const now = useClock();
  const weather = useWeather();
  const avatar = useGithubAvatar();

  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateLabel = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const widgets = (
    <>
      <DraggableWidget id="clock" title="Time" icon={<ClockGlyph className="h-4 w-4" />}>
        <p className="text-os-title font-semibold">{timeLabel}</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{dateLabel}</p>
      </DraggableWidget>

      <DraggableWidget id="weather" title="Weather" icon={<WeatherGlyph className="h-4 w-4" />}>
        <p className="text-os-body font-semibold">{weather.label}</p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          {weather.temperature != null ? `${Math.round(weather.temperature)}°F` : 'Live local conditions'}
        </p>
        {weather.summary && (
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{weather.summary}</p>
        )}
      </DraggableWidget>

      <DraggableWidget id="github" title="GitHub" icon={<GithubGlyph className="h-4 w-4" />}>
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
            src={`https://github-contributions-api.deno.dev/${GITHUB_USERNAME}`}
            alt="GitHub contribution graph"
            className="h-auto w-full"
          />
        </div>
      </DraggableWidget>

      <DraggableWidget id="timeline" title="Timeline" icon={<TimelineGlyph className="h-4 w-4" />}>
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
      </DraggableWidget>

      <DraggableWidget id="featuredProject" title="Featured Project" icon={<RocketGlyph className="h-4 w-4" />}>
        <FeaturedProjectWidget />
      </DraggableWidget>

      <DraggableWidget id="quickNote" title="Quick Note" icon={<NoteGlyph className="h-4 w-4" />}>
        <QuickNoteWidget />
      </DraggableWidget>
    </>
  );

  if (isMobile) {
    return <div className="grid gap-os-3 px-os-4 pt-os-20 pb-os-4 md:hidden">{widgets}</div>;
  }

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-30 hidden h-full w-full md:block">{widgets}</div>
  );
}
