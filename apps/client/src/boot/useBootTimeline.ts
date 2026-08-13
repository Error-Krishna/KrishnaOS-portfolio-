import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useBootStore } from '@/store/useBootStore';

export interface BootRefs {
  logo: React.RefObject<HTMLDivElement | null>;
  progress: React.RefObject<HTMLDivElement | null>;
  screen: React.RefObject<HTMLDivElement | null>;
  wallpaper: React.RefObject<HTMLDivElement | null>;
  glassPanel: React.RefObject<HTMLDivElement | null>;
}

/**
 * Drives the 6-beat boot sequence timeline per UX flow doc §2:
 *   1. Black screen (0.4s)
 *   2. Logo fades/scales in (1.2s)
 *   3. Progress indicator pulses (1.5s)
 *   4. Logo scales down, screen lightens (0.8s)
 *   5. Blurred wallpaper reveals (0.6s)
 *   6. Glass panel materializes (0.5s)
 *
 * On return visits within the same session, compresses to a fast-fade
 * (~1.5s total) instead of replaying the full sequence, per the skip logic
 * in the UX doc. `onComplete` fires once at the end either way.
 */
export function useBootTimeline(refs: BootRefs, onComplete: () => void) {
  const isReturningThisSession = useBootStore((s) => s.isReturningThisSession);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const { logo, progress, screen, wallpaper, glassPanel } = refs;
    if (!logo.current || !progress.current || !screen.current || !wallpaper.current || !glassPanel.current) {
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => onCompleteRef.current(),
    });

    if (isReturningThisSession) {
      // Compressed fast-fade: skip straight to wallpaper + glass panel.
      gsap.set([logo.current, progress.current], { autoAlpha: 0 });
      tl.set(wallpaper.current, { autoAlpha: 0, filter: 'blur(40px)' })
        .to(wallpaper.current, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' })
        .fromTo(
          glassPanel.current,
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' },
          '-=0.15',
        );
      return () => {
        tl.kill();
      };
    }

    // Full sequence.
    gsap.set(logo.current, { autoAlpha: 0, scale: 0.9 });
    gsap.set(progress.current, { autoAlpha: 0 });
    gsap.set(wallpaper.current, { autoAlpha: 0, filter: 'blur(40px)' });
    gsap.set(glassPanel.current, { autoAlpha: 0, scale: 0.96 });

    tl
      // Beat 1 — black screen, silent breath
      .to(screen.current, { duration: 0.4 })
      // Beat 2 — logo fades/scales in
      .to(logo.current, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.out' })
      // Beat 3 — progress indicator pulses beneath mark
      .to(progress.current, { autoAlpha: 1, duration: 0.3 }, '-=0.9')
      .to(progress.current, { autoAlpha: 0.4, duration: 0.75, repeat: 1, yoyo: true, ease: 'sine.inOut' })
      // Beat 4 — logo scales down/fades, screen begins to lighten
      .to(logo.current, { autoAlpha: 0, scale: 0.92, duration: 0.8, ease: 'power2.in' })
      .to(progress.current, { autoAlpha: 0, duration: 0.4 }, '<')
      // Beat 5 — blurred wallpaper reveals
      .to(wallpaper.current, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, '-=0.3')
      // Beat 6 — glass panel materializes (soft scale+fade, no bounce/overshoot per UX doc)
      .fromTo(
        glassPanel.current,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.1',
      );

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReturningThisSession]);
}
