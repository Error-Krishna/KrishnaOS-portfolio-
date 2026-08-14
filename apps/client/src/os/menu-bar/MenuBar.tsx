import { useNavigate } from 'react-router-dom';
import { HomeGlyph } from '@/os/icons';
import { ThemeToggle } from '@/os/theme/ThemeToggle';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useModeStore } from '@/store/useModeStore';

/**
 * The Menu Bar, per coding prompt Phase 3 item 6: "system-feel, includes
 * persistent 'Recruiter Mode' switch + KrishnaOS logo-as-home."
 *
 * This is the component that makes two of the UX flow doc's §7 cross-mode
 * navigation rules actually hold at runtime, from anywhere in Free
 * Exploration or the Tour:
 *   - Rule 3: "Recruiter Mode is always one action away... via a persistent
 *     system-level control (menu bar and/or Spotlight)"
 *   - Rule 5: "Returning to Welcome is always possible... e.g. a subtle
 *     'KrishnaOS' wordmark in the menu bar acts as a home/logo-click
 *     affordance"
 *
 * Persistent — mounted once at the OS shell level, not per-mode, so it's
 * visible across Tour, Free, and (per the UX doc) not needed in Recruiter
 * Mode itself (that's a separate single-screen route, see
 * docs/06-navigation-flow.md's Recruiter Mode routing note).
 */
export function MenuBar() {
  const setMode = useModeStore((s) => s.setMode);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const goHome = () => setMode('welcome');

  const switchToRecruiterMode = () => {
    setMode('recruiter');
    navigate('/recruiter');
  };

  return (
    <div
      className={`glass-bar absolute top-0 left-0 right-0 z-50 flex gap-os-3 px-os-3 py-os-2 ${
        isMobile ? 'flex-col' : 'h-9 items-center justify-between px-os-4 py-0'
      }`}
    >
      <div className={`flex items-center justify-between gap-os-2 ${isMobile ? 'w-full' : ''}`}>
        <button
          type="button"
          onClick={goHome}
          aria-label="Back to Welcome"
          className="flex items-center gap-os-2 text-os-caption font-semibold tracking-tight text-[color:var(--color-os-text-primary)] transition-opacity hover:opacity-80"
        >
          <HomeGlyph className="h-4 w-4" />
          <span>KrishnaOS</span>
        </button>

        {isMobile && <ThemeToggle />}
      </div>

      <div className={`flex items-center gap-os-2 ${isMobile ? 'w-full justify-between' : ''}`}>
        {!isMobile && <ThemeToggle />}
        <button
          type="button"
          onClick={switchToRecruiterMode}
          className="rounded-os-sm border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:border-[color:var(--color-os-accent)] hover:text-[color:var(--color-os-text-primary)]"
        >
          Switch to Recruiter Mode
        </button>
      </div>
    </div>
  );
}
