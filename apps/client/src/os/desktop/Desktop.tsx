import type { ReactNode } from 'react';
import { MenuBar } from '@/os/menu-bar/MenuBar';
import { Dock } from '@/os/dock/Dock';
import { WindowManager } from '@/os/window-manager/WindowManager';
import { Spotlight } from '@/os/spotlight/Spotlight';
import { Wallpaper } from '@/os/theme/Wallpaper';
import type { AppId } from '@/os/appRegistry';
import { AboutApp } from '@/apps/about/AboutApp';
import { ProjectsApp } from '@/apps/projects/ProjectsApp';
import { SkillsApp } from '@/apps/skills/SkillsApp';
import { ExperienceApp } from '@/apps/experience/ExperienceApp';
import { EducationApp } from '@/apps/education/EducationApp';
import { AchievementsApp } from '@/apps/achievements/AchievementsApp';
import { ContactApp } from '@/apps/contact/ContactApp';
import { useWindowStore } from '@/store/useWindowStore';

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
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Wallpaper className="absolute inset-0" variant="shell" />
      {!hasFullscreenWindow && <MenuBar />}
      {/* {!hasFullscreenWindow && <StatusWidgets />} temporary: hide status widgets */}
      <WindowManager renderAppContent={renderAppContent} />
      {!hasFullscreenWindow && <Dock />}
      {!hasFullscreenWindow && <Spotlight />}
    </div>
  );
}

/**
 * Maps an AppId to its real content component, per Phase 4 (coding prompt
 * item 10). This is the one function docs/07-os-shell.md flagged as the
 * only thing that would need to change when real apps/* components
 * replaced the placeholder — WindowManager itself was never touched.
 */
function renderAppContent(appId: AppId): ReactNode {
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
