import { create } from 'zustand';

const SEEN_BOOT_KEY = 'krishnaos:seenBoot';

function hasSeenBootThisSession(): boolean {
  try {
    return sessionStorage.getItem(SEEN_BOOT_KEY) === 'true';
  } catch {
    // sessionStorage can throw in some privacy modes — fail open to "not seen"
    // so the boot sequence still plays rather than crashing the app.
    return false;
  }
}

function markBootSeen(): void {
  try {
    sessionStorage.setItem(SEEN_BOOT_KEY, 'true');
  } catch {
    // Ignore — worst case the boot sequence replays on next load.
  }
}

interface BootStore {
  /** True once the boot sequence has finished (or was skipped) this load. */
  isBootComplete: boolean;
  /** True if this session has already seen a full boot (per sessionStorage) —
   * used to decide whether to play the full 4-6s sequence or the compressed
   * ~1.5s fast-fade variant, per UX doc §2 skip logic. */
  isReturningThisSession: boolean;
  completeBoot: () => void;
}

export const useBootStore = create<BootStore>((set) => ({
  isBootComplete: false,
  isReturningThisSession: hasSeenBootThisSession(),
  completeBoot: () => {
    markBootSeen();
    set({ isBootComplete: true });
  },
}));
