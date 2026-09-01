interface TourBarActiveProps {
  completed?: false;
  stepIndex: number;
  stepLabel: string;
  totalSteps: number;
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
  progress: number;
  direction: 1 | -1;
  isTransitioning: boolean;
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

export function TourBar(props: TourBarProps) {
  if (props.completed) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-9 z-40 flex justify-center px-os-4">
        <div className="pointer-events-auto animate-[tourEnter_400ms_ease-out] rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)]/90 px-os-5 py-os-3 shadow-[0_20px_60px_rgb(0_0_0/0.35)] backdrop-blur-xl">
          <div className="flex items-center gap-os-4">
            <div>
              <p className="text-os-caption font-medium text-[color:var(--color-os-accent)]">
                Tour complete
              </p>
              <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                You have seen the main story. The desktop is yours now.
              </p>
            </div>

            <button
              type="button"
              onClick={props.onExploreFreely}
              className="rounded-os-sm bg-[color:var(--color-os-accent)] px-os-3 py-os-1.5 text-os-caption font-medium text-white transition-transform hover:scale-105"
            >
              Explore Freely
            </button>

            <button
              type="button"
              onClick={props.onBackToWelcome}
              className="text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:text-[color:var(--color-os-text-primary)]"
            >
              Welcome
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contentClass = props.isTransitioning
    ? props.direction === 1
      ? "translate-x-2 opacity-0"
      : "-translate-x-2 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-9 z-40 flex justify-center px-os-4">
      <div className="pointer-events-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)]/90 shadow-[0_20px_60px_rgb(0_0_0/0.35)] backdrop-blur-xl">
          <div className="h-0.5 w-full bg-[color:var(--color-os-glass-border)]">
            <div
              className="h-full bg-[color:var(--color-os-accent)] transition-[width] duration-500 ease-out"
              style={{ width: `${props.progress}%` }}
            />
          </div>

          <div
            className={`flex flex-col gap-os-3 px-os-4 py-os-3 transition-all duration-150 ease-out sm:px-os-5 ${contentClass}`}
          >
            <div className="flex items-start justify-between gap-os-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-os-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-os-accent)]">
                    {props.eyebrow}
                  </span>

                  <span className="text-[10px] text-[color:var(--color-os-text-tertiary)]">
                    {props.stepLabel}
                  </span>
                </div>

                <h2 className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                  {props.title}
                </h2>

                <p className="mt-1 max-w-xl text-os-caption leading-relaxed text-[color:var(--color-os-text-secondary)]">
                  {props.description}
                </p>
              </div>

              <button
                type="button"
                onClick={props.onSkip}
                className="shrink-0 text-os-caption text-[color:var(--color-os-text-tertiary)] transition-colors hover:text-[color:var(--color-os-text-primary)]"
              >
                Skip
              </button>
            </div>

            <div className="flex flex-col gap-os-3 border-t border-[color:var(--color-os-glass-border)] pt-os-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                <span className="text-[color:var(--color-os-text-secondary)]">
                  Tip:
                </span>{" "}
                {props.hint}
              </p>

              <div className="flex shrink-0 items-center gap-os-2">
                <button
                  type="button"
                  onClick={props.onBack}
                  disabled={!props.canGoBack}
                  className="rounded-os-sm px-os-3 py-os-1.5 text-os-caption text-[color:var(--color-os-text-secondary)] transition-all hover:bg-[color:var(--color-os-glass)] hover:text-[color:var(--color-os-text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={props.onNext}
                  className="group rounded-os-sm bg-[color:var(--color-os-accent)] px-os-4 py-os-1.5 text-os-caption font-medium text-white transition-all hover:scale-105 hover:shadow-[0_8px_24px_rgb(0_0_0/0.25)] active:scale-95"
                >
                  {props.stepIndex === props.totalSteps - 1 ? "Finish" : "Next"}
                  <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-1.5">
          {Array.from({ length: props.totalSteps }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to tour step ${index + 1}`}
              onClick={() => {
                if (index === props.stepIndex) return;

                if (index > props.stepIndex) {
                  props.onNext();
                } else {
                  props.onBack();
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === props.stepIndex
                  ? "w-5 bg-[color:var(--color-os-accent)]"
                  : index < props.stepIndex
                    ? "w-1.5 bg-[color:var(--color-os-accent)]/60"
                    : "w-1.5 bg-[color:var(--color-os-glass-border)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
