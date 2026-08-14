import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'krishnaos:themeMode';

function readStoredThemeMode(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    // Fail open to the system theme when storage is unavailable.
  }
  return 'system';
}

function persistThemeMode(themeMode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch {
    // Ignore storage failures so theme switching still works in-memory.
  }
}

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: readStoredThemeMode(),
  setThemeMode: (themeMode) => {
    persistThemeMode(themeMode);
    set({ themeMode });
  },
}));
