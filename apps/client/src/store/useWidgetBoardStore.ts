import { create } from "zustand";

export type WidgetId =
  "clock" | "weather" | "github" | "featuredProject" | "quickNote";

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

const STORAGE_KEY = "krishnaos:widgetPositions:v3";

const WIDGET_IDS: WidgetId[] = [
  "clock",
  "weather",
  "github",
  "featuredProject",
  "quickNote",
];

const WIDGET_GAP = 16;
const SCREEN_PADDING = 24;
const MENU_BAR_HEIGHT = 36;

function computeDefaultPositions(): Record<WidgetId, WidgetPosition> {
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1440;

  const top = MENU_BAR_HEIGHT + SCREEN_PADDING;

  const SMALL_WIDTH = 260;
  const GITHUB_WIDTH = 620;

  const left = SCREEN_PADDING;

  const githubLeft = Math.max(
    SCREEN_PADDING,
    Math.min(
      Math.round((viewportWidth - GITHUB_WIDTH) / 2),
      viewportWidth - GITHUB_WIDTH - SCREEN_PADDING,
    ),
  );

  return {
    clock: {
      x: left,
      y: top,
    },

    weather: {
      x: left + SMALL_WIDTH + WIDGET_GAP,
      y: top,
    },

    github: {
      x: githubLeft,
      y: top + 112 + WIDGET_GAP,
    },

    featuredProject: {
      x: left,
      y: top + 112 + WIDGET_GAP + 240 + WIDGET_GAP,
    },

    quickNote: {
      x: left + SMALL_WIDTH + WIDGET_GAP,
      y: top + 112 + WIDGET_GAP + 240 + WIDGET_GAP,
    },
  };
}

function isWidgetPosition(value: unknown): value is WidgetPosition {
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    "y" in value &&
    typeof (value as { x: unknown }).x === "number" &&
    typeof (value as { y: unknown }).y === "number"
  );
}

function readStoredPositions(): Partial<Record<WidgetId, WidgetPosition>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return {};

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

function persistPositions(positions: Record<WidgetId, WidgetPosition>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
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
