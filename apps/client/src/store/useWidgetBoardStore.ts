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

const STORAGE_KEY = 'krishnaos:widgetPositions:v2';

const WIDGET_IDS: WidgetId[] = [
  'clock',
  'weather',
  'github',
  'timeline',
  'featuredProject',
  'quickNote',
];

const WIDGET_WIDTH = 260;
const WIDGET_GAP = 16;
const SCREEN_PADDING = 24;
const MENU_BAR_HEIGHT = 36;

/*
 * Conservative initial heights. These are only used for the first
 * layout before the widgets have been measured by ResizeObserver.
 */
const WIDGET_HEIGHTS: Record<WidgetId, number> = {
  clock: 112,
  weather: 148,
  github: 224,
  timeline: 216,
  featuredProject: 240,
  quickNote: 224,
};

function computeDefaultPositions(): Record<WidgetId, WidgetPosition> {
  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1280;

  const top = MENU_BAR_HEIGHT + SCREEN_PADDING;

  const availableWidth =
    viewportWidth - SCREEN_PADDING * 2;

  const maxColumns = Math.max(
    1,
    Math.floor(
      (availableWidth + WIDGET_GAP) /
        (WIDGET_WIDTH + WIDGET_GAP),
    ),
  );

  const columns = Math.min(WIDGET_IDS.length, maxColumns, 3);

  const totalWidth =
    columns * WIDGET_WIDTH +
    (columns - 1) * WIDGET_GAP;

  const boardLeft = Math.max(
    SCREEN_PADDING,
    viewportWidth - totalWidth - SCREEN_PADDING,
  );

  const positions = {} as Record<WidgetId, WidgetPosition>;

  /*
   * All widgets in a row share the same Y position.
   * Additional rows are only used when the screen is too narrow.
   */
  WIDGET_IDS.forEach((id, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    let rowHeight = 0;

    for (let i = row * columns; i < Math.min((row + 1) * columns, WIDGET_IDS.length); i += 1) {
      rowHeight = Math.max(rowHeight, WIDGET_HEIGHTS[WIDGET_IDS[i]]);
    }

    let y = top;

    for (let previousRow = 0; previousRow < row; previousRow += 1) {
      let previousRowHeight = 0;

      for (
        let i = previousRow * columns;
        i < Math.min((previousRow + 1) * columns, WIDGET_IDS.length);
        i += 1
      ) {
        previousRowHeight = Math.max(
          previousRowHeight,
          WIDGET_HEIGHTS[WIDGET_IDS[i]],
        );
      }

      y += previousRowHeight + WIDGET_GAP;
    }

    positions[id] = {
      x: boardLeft + column * (WIDGET_WIDTH + WIDGET_GAP),
      y,
    };

    void rowHeight;
  });

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

    for (const id of WIDGET_IDS) {
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

function persistPositions(
  positions: Record<WidgetId, WidgetPosition>,
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(positions),
    );
  } catch {
    // Ignore storage failures.
  }
}

function getInitialPositions(): Record<WidgetId, WidgetPosition> {
  return {
    ...computeDefaultPositions(),
    ...readStoredPositions(),
  };
}

export const useWidgetBoardStore = create<WidgetBoardStore>((set, get) => ({
  positions: getInitialPositions(),

  setPosition: (id, position) => {
    const next = {
      ...get().positions,
      [id]: position,
    };

    persistPositions(next);
    set({ positions: next });
  },

  resetPosition: (id) => {
    const next = {
      ...get().positions,
      [id]: computeDefaultPositions()[id],
    };

    persistPositions(next);
    set({ positions: next });
  },

  resetAll: () => {
    const defaults = computeDefaultPositions();

    persistPositions(defaults);
    set({ positions: defaults });
  },
}));

