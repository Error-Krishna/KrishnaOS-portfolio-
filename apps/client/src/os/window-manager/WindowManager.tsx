import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useWindowStore, type OsWindow } from '@/store/useWindowStore';
import { AppGlyph } from '@/os/icons';
import { useIsMobile } from '@/lib/useMediaQuery';

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

interface WindowFrameProps {
  win: OsWindow;
  children: ReactNode;
}

/**
 * A single draggable/resizable window, per coding prompt Phase 3 item 8:
 * "draggable, resizable, closable, focus/z-index handling, minimize (even
 * if minimize just closes for v1 — don't over-scope)."
 *
 * react-rnd owns the drag/resize *math* only (pointer deltas, boundary
 * clamping) — see docs/02-tech-stack.md for why. Window *state* (position,
 * size, z-index, open/closed/minimized) is entirely owned by
 * useWindowStore, which this component reads from and writes back to.
 */
function WindowFrame({ win, children }: WindowFrameProps) {
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleFullscreen = useWindowStore((s) => s.toggleFullscreen);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
  const isMobile = useIsMobile();

  if (win.isMinimized) return null;

  if (isMobile) {
    return (
      <motion.section
        className="glass-panel flex min-h-0 w-full flex-col overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18 }}
        onPointerDown={() => focusWindow(win.id)}
      >
        <div className="flex shrink-0 items-center gap-os-2 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3">
          <div className="flex items-center gap-os-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-os-md bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]">
              <AppGlyph appId={win.id} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-os-body font-semibold">{win.title}</p>
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Touch-friendly sheet</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-os-2">
            <button
              type="button"
              aria-label={`Minimize ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(win.id);
              }}
              className="h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80"
            />
            <button
              type="button"
              aria-label={`Close ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(win.id);
              }}
              className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
            />
          </div>
        </div>

        <div className="max-h-[70vh] flex-1 overflow-auto p-os-4">{children}</div>
      </motion.section>
    );
  }

  return (
    <Rnd
      size={win.isFullscreen ? { width: '100%', height: '100%' } : { width: win.size.width, height: win.size.height }}
      position={win.isFullscreen ? { x: 0, y: 0 } : { x: win.position.x, y: win.position.y }}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      disableDragging={win.isFullscreen}
      enableResizing={!win.isFullscreen}
      style={{ zIndex: win.zIndex }}
      onDragStart={() => focusWindow(win.id)}
      onDragStop={(_e, d) => moveWindow(win.id, { x: d.x, y: d.y })}
      onResizeStart={() => focusWindow(win.id)}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        resizeWindow(win.id, { width: ref.offsetWidth, height: ref.offsetHeight });
        moveWindow(win.id, position);
      }}
    >
      <motion.div
        className="glass-panel flex h-full w-full flex-col overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.18 }}
        onPointerDown={() => focusWindow(win.id)}
      >
        {/* Title bar — the drag handle for the whole window */}
        <div className="window-drag-handle flex shrink-0 cursor-grab items-center gap-os-2 border-b border-[color:var(--color-os-glass-border)] px-os-3 py-os-2 active:cursor-grabbing">
          <div className="flex items-center gap-os-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-os-sm bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]">
              <AppGlyph appId={win.id} className="h-3.5 w-3.5" />
            </span>
            <button
              type="button"
              aria-label={`Close ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(win.id);
              }}
              className="h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80"
            />
            <button
              type="button"
              aria-label={`Minimize ${win.title}`}
              disabled={win.isFullscreen}
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(win.id);
              }}
              className={`h-3 w-3 rounded-full transition-opacity ${
                win.isFullscreen
                  ? 'bg-[color:var(--color-os-glass-border)] cursor-not-allowed'
                  : 'bg-[#febc2e] hover:opacity-80'
              }`}
            />
            <button
              type="button"
              aria-label={`${win.isFullscreen ? 'Exit' : 'Enter'} fullscreen for ${win.title}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen(win.id);
              }}
              className="h-3 w-3 rounded-full bg-[#34C759] transition-opacity hover:opacity-80"
            />
          </div>
          <span className="flex-1 select-none truncate text-center text-os-caption font-medium text-[color:var(--color-os-text-secondary)]">
            {win.title}
          </span>
          {/* Spacer to balance the traffic-light buttons and keep the title visually centered */}
          <div className="w-[38px]" aria-hidden />
        </div>

        {/* Content region — the hosted app renders here, and OWNS its own scroll,
            per index.css's "the OS shell owns scroll regions" rule (docs/04). */}
        <div className="flex-1 overflow-auto p-os-4">{children}</div>
      </motion.div>
    </Rnd>
  );
}

/**
 * Renders every open, non-minimized window from useWindowStore.
 * `renderAppContent` is injected rather than imported directly so the
 * window manager doesn't need to know about every app in apps/* — Phase 4
 * wires real content in via this prop from wherever WindowManager is mounted.
 */
interface WindowManagerProps {
  renderAppContent: (appId: OsWindow['id']) => ReactNode;
}

export function WindowManager({ renderAppContent }: WindowManagerProps) {
  const openWindows = useWindowStore((s) => s.openWindows);
  const isMobile = useIsMobile();

  return (
    <div
      className={`${
        isMobile
          ? 'relative flex flex-1 min-h-0 flex-col gap-os-4 overflow-auto px-os-4 pb-os-28 pt-os-4'
          : 'absolute inset-0 overflow-hidden'
      }`}
    >
      <AnimatePresence>
        {openWindows.map((win) => (
          <WindowFrame key={win.id} win={win}>
            {renderAppContent(win.id)}
          </WindowFrame>
        ))}
      </AnimatePresence>
    </div>
  );
}
