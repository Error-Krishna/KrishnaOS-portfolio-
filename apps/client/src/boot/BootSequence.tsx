import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBootTimeline } from './useBootTimeline';
import { useBootStore } from '@/store/useBootStore';

const SKIP_AFFORDANCE_DELAY_MS = 1500;

interface BootSequenceProps {
  onComplete: () => void;
}

/**
 * Boot sequence per UX flow doc §2. Non-skippable in the sense that it
 * always plays *something* (never straight to Welcome with zero transition),
 * but offers a "Skip" affordance after 1.5s as a courtesy for anyone who
 * doesn't want to wait it out.
 */
export function BootSequence({ onComplete }: BootSequenceProps) {
  const completeBoot = useBootStore((s) => s.completeBoot);
  const [showSkip, setShowSkip] = useState(false);
  const hasFinishedRef = useRef(false);

  const screenRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const glassPanelRef = useRef<HTMLDivElement>(null);

  const finish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    completeBoot();
    onComplete();
  };

  useBootTimeline(
    {
      screen: screenRef,
      logo: logoRef,
      progress: progressRef,
      wallpaper: wallpaperRef,
      glassPanel: glassPanelRef,
    },
    finish,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkip(true), SKIP_AFFORDANCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    // Kill any in-flight GSAP tweens on our nodes so the skip is instant,
    // then jump straight to end state and fire completion.
    gsap.killTweensOf([logoRef.current, progressRef.current, wallpaperRef.current, glassPanelRef.current]);
    finish();
  };

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[color:var(--color-os-bg)]"
    >
      {/* Beat 5: blurred desktop wallpaper */}
      <div
        ref={wallpaperRef}
        className="absolute inset-0"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle at 30% 20%, rgb(90 60 160 / 0.5), transparent 60%), radial-gradient(circle at 75% 75%, rgb(20 90 180 / 0.45), transparent 55%), #0a0a0c',
        }}
        aria-hidden
      />

      {/* Beats 2–4: KrishnaOS mark + progress pulse */}
      <div ref={logoRef} className="absolute flex flex-col items-center gap-os-4" style={{ opacity: 0 }}>
        <span className="text-os-display font-semibold tracking-tight text-[color:var(--color-os-text-primary)]">
          KrishnaOS
        </span>
      </div>
      <div
        ref={progressRef}
        className="absolute top-1/2 mt-os-16 h-[3px] w-[120px] overflow-hidden rounded-os-full bg-[color:var(--color-os-glass-border)]"
        style={{ opacity: 0 }}
        aria-hidden
      >
        <div className="h-full w-full bg-[color:var(--color-os-accent)]" />
      </div>

      {/* Beat 6: Liquid Glass panel arriving on top of the blurred backdrop */}
      <div ref={glassPanelRef} className="glass-panel px-os-8 py-os-6" style={{ opacity: 0 }}>
        <p className="text-os-body text-[color:var(--color-os-text-secondary)]">Welcome panel arrives here</p>
      </div>

      {showSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute bottom-os-8 right-os-8 rounded-os-full px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
        >
          Skip
        </button>
      )}
    </div>
  );
}
