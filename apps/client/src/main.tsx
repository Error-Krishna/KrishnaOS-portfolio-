import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { ThemeManager } from './app/ThemeManager';
import './index.css';

try {
  const storedThemeMode = localStorage.getItem('krishnaos:themeMode');
  const resolvedTheme =
    storedThemeMode === 'light' || storedThemeMode === 'dark'
      ? storedThemeMode
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.dataset.osTheme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
} catch {
  // Ignore startup theme hydration issues and let ThemeManager apply later.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeManager />
      <App />
    </BrowserRouter>
  </StrictMode>,
);
