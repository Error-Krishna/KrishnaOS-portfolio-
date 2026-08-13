import { create } from 'zustand';

/** The 8 tour steps, in order, per UX flow doc §4. */
export const TOUR_STEPS = [
  'about',
  'work',
  'projects',
  'skills',
  'experience',
  'education',
  'achievements',
  'contact',
] as const;

export type TourStepId = (typeof TOUR_STEPS)[number];

interface TourStore {
  isActive: boolean;
  stepIndex: number;

  startTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  /** Ends the tour without resetting whatever window state is currently open,
   * per UX doc §7 rule 2 ("no progress is silently lost"). */
  skipTour: () => void;
}

export const useTourStore = create<TourStore>((set, get) => ({
  isActive: false,
  stepIndex: 0,

  startTour: () => set({ isActive: true, stepIndex: 0 }),

  nextStep: () => {
    const next = get().stepIndex + 1;
    if (next >= TOUR_STEPS.length) {
      set({ isActive: false });
      return;
    }
    set({ stepIndex: next });
  },

  previousStep: () => {
    set({ stepIndex: Math.max(0, get().stepIndex - 1) });
  },

  skipTour: () => set({ isActive: false }),
}));
