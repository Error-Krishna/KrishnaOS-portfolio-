import Fuse, { type IFuseOptions } from 'fuse.js';

/**
 * A single searchable entry in the Spotlight index. `targetAppId` maps back
 * to a Dock/window id so selecting a result can call openWindow(targetAppId).
 */
export interface SearchableEntry {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  targetAppId: string;
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
 * Placeholder index. Replace with real content once the apps/* content
 * (projects, experience, etc.) is wired to actual data.
 */
const placeholderEntries: SearchableEntry[] = [
  { id: 'about', title: 'About', keywords: ['bio', 'who', 'intro'], targetAppId: 'about' },
  { id: 'projects', title: 'Projects', keywords: ['work', 'case studies', 'portfolio'], targetAppId: 'projects' },
  { id: 'skills', title: 'Skills', keywords: ['stack', 'tech', 'frontend'], targetAppId: 'skills' },
  { id: 'experience', title: 'Experience', keywords: ['work history', 'jobs'], targetAppId: 'experience' },
  { id: 'education', title: 'Education', keywords: ['school', 'degree'], targetAppId: 'education' },
  { id: 'achievements', title: 'Achievements', keywords: ['awards', 'wins'], targetAppId: 'achievements' },
  { id: 'contact', title: 'Contact', keywords: ['email', 'resume', 'github', 'linkedin'], targetAppId: 'contact' },
];

export function createSearchIndex(entries: SearchableEntry[] = placeholderEntries) {
  return new Fuse(entries, fuseOptions);
}
