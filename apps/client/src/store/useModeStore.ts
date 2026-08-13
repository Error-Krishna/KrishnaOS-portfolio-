import { create } from 'zustand';
import type { OsMode } from '@krishnaos/shared-types';

interface ModeStore {
  mode: OsMode;
  /** Set the active OS mode. Cross-mode navigation rules (UX doc §7) are
   * enforced by callers, not the store itself — this is a plain setter. */
  setMode: (mode: OsMode) => void;
}

export const useModeStore = create<ModeStore>((set) => ({
  mode: 'welcome',
  setMode: (mode) => set({ mode }),
}));
