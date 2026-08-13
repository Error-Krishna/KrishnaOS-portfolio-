import { create } from 'zustand';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface OsWindow {
  /** Stable id, typically the app id (e.g. "about", "projects"). */
  id: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
}

interface WindowStore {
  openWindows: OsWindow[];
  focusedWindowId: string | null;

  openWindow: (id: string, opts?: Partial<Pick<OsWindow, 'position' | 'size'>>) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  moveWindow: (id: string, position: WindowPosition) => void;
  resizeWindow: (id: string, size: WindowSize) => void;
}

const DEFAULT_SIZE: WindowSize = { width: 720, height: 480 };
const DEFAULT_POSITION: WindowPosition = { x: 120, y: 96 };

let zIndexCounter = 1;

export const useWindowStore = create<WindowStore>((set, get) => ({
  openWindows: [],
  focusedWindowId: null,

  openWindow: (id, opts) => {
    const existing = get().openWindows.find((w) => w.id === id);
    if (existing) {
      get().focusWindow(id);
      return;
    }
    zIndexCounter += 1;
    const newWindow: OsWindow = {
      id,
      position: opts?.position ?? DEFAULT_POSITION,
      size: opts?.size ?? DEFAULT_SIZE,
      zIndex: zIndexCounter,
      isMinimized: false,
    };
    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
      focusedWindowId: id,
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.filter((w) => w.id !== id),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    }));
  },

  focusWindow: (id) => {
    zIndexCounter += 1;
    const nextZ = zIndexCounter;
    set((state) => ({
      openWindows: state.openWindows.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w)),
      focusedWindowId: id,
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
      focusedWindowId: state.focusedWindowId === id ? null : state.focusedWindowId,
    }));
  },

  moveWindow: (id, position) => {
    set((state) => ({
      openWindows: state.openWindows.map((w) => (w.id === id ? { ...w, position } : w)),
    }));
  },

  resizeWindow: (id, size) => {
    set((state) => ({
      openWindows: state.openWindows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  },
}));
