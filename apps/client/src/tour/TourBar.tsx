interface TourBarActiveProps {
  completed?: false;
  stepIndex: number;
  stepLabel: string;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

interface TourBarCompletedProps {
  completed: true;
  onExploreFreely: () => void;
  onBackToWelcome: () => void;
}

type TourBarProps = TourBarActiveProps | TourBarCompletedProps;

/**
 * The persistent tour-bar, per UX flow doc §4: "current step label, Back /
 * Next controls, Skip Tour — always visible, always one click."
 *
 * **Positioned top-adjacent (`top-9`, right below MenuBar's 36px height),
 * not bottom** — the Dock already occupies bottom-center (see
 * `os/dock/Dock.tsx`), and the UX doc explicitly allows either placement
 * ("bottom or top-adjacent, not blocking content"). Top-adjacent avoids
 * fighting the Dock for the same screen real estate.
 *
 * Two render states, matching UX doc §4's two situations:
 * - **Active step**: progress label + Back/Next/Skip.
 * - **Completed** (`completed: true`): "final step ends with the tour bar
 *   offering 'Explore Freely' and 'Back to Welcome' — never a dead end."
 *   See `TourController`'s comment on exactly when this state is reached.
 */
export function TourBar(props: TourBarProps) {
  return (
    <div className="glass-bar pointer-events-none absolute top-9 left-0 right-0 z-40 flex h-10 items-center justify-center px-os-4">
      <div className="pointer-events-auto flex items-center gap-os-4">
        {props.completed ? (
          <>
            <span className="text-os-caption text-[color:var(--color-os-text-secondary)]">Tour complete</span>
            <button
              type="button"
              onClick={props.onExploreFreely}
              className="text-os-caption font-medium text-[color:var(--color-os-accent)] hover:underline"
            >
              Explore Freely
            </button>
            <button
              type="button"
              onClick={props.onBackToWelcome}
              className="text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:text-[color:var(--color-os-text-primary)] hover:underline"
            >
              ← Back to Welcome
            </button>
          </>
        ) : (
          <>
            <span className="text-os-caption text-[color:var(--color-os-text-secondary)]">
              {props.stepIndex + 1} of {props.totalSteps} — {props.stepLabel}
            </span>
            <div className="flex items-center gap-os-2">
              <button
                type="button"
                onClick={props.onBack}
                disabled={!props.canGoBack}
                className="rounded-os-sm px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:text-[color:var(--color-os-text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={props.onNext}
                className="rounded-os-sm bg-[color:var(--color-os-accent)] px-os-3 py-os-1 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
              >
                Next
              </button>
            </div>
            <button
              type="button"
              onClick={props.onSkip}
              className="text-os-caption text-[color:var(--color-os-text-tertiary)] transition-colors hover:text-[color:var(--color-os-text-secondary)] hover:underline"
            >
              Skip Tour
            </button>
          </>
        )}
      </div>
    </div>
  );
}
