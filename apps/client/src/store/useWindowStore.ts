import { create } from 'zustand';
import { APP_REGISTRY, type AppId } from '@/os/appRegistry';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface OsWindow {
  /** Stable id, matches an AppId in the app registry (e.g. "about", "projects"). */
  id: AppId;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isFullscreen: boolean;
  previousGeometry: { position: WindowPosition, size: WindowSize } | null
}

interface WindowStore {
  openWindows: OsWindow[];
  focusedWindowId: AppId | null;

  openWindow: (id: AppId, opts?: Partial<Pick<OsWindow, 'position' | 'size'>>) => void;
  closeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  toggleFullscreen: (id: AppId) => void;
  moveWindow: (id: AppId, position: WindowPosition) => void;
  resizeWindow: (id: AppId, size: WindowSize) => void;
}

const DEFAULT_SIZE: WindowSize = { width: 720, height: 480 };

/** Slight cascade offset per newly-opened window so stacked windows don't
 * open perfectly on top of each other — mirrors real desktop OS behavior. */
const BASE_POSITION: WindowPosition = { x: 120, y: 96 };
const CASCADE_STEP = 28;
let cascadeCount = 0;

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
    const appDef = APP_REGISTRY[id];
    const cascadeOffset = (cascadeCount % 6) * CASCADE_STEP;
    cascadeCount += 1;
    const newWindow: OsWindow = {
      id,
      title: appDef.title,
      position: opts?.position ?? { x: BASE_POSITION.x + cascadeOffset, y: BASE_POSITION.y + cascadeOffset },
      size: opts?.size ?? appDef.defaultSize ?? DEFAULT_SIZE,
      zIndex: zIndexCounter,
      isMinimized: false,
      isFullscreen: false,
      previousGeometry: null
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
  toggleFullscreen: (id) => {
    const target = get().openWindows.find((w) => w.id === id);
    if(!target) return;
    if(!target.isFullscreen){
      // entering the full screen, remember the current geometry
      set((state) => ({
        openWindows: state.openWindows.map((w) => (w.id ===id ? { ...w, isFullscreen: true, previousGeometry: { position: w.position, size: w.size } } : w))
      }));
    } else {
      // Exiting fullscreen — restore it.
      set((state) => ({
        openWindows: state.openWindows.map((w) => {
          if (w.id !== id) return w;
          const restored = w.previousGeometry;
          return {
            ...w,
            isFullscreen: false,
            previousGeometry: null,
            position: restored?.position ?? w.position,
            size: restored?.size ?? w.size,
          };
        }),
      }));

    }
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
