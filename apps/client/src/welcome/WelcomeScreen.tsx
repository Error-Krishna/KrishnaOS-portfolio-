import { motion } from 'framer-motion';
import type { OsMode } from '@krishnaos/shared-types';
import { useModeStore } from '@/store/useModeStore';
import { useTourStore } from '@/store/useTourStore';

interface WelcomeChoice {
  mode: OsMode;
  label: string;
  description: string;
}

const CHOICES: WelcomeChoice[] = [
  { mode: 'tour', label: 'Take a Tour', description: 'A guided walkthrough of the whole story.' },
  { mode: 'free', label: 'Explore Freely', description: 'Open desktop, no constraints.' },
  { mode: 'recruiter', label: 'Recruiter Mode', description: 'Everything you need, one screen.' },
];

/**
 * The Liquid Glass Welcome panel per UX flow doc §3. Renders in the exact
 * spot the boot sequence's glass panel arrived in — no jarring handoff.
 * All three destinations are peers: same size, same visual weight, no
 * primary/secondary hierarchy, per the doc's explicit rationale for why
 * Recruiter Mode gets equal billing rather than being buried in a menu.
 */
export function WelcomeScreen() {
  const setMode = useModeStore((s) => s.setMode);
  const startTour = useTourStore((s) => s.startTour);

  const handleChoice = (mode: OsMode) => {
    if (mode === 'tour') {
      startTour();
    }
    setMode(mode);
  };

  return (
    <motion.div
      className="glass-panel flex w-[min(560px,90vw)] flex-col items-center gap-os-6 px-os-8 py-os-8 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
    >
      <div className="flex flex-col items-center gap-os-2">
        <span className="text-os-title font-semibold tracking-tight">KrishnaOS</span>
        <span className="text-os-body text-[color:var(--color-os-text-secondary)]">
          Krishna Goyal — Frontend Engineer
        </span>
      </div>

      <div className="flex w-full flex-col gap-os-3 sm:flex-row">
        {CHOICES.map((choice) => (
          <motion.button
            key={choice.mode}
            type="button"
            onClick={() => handleChoice(choice.mode)}
            className="flex flex-1 flex-col items-center gap-os-1 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-4 py-os-4 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
            whileHover={{ backgroundColor: 'var(--color-os-glass-highlight)' }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-os-body font-medium">{choice.label}</span>
            <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{choice.description}</span>
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => handleChoice('free')}
        className="text-os-caption text-[color:var(--color-os-text-tertiary)] underline-offset-4 transition-colors hover:text-[color:var(--color-os-text-secondary)] hover:underline"
      >
        Skip intro, go straight to desktop
      </button>
    </motion.div>
  );
}
