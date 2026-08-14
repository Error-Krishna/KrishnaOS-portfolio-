import type { TourStepId } from '@/store/useTourStore';
import type { AppId } from '@/os/appRegistry';

/**
 * Maps each of the UX flow doc's 8 tour steps (§4) to the window it opens
 * when the tour reaches that step — the concrete mechanism behind "rather
 * than a modal carousel, the tour drives the OS itself... each tour step
 * opens (or focuses) a relevant 'app' window."
 *
 * **Why "work" maps to `null`:** `useTourStore.TOUR_STEPS` has 8 entries
 * (about, work, projects, skills, experience, education, achievements,
 * contact) but `os/appRegistry.ts`'s `AppId` only has 7 — there's no "Work"
 * app. The UX doc describes the Work step as narrative framing ("what I
 * do (role/focus framing)"), not tied to one of the 7 confirmed content
 * pillars. Rather than inventing an 8th app just to give this step
 * something to open (which the coding prompt explicitly warns against —
 * "do not invent a huge number of apps yet"), Work intentionally opens no
 * window: the tour bar still advances and its label still changes, but
 * whatever window is already open (most likely About, from the previous
 * step) stays open and focused. This is a direct instance of UX doc §7
 * rule 2 ("no progress is silently lost") rather than an exception to it.
 */
export const TOUR_STEP_TO_APP: Record<TourStepId, AppId | null> = {
  about: 'about',
  work: null,
  projects: 'projects',
  skills: 'skills',
  experience: 'experience',
  education: 'education',
  achievements: 'achievements',
  contact: 'contact',
};

/** Human-readable label per step, shown in the tour bar ("2 of 8 — Work"). */
export const TOUR_STEP_LABELS: Record<TourStepId, string> = {
  about: 'About',
  work: 'Work',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  achievements: 'Achievements',
  contact: 'Contact',
};
