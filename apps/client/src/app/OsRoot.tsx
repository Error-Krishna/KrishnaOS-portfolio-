import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BootSequence } from '@/boot/BootSequence';
import { WelcomeScreen } from '@/welcome/WelcomeScreen';
import { Wallpaper } from '@/os/theme/Wallpaper';
import { TourController } from '@/tour/TourController';
import { APP_REGISTRY, type AppId } from '@/os/appRegistry';
import { useBootStore } from '@/store/useBootStore';
import { useModeStore } from '@/store/useModeStore';
import { useWindowStore } from '@/store/useWindowStore';

function isAppId(value: string): value is AppId {
  return Object.prototype.hasOwnProperty.call(APP_REGISTRY, value);
}

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
const DesktopRoute = lazy(
  () =>
    import('@/os/desktop/Desktop').then((module) => ({
      default: module.Desktop,
    })),
);

const RecruiterRoute = lazy(
  () =>
    import('@/recruiter/RecruiterRoot').then((module) => ({
      default: module.RecruiterRoot,
    })),
);

export function OsRoot() {
  const isBootComplete = useBootStore((s) => s.isBootComplete);
  const completeBoot = useBootStore((s) => s.completeBoot);
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);
  const openWindow = useWindowStore((s) => s.openWindow);
  const [searchParams, setSearchParams] = useSearchParams();
  const handledDeepLink = useRef(false);

  // Deep links: `/?app=projects` (any AppId) skips the Welcome gate and lands
  // in Free Exploration with that window already open, so a specific app can
  // be shared directly. Boot still plays first, per the UX doc ("non-skippable
  // threshold"); the param is consumed once and then removed from the URL.
  useEffect(() => {
    if (!isBootComplete || handledDeepLink.current) return;

    const requestedApp = searchParams.get('app');
    if (!requestedApp) return;

    handledDeepLink.current = true;
    if (isAppId(requestedApp)) {
      setMode('free');
      openWindow(requestedApp);
    }
    setSearchParams({}, { replace: true });
  }, [isBootComplete, searchParams, setSearchParams, setMode, openWindow]);

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
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                    Loading desktop…
                  </p>
                </div>
              }
            >
              <DesktopRoute />
            </Suspense>
            {mode === 'tour' && <TourController />}
          </motion.div>
        )}

        {isBootComplete && mode === 'recruiter' && (
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                  Loading recruiter mode…
                </p>
              </div>
            }
          >
            <RecruiterRoute />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
