import type { AppId } from '@/os/appRegistry';

/**
 * Returns keyboard focus to an app's Dock icon — used after closing a window
 * so keyboard users land somewhere sensible instead of on <body>. Deferred
 * slightly so it runs after React has removed the window (and, if the window
 * was fullscreen, after the Dock has re-mounted).
 */
export function focusDockIcon(appId: AppId) {
  window.setTimeout(() => {
    document.querySelector<HTMLElement>(`[data-dock-app="${appId}"]`)?.focus();
  }, 60);
}
