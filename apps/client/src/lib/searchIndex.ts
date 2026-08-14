import Fuse, { type IFuseOptions } from 'fuse.js';
import { APP_ORDER, APP_REGISTRY, type AppId } from '@/os/appRegistry';

/**
 * A single searchable entry in the Spotlight index. `targetAppId` maps back
 * to a Dock/window id so selecting a result can call openWindow(targetAppId).
 */
export interface SearchableEntry {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  targetAppId: AppId;
}

const fuseOptions: IFuseOptions<SearchableEntry> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'keywords', weight: 0.3 },
    { name: 'subtitle', weight: 0.2 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

/**
 * Extra search keywords per app, layered on top of the app registry (the
 * single source of truth for title/id — see os/appRegistry.ts). Kept here
 * rather than on the registry itself because "words a visitor might type
 * to find this" is a search-specific concern, not a property of the app.
 */
const SEARCH_KEYWORDS: Record<AppId, string[]> = {
  about: ['bio', 'who', 'intro'],
  projects: ['work', 'case studies', 'portfolio'],
  skills: ['stack', 'tech', 'frontend'],
  experience: ['work history', 'jobs'],
  education: ['school', 'degree'],
  achievements: ['awards', 'wins'],
  contact: ['email', 'resume', 'github', 'linkedin'],
};

function buildDefaultEntries(): SearchableEntry[] {
  return APP_ORDER.map((appId) => {
    const app = APP_REGISTRY[appId];
    return {
      id: app.id,
      title: app.title,
      keywords: SEARCH_KEYWORDS[appId],
      targetAppId: app.id,
    };
  });
}

export function createSearchIndex(entries: SearchableEntry[] = buildDefaultEntries()) {
  return new Fuse(entries, fuseOptions);
}
