import { MenuBar } from '@/os/menu-bar/MenuBar';
import { Dock } from '@/os/dock/Dock';
import { WindowManager } from '@/os/window-manager/WindowManager';
import { Spotlight } from '@/os/spotlight/Spotlight';
import { APP_REGISTRY, type AppId } from '@/os/appRegistry';

/**
 * The full interactive desktop environment, per coding prompt Phase 3:
 * menu bar + dock + window manager + Spotlight, composed together.
 *
 * This is Free Exploration's home (UX flow doc §5) and will also be what
 * the Guided Tour (§4) renders underneath its tour-bar once Phase 5 wires
 * that up — the tour doesn't get its own separate desktop, it drives this
 * same one, per the UX doc: "rather than a modal carousel, the tour drives
 * the OS itself."
 */
export function Desktop() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MenuBar />
      <WindowManager renderAppContent={renderPlaceholderAppContent} />
      <Dock />
      <Spotlight />
    </div>
  );
}

/**
 * Placeholder content for windows until Phase 4 builds the real apps/*
 * components. Deliberately honest about being unbuilt (see context.md's
 * hard constraint #1 — no faking finished UI), same pattern as OsRoot's
 * ModePlaceholder.
 */
function renderPlaceholderAppContent(appId: AppId) {
  const app = APP_REGISTRY[appId];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-os-2 text-center">
      <p className="text-os-body font-medium">{app.title}</p>
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        Content not built yet — arriving in Phase 4.
      </p>
    </div>
  );
}
