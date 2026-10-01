import { lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MenuBar } from '@/os/menu-bar/MenuBar';
import { Dock } from '@/os/dock/Dock';
import { focusDockIcon } from '@/os/dock/dockFocus';
import { WindowManager } from '@/os/window-manager/WindowManager';
import { Spotlight } from '@/os/spotlight/Spotlight';
import { Wallpaper } from '@/os/theme/Wallpaper';
import type { AppId } from '@/os/appRegistry';
import { useWindowStore } from '@/store/useWindowStore';
import { StatusWidgets } from '@/os/widgets/StatusWidgets';

/**
 * Each app is code-split: its JS (and, for Projects, the heavy embedded
 * runners) is only downloaded the first time that window is opened, instead
 * of all seven apps shipping in the initial desktop bundle.
 */
const AboutApp = lazy(() => import('@/apps/about/AboutApp').then((m) => ({ default: m.AboutApp })));
const ProjectsApp = lazy(() => import('@/apps/projects/ProjectsApp').then((m) => ({ default: m.ProjectsApp })));
const SkillsApp = lazy(() => import('@/apps/skills/SkillsApp').then((m) => ({ default: m.SkillsApp })));
const ExperienceApp = lazy(() =>
  import('@/apps/experience/ExperienceApp').then((m) => ({ default: m.ExperienceApp })),
);
const EducationApp = lazy(() => import('@/apps/education/EducationApp').then((m) => ({ default: m.EducationApp })));
const AchievementsApp = lazy(() =>
  import('@/apps/achievements/AchievementsApp').then((m) => ({ default: m.AchievementsApp })),
);
const ContactApp = lazy(() => import('@/apps/contact/ContactApp').then((m) => ({ default: m.ContactApp })));

/**
 * The full interactive desktop environment, per coding prompt Phase 3:
 * menu bar + dock + window manager + Spotlight, composed together.
 *
 * This is Free Exploration's home (UX flow doc §5) and is also what the
 * Guided Tour (§4) renders underneath its tour-bar — `OsRoot.tsx` mounts
 * this same `<Desktop />` for both `mode === 'free'` and `mode === 'tour'`,
 * with `<TourController />` layered alongside it only in tour mode. The
 * tour never gets a separate, restricted desktop of its own, per the UX
 * doc: "rather than a modal carousel, the tour drives the OS itself." See
 * docs/09-guided-tour.md for the full breakdown.
 */
export function Desktop() {
  const hasFullscreenWindow = useWindowStore((s) => s.openWindows.some((w) => w.isFullscreen));

  // Window keyboard shortcuts. Alt+W closes and Alt+M minimizes the focused
  // window. (⌘W / Ctrl+W can't be used: browsers reserve them for closing the
  // tab and pages aren't allowed to intercept them.) `e.code` is used rather
  // than `e.key` because on macOS Option+W types a different character.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;

      const { focusedWindowId, closeWindow, minimizeWindow } = useWindowStore.getState();
      if (!focusedWindowId) return;

      if (e.code === 'KeyW') {
        e.preventDefault();
        closeWindow(focusedWindowId);
        focusDockIcon(focusedWindowId);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        minimizeWindow(focusedWindowId);
        focusDockIcon(focusedWindowId);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Wallpaper className="absolute inset-0" variant="shell" />
      {!hasFullscreenWindow && <MenuBar />}
      {!hasFullscreenWindow && <StatusWidgets />}
      <WindowManager renderAppContent={renderAppContent} />
      {!hasFullscreenWindow && <Dock />}
      {!hasFullscreenWindow && <Spotlight />}
    </div>
  );
}

function AppLoading() {
  return (
    <div className="flex h-full min-h-24 w-full items-center justify-center" role="status" aria-live="polite">
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Loading…</p>
    </div>
  );
}

/**
 * Maps an AppId to its real content component, per Phase 4 (coding prompt
 * item 10). This is the one function docs/07-os-shell.md flagged as the
 * only thing that would need to change when real apps/* components
 * replaced the placeholder — WindowManager itself was never touched.
 * Each app is lazy-loaded, so every case is wrapped in a Suspense boundary.
 */
function renderAppContent(appId: AppId): ReactNode {
  return <Suspense fallback={<AppLoading />}>{renderApp(appId)}</Suspense>;
}

function renderApp(appId: AppId): ReactNode {
  switch (appId) {
    case 'about':
      return <AboutApp />;
    case 'projects':
      return <ProjectsApp />;
    case 'skills':
      return <SkillsApp />;
    case 'experience':
      return <ExperienceApp />;
    case 'education':
      return <EducationApp />;
    case 'achievements':
      return <AchievementsApp />;
    case 'contact':
      return <ContactApp />;
  }
}
