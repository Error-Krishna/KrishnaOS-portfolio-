/**
 * Central catalog of "apps" that can be opened as windows, per the
 * confirmed content pillars in the UX flow doc and coding prompt (§5 data
 * model, Phase 3 dock roster). This is the single source of truth for:
 *   - what shows in the Dock
 *   - what Spotlight can search for and open
 *   - what a window's title bar displays
 *   - what the guided tour opens at each step
 *
 * Deliberately NOT expanded beyond the confirmed content pillars yet — the
 * coding prompt explicitly says not to invent a large app roster prematurely
 * (§3 Phase 3 note, §6). Settings/utility apps can be added here later
 * without touching Dock/Spotlight/WindowManager code, since they all read
 * from this one registry.
 */

export type AppId = 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'achievements' | 'contact';

export interface AppDefinition {
  id: AppId;
  title: string;
  /** Short label for compact UI (Dock tooltip, Spotlight subtitle). */
  shortLabel: string;
  defaultSize: { width: number; height: number };
}

/**
 * Icons are resolved by `AppGlyph({ appId })` in `os/icons.tsx`, keyed directly
 * off each entry's `id` — there is no separate icon field here on purpose.
 */
export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  about: { id: 'about', title: 'About', shortLabel: 'About', defaultSize: { width: 560, height: 420 } },
  projects: { id: 'projects', title: 'Projects', shortLabel: 'Projects', defaultSize: { width: 800, height: 560 } },
  skills: { id: 'skills', title: 'Skills', shortLabel: 'Skills', defaultSize: { width: 920, height: 640 } },
  experience: {
    id: 'experience',
    title: 'Experience',
    shortLabel: 'Experience',
    defaultSize: { width: 960, height: 680 },
  },
  education: {
    id: 'education',
    title: 'Education',
    shortLabel: 'Education',
    defaultSize: { width: 560, height: 400 },
  },
  achievements: {
    id: 'achievements',
    title: 'Achievements',
    shortLabel: 'Achievements',
    defaultSize: { width: 560, height: 420 },
  },
  contact: { id: 'contact', title: 'Contact', shortLabel: 'Contact', defaultSize: { width: 480, height: 440 } },
};

export const APP_ORDER: AppId[] = ['about', 'projects', 'skills', 'experience', 'education', 'achievements', 'contact'];
