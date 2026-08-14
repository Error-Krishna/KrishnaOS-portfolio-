import { motion } from 'framer-motion';
import { APP_ORDER, APP_REGISTRY } from '@/os/appRegistry';
import { useWindowStore } from '@/store/useWindowStore';

/**
 * The Dock, per coding prompt Phase 3 item 7: "icon row, magnification-on-
 * hover micro-interaction, click → opens window."
 *
 * Reads app roster from the shared APP_REGISTRY (os/appRegistry.ts) rather
 * than hardcoding a list here — Spotlight and the guided tour read from the
 * same registry, so adding a new app anywhere means updating exactly one
 * file, not three.
 */
export function Dock() {
  const openWindows = useWindowStore((s) => s.openWindows);
  const openWindow = useWindowStore((s) => s.openWindow);
  const focusedWindowId = useWindowStore((s) => s.focusedWindowId);

  return (
    <div className="pointer-events-none absolute bottom-os-4 left-1/2 z-40 -translate-x-1/2">
      <div className="glass-panel pointer-events-auto flex items-end gap-os-2 px-os-3 py-os-2">
        {APP_ORDER.map((appId) => {
          const app = APP_REGISTRY[appId];
          const isOpen = openWindows.some((w) => w.id === appId);
          const isFocused = focusedWindowId === appId;

          return (
            <motion.button
              key={appId}
              type="button"
              onClick={() => openWindow(appId)}
              aria-label={`Open ${app.title}`}
              className="group relative flex flex-col items-center"
              whileHover={{ y: -8, scale: 1.15 }}
              whileTap={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {/* Tooltip — appears on hover, matches macOS Dock label behavior */}
              <span className="pointer-events-none absolute -top-9 rounded-os-sm bg-[color:var(--color-os-surface-elevated)] px-os-2 py-os-1 text-os-caption opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {app.title}
              </span>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-os-md text-os-headline font-semibold transition-colors ${
                  isFocused
                    ? 'bg-[color:var(--color-os-accent)] text-white'
                    : 'bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]'
                }`}
              >
                {app.shortLabel.slice(0, 1)}
              </div>

              {/* Open indicator dot, matches macOS's "app is running" dock dot */}
              <span
                className={`mt-os-1 h-1 w-1 rounded-full transition-opacity ${
                  isOpen ? 'bg-[color:var(--color-os-text-secondary)] opacity-100' : 'opacity-0'
                }`}
                aria-hidden
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
