import { AnimatePresence, motion } from 'framer-motion';
import { BootSequence } from '@/boot/BootSequence';
import { WelcomeScreen } from '@/welcome/WelcomeScreen';
import { Desktop } from '@/os/desktop/Desktop';
import { RecruiterRoot } from '@/recruiter/RecruiterRoot';
import { Wallpaper } from '@/os/theme/Wallpaper';
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
          <div key="welcome" className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <Wallpaper className="absolute inset-0" variant="shell" />
            <div className="relative z-10">
              <WelcomeScreen />
            </div>
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

        {isBootComplete && mode === 'recruiter' && <RecruiterRoot key={mode} />}
      </AnimatePresence>
    </div>
  );
}
