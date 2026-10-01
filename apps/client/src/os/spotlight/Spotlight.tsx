import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createSearchIndex, type SearchableEntry } from "@/lib/searchIndex";
import { AppGlyph, SearchGlyph } from "@/os/icons";
import { useWindowStore } from "@/store/useWindowStore";

const LISTBOX_ID = "spotlight-results";

/**
 * Spotlight search overlay, per coding prompt Phase 3 item 9: "Fuse.js
 * fuzzy search across all content, keyboard-triggered."
 *
 * This is also the implementation of UX flow doc §7 rule 4: "Search is a
 * universal escape valve" — Spotlight is meant to work regardless of
 * whether a visitor understands the desktop-OS metaphor at all, so it's
 * mounted at the OS shell level (always available in Free Exploration and
 * the Tour), not nested inside any one screen.
 *
 * Accessibility: exposed as a modal dialog containing an ARIA combobox +
 * listbox (the input keeps DOM focus while arrow keys move the "active"
 * option, announced via aria-activedescendant). Tab is trapped on the input
 * while open, and focus returns to whatever had it before Spotlight opened.
 */
export function Spotlight() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const openWindow = useWindowStore((s) => s.openWindow);

  const fuse = useMemo(() => createSearchIndex(), []);

  const results: SearchableEntry[] = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => r.item);
  }, [fuse, query]);

  // ⌘K / Ctrl+K to open, Escape to close — global, since Spotlight must be
  // reachable from anywhere in the OS, not just when some other UI has focus.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isSpotlightShortcut =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isSpotlightShortcut) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setQuery("");
      setSelectedIndex(0);
      // Focus on next tick so the entrance animation doesn't fight the
      // input's autofocus/scroll-into-view behavior.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (previouslyFocused.current) {
      // Hand focus back to wherever the visitor was before opening Spotlight.
      const target = previouslyFocused.current;
      previouslyFocused.current = null;
      if (document.contains(target)) target.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectResult = (entry: SearchableEntry) => {
    openWindow(entry.targetAppId);
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      selectResult(results[selectedIndex]);
    } else if (e.key === "Tab") {
      // Focus trap: the input is the only tab stop inside the dialog, so Tab
      // must not escape into the (visually dimmed) desktop behind it.
      e.preventDefault();
    }
  };

  const hasResults = results.length > 0;
  const activeOptionId = hasResults ? `spotlight-option-${selectedIndex}` : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-[color:var(--color-os-bg)]/40 pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Spotlight search"
            className="glass-panel w-[min(560px,90vw)] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.34, 1.1, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-os-2 px-os-4 py-os-4">
              <SearchGlyph className="h-5 w-5 text-[color:var(--color-os-text-tertiary)]" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Search KrishnaOS"
                aria-expanded={hasResults}
                aria-controls={LISTBOX_ID}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search KrishnaOS..."
                className="w-full bg-transparent text-os-headline text-[color:var(--color-os-text-primary)] outline-none placeholder:text-[color:var(--color-os-text-tertiary)]"
              />
            </div>

            {/* Screen-reader announcement of how many matches there are */}
            <p className="sr-only" role="status" aria-live="polite">
              {query.trim()
                ? hasResults
                  ? `${results.length} result${results.length === 1 ? "" : "s"}`
                  : "No results"
                : ""}
            </p>

            {hasResults && (
              <div
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Search results"
                className="border-t border-[color:var(--color-os-glass-border)] py-os-2"
              >
                {results.map((entry, i) => (
                  <button
                    key={entry.id}
                    id={`spotlight-option-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === selectedIndex}
                    tabIndex={-1}
                    onClick={() => selectResult(entry)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex w-full items-center gap-os-2 px-os-4 py-os-2 text-left text-os-body transition-colors ${
                      i === selectedIndex
                        ? "bg-[color:var(--color-os-glass-highlight)] text-[color:var(--color-os-text-primary)]"
                        : "text-[color:var(--color-os-text-secondary)]"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-os-md bg-[color:var(--color-os-surface-elevated)] text-[color:var(--color-os-text-primary)]">
                      <AppGlyph appId={entry.targetAppId} className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col">
                      <span>{entry.title}</span>
                      {entry.subtitle && (
                        <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                          {entry.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {query.trim() && !hasResults && (
              <div className="border-t border-[color:var(--color-os-glass-border)] px-os-4 py-os-4 text-os-body text-[color:var(--color-os-text-tertiary)]">
                No results for "{query}"
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
