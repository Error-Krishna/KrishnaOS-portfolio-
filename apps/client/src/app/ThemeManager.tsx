import { useEffect } from 'react';
import { useThemeStore, type ThemeMode } from '@/store/useThemeStore';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(themeMode: ThemeMode): 'light' | 'dark' {
  return themeMode === 'system' ? getSystemTheme() : themeMode;
}

/**
 * Keeps the root `data-os-theme` attribute and `color-scheme` in sync with the
 * user's theme choice. Theme is stored in Zustand so every shell surface can
 * react to the same value without prop drilling.
 */
export function ThemeManager() {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(themeMode);
      root.dataset.osTheme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (themeMode !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return null;
}
