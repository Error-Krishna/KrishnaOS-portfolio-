import { AnimatePresence, motion } from 'framer-motion';
import { BootSequence } from '@/boot/BootSequence';
import { WelcomeScreen } from '@/welcome/WelcomeScreen';
import { Desktop } from '@/os/desktop/Desktop';
import { TourController } from '@/tour/TourController';
import { useBootStore } from '@/store/useBootStore';
import { useModeStore } from '@/store/useModeStore';

/**
 * Orchestrates the top-level "/" experience per UX flow doc §1:
 *   Boot Sequence → Liquid Glass Welcome → { Tour | Free | Recruiter }
 *
 * Boot always plays (full or compressed, decided inside BootSequence).
 * Welcome is the one forced gate after that. Everything past Welcome is a
 * peer destination — none is more "correct," and cross-mode navigation
 * (UX doc §7) means a visitor can always get back to Welcome or switch
 * between the three later via a persistent system-level control (the menu
 * bar, mounted inside Desktop so it's present across Tour and Free).
 *
 * Tour and Free both render the same real `<Desktop />` — the tour doesn't
 * get a separate, restricted environment, per UX doc §4: "rather than a
 * modal carousel, the tour drives the OS itself." `<TourController />`
 * mounts alongside it only in tour mode, driving which window is
 * open/focused per step and rendering the tour-bar on top.
 */
export function OsRoot() {
  const isBootComplete = useBootStore((s) => s.isBootComplete);
  const completeBoot = useBootStore((s) => s.completeBoot);
  const mode = useModeStore((s) => s.mode);

  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        {!isBootComplete && <BootSequence key="boot" onComplete={completeBoot} />}

        {isBootComplete && mode === 'welcome' && (
          <div key="welcome" className="flex h-full w-full items-center justify-center">
            <WelcomeScreen />
          </div>
        )}

        {isBootComplete && (mode === 'free' || mode === 'tour') && (
          <motion.div
            key={mode}
            className="relative h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Desktop />
            {mode === 'tour' && <TourController />}
          </motion.div>
        )}

        {isBootComplete && mode === 'recruiter' && (
          <motion.div
            key={mode}
            className="flex h-full w-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ModePlaceholder mode={mode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Stand-in for Recruiter Mode's real destination, which lands in Phase 6
 * (single-screen glass document view). Kept here (not faked as finished
 * UI) so the boot→welcome→mode wiring is honestly testable today without
 * pretending a later phase is done. Tour no longer uses this — as of
 * Phase 5 it renders the real `<Desktop />` + `<TourController />` above.
 */
function ModePlaceholder({ mode }: { mode: string }) {
  const setMode = useModeStore((s) => s.setMode);

  return (
    <div className="glass-panel flex flex-col items-center gap-os-4 px-os-8 py-os-6 text-center">
      <p className="text-os-title font-semibold capitalize">{mode} mode</p>
      <p className="text-os-body text-[color:var(--color-os-text-secondary)]">
        Not built yet — arriving in a later phase.
      </p>
      <button
        type="button"
        onClick={() => setMode('welcome')}
        className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
      >
        ← Back to Welcome
      </button>
    </div>
  );
}
