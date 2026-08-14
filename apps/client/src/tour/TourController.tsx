import { useEffect } from 'react';
import { TOUR_STEPS, useTourStore } from '@/store/useTourStore';
import { useWindowStore } from '@/store/useWindowStore';
import { useModeStore } from '@/store/useModeStore';
import { TOUR_STEP_LABELS, TOUR_STEP_TO_APP } from './tourSteps';
import { TourBar } from './TourBar';

/**
 * Drives the guided tour, per UX flow doc §4: "rather than a modal
 * carousel, the tour drives the OS itself." Rendered as a sibling of
 * `<Desktop />` (see `OsRoot.tsx`) when `mode === 'tour'` — it doesn't own
 * or duplicate the desktop, it just opens/focuses windows on the same
 * `useWindowStore` every other entry point (Dock, Spotlight) writes to,
 * and renders the persistent `TourBar` on top.
 *
 * Because it renders *alongside* the real, fully-interactive `Desktop`
 * (not a restricted view), a visitor can drag, close, or open unrelated
 * windows mid-tour — the UX doc's "a curious visitor can go off-script
 * mid-tour by just interacting with the desktop; the tour bar stays
 * present but doesn't force them back on track" is true here by
 * construction, not by any special-casing in this component.
 */
export function TourController() {
  const isActive = useTourStore((s) => s.isActive);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const nextStep = useTourStore((s) => s.nextStep);
  const previousStep = useTourStore((s) => s.previousStep);
  const skipTour = useTourStore((s) => s.skipTour);
  const openWindow = useWindowStore((s) => s.openWindow);
  const setMode = useModeStore((s) => s.setMode);

  const currentStepId = TOUR_STEPS[stepIndex];

  // Open/focus the window mapped to the current step. openWindow is
  // idempotent (see docs/03-state-management.md) so re-running this on
  // every step change is safe — it either opens a new window or just
  // brings an already-open one to front. Steps mapped to `null` (see
  // tourSteps.ts's note on "work") intentionally do nothing here, leaving
  // whatever's already open untouched.
  useEffect(() => {
    if (!isActive) return;
    const targetApp = TOUR_STEP_TO_APP[currentStepId];
    if (targetApp) {
      openWindow(targetApp);
    }
  }, [isActive, currentStepId, openWindow]);

  const handleSkip = () => {
    // Per UX doc §4: "drops the visitor into Free Exploration at their
    // current point (the window that's open stays open — no jarring
    // reset)." skipTour() only flips useTourStore.isActive; setMode('free')
    // is what actually moves the visitor. Neither call touches
    // useWindowStore, so nothing closes or resets — this is UX doc §7
    // rule 2 in action.
    skipTour();
    setMode('free');
  };

  if (!isActive) {
    // Reached only via natural completion (advancing Next past the last
    // step, which useTourStore.nextStep() handles by setting isActive
    // false without changing mode). Skip always calls setMode('free')
    // itself above, which unmounts TourController before a render with
    // isActive === false could happen here — so this branch is
    // unambiguously "the tour finished," never "the tour was skipped."
    // Per UX doc §4's completion state: "never a dead end."
    return (
      <TourBar
        completed
        onExploreFreely={() => setMode('free')}
        onBackToWelcome={() => setMode('welcome')}
      />
    );
  }

  return (
    <TourBar
      stepIndex={stepIndex}
      stepLabel={TOUR_STEP_LABELS[currentStepId]}
      totalSteps={TOUR_STEPS.length}
      canGoBack={stepIndex > 0}
      onBack={previousStep}
      onNext={nextStep}
      onSkip={handleSkip}
    />
  );
}
