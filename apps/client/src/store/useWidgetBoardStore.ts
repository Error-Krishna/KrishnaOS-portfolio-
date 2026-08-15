import { create } from 'zustand';

export type WidgetId = 'clock' | 'weather' | 'github' | 'timeline' | 'featuredProject' | 'quickNote';

export interface WidgetPosition {
  x: number;
  y: number;
}

interface WidgetBoardStore {
  positions: Record<WidgetId, WidgetPosition>;
  setPosition: (id: WidgetId, position: WidgetPosition) => void;
  resetPosition: (id: WidgetId) => void;
  resetAll: () => void;
}

const STORAGE_KEY = 'krishnaos:widgetPositions';

/**
 * Every widget is independently positioned and independently draggable —
 * per Krishna's explicit note that a real desktop OS's widgets "move
 * independently... not as a bundle." There is deliberately no shared
 * "board" position anymore; each id in `WIDGET_LAYOUT` gets its own entry
 * in `positions`, and dragging one never touches another's.
 *
 * `WIDGET_LAYOUT` exists only to lay widgets out in a non-overlapping
 * starting arrangement the *first* time a visitor loads the site (before
 * anything has a real measured size or a saved position) — it's a
 * starting-position heuristic, not a constraint enforced afterward. Once
 * mounted, each widget's real measured size (via StatusWidgets.tsx's
 * ResizeObserver-based clamping) is what matters for keeping it on-screen,
 * and it can be freely dragged anywhere from there, including across
 * columns — `column` below only decides where it starts.
 */
const WIDGET_LAYOUT: Array<{ id: WidgetId; column: number; height: number }> = [
  { id: 'clock', column: 0, height: 96 },
  { id: 'weather', column: 0, height: 132 },
  { id: 'github', column: 0, height: 208 },
  { id: 'timeline', column: 0, height: 200 },
  { id: 'featuredProject', column: 1, height: 224 },
  { id: 'quickNote', column: 1, height: 208 },
];

const WIDGET_GAP = 12;
const WIDGET_WIDTH = 260;
const RIGHT_MARGIN = 16;
const TOP_MARGIN = 48; // clears MenuBar's 36px height with a little breathing room

function computeDefaultPositions(): Record<WidgetId, WidgetPosition> {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const columnY: Record<number, number> = {};
  const positions = {} as Record<WidgetId, WidgetPosition>;

  for (const { id, column, height } of WIDGET_LAYOUT) {
    const x = Math.max(
      RIGHT_MARGIN,
      viewportWidth - (column + 1) * (WIDGET_WIDTH + WIDGET_GAP) - RIGHT_MARGIN + WIDGET_GAP,
    );
    const y = columnY[column] ?? TOP_MARGIN;
    positions[id] = { x, y };
    columnY[column] = y + height + WIDGET_GAP;
  }

  return positions;
}

function isWidgetPosition(value: unknown): value is WidgetPosition {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof (value as { x: unknown }).x === 'number' &&
    typeof (value as { y: unknown }).y === 'number'
  );
}

function readStoredPositions(): Partial<Record<WidgetId, WidgetPosition>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) return {};

    const result: Partial<Record<WidgetId, WidgetPosition>> = {};
    for (const { id } of WIDGET_LAYOUT) {
      const value = (parsed as Record<string, unknown>)[id];
      if (isWidgetPosition(value)) {
        result[id] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function persistPositions(positions: Record<WidgetId, WidgetPosition>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage failures — widgets stay movable for this session,
    // they just won't remember it on the next visit.
  }
}

function getInitialPositions(): Record<WidgetId, WidgetPosition> {
  // Defaults first, then overlay whatever was actually saved — this way a
  // visitor who's only ever moved the Clock widget still gets sensible
  // defaults for every other widget rather than `undefined`, and a newly
  // added widget (e.g. Quick Note, added after someone already had saved
  // positions) gets a sane default instead of crashing on a missing key.
  return { ...computeDefaultPositions(), ...readStoredPositions() };
}

export const useWidgetBoardStore = create<WidgetBoardStore>((set, get) => ({
  positions: getInitialPositions(),

  setPosition: (id, position) => {
    const next = { ...get().positions, [id]: position };
    persistPositions(next);
    set({ positions: next });
  },

  resetPosition: (id) => {
    const next = { ...get().positions, [id]: computeDefaultPositions()[id] };
    persistPositions(next);
    set({ positions: next });
  },

  resetAll: () => {
    const defaults = computeDefaultPositions();
    persistPositions(defaults);
    set({ positions: defaults });
  },
}));
