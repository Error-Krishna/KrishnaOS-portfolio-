import { useEffect, useRef, useState } from "react";
import type { AppId } from "@/os/appRegistry";
import { TOUR_STEPS, useTourStore } from "@/store/useTourStore";
import { useWindowStore } from "@/store/useWindowStore";
import { useModeStore } from "@/store/useModeStore";
import {
  TOUR_STEP_LABELS,
  TOUR_STEP_TO_APP,
  TOUR_STEP_DETAILS,
} from "./tourSteps";
import { TourBar } from "./TourBar";

export function TourController() {
  const isActive = useTourStore((s) => s.isActive);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const nextStep = useTourStore((s) => s.nextStep);
  const previousStep = useTourStore((s) => s.previousStep);
  const skipTour = useTourStore((s) => s.skipTour);

  const openWindow = useWindowStore((s) => s.openWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  const tourAppRef = useRef<AppId | null>(null);
  const setMode = useModeStore((s) => s.setMode);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentStepId = TOUR_STEPS[stepIndex];
  const currentStep = TOUR_STEP_DETAILS[currentStepId];

  useEffect(() => {
    if (!isActive || !currentStepId) return;

    const targetApp = TOUR_STEP_TO_APP[currentStepId];

    if (tourAppRef.current && tourAppRef.current !== targetApp) {
      closeWindow(tourAppRef.current);
    }

    if (targetApp) {
      openWindow(targetApp);
      tourAppRef.current = targetApp;
    } else {
      tourAppRef.current = null;
    }
  }, [isActive, currentStepId, openWindow, closeWindow]);

  useEffect(() => {
    if (isActive) return;

    tourAppRef.current = null;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skipTour();
        setMode("free");
        return;
      }

      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        setDirection(1);
        setIsTransitioning(true);

        window.setTimeout(() => {
          nextStep();
          setIsTransitioning(false);
        }, 140);

        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        if (stepIndex === 0) return;

        setDirection(-1);
        setIsTransitioning(true);

        window.setTimeout(() => {
          previousStep();
          setIsTransitioning(false);
        }, 140);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, previousStep, setMode, skipTour, stepIndex]);

  const handleNext = () => {
    setDirection(1);
    setIsTransitioning(true);

    window.setTimeout(() => {
      nextStep();
      setIsTransitioning(false);
    }, 140);
  };

  const handleBack = () => {
    if (stepIndex === 0) return;

    setDirection(-1);
    setIsTransitioning(true);

    window.setTimeout(() => {
      previousStep();
      setIsTransitioning(false);
    }, 140);
  };

  const handleSkip = () => {
    skipTour();
    setMode("free");
  };

  if (!isActive) {
    return (
      <TourBar
        completed
        onExploreFreely={() => setMode("free")}
        onBackToWelcome={() => setMode("welcome")}
      />
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <TourBar
      stepIndex={stepIndex}
      stepLabel={TOUR_STEP_LABELS[currentStepId]}
      totalSteps={TOUR_STEPS.length}
      eyebrow={currentStep.eyebrow}
      title={currentStep.title}
      description={currentStep.description}
      hint={currentStep.hint}
      progress={((stepIndex + 1) / TOUR_STEPS.length) * 100}
      direction={direction}
      isTransitioning={isTransitioning}
      canGoBack={stepIndex > 0}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
    />
  );
}
