import { useEffect, useRef, useState, type FormEvent } from "react";
import { TERMINAL_COMMANDS } from "@/lib/content";

interface TerminalLine {
  type: "input" | "output" | "system";
  text: string;
}

const WELCOME_LINES: TerminalLine[] = [
  {
    type: "system",
    text: 'krishnaos-terminal v1.0 — type "help" to see available commands',
  },
];

/**
 * A real, bounded command-driven terminal — not decorative typing-animation
 * text. Every command reads live from TERMINAL_COMMANDS (lib/content.ts),
 * which itself reads live from ABOUT_CONTENT / SKILLS_CONTENT /
 * FEATURED_PROJECTS, so there's exactly one place any of this content
 * lives. Input is matched against a small fixed command table — there is
 * no arbitrary code execution and therefore no meaningful security surface.
 *
 * History/input state is local `useState`, not a new Zustand store — per
 * docs/08-content-apps.md, nothing outside this widget needs to read or
 * coordinate with it.
 */
export function AboutTerminal() {
  const [history, setHistory] = useState<TerminalLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const runCommand = (raw: string) => {
    const name = raw.trim().toLowerCase();
    if (!name) {
      return;
    }

    if (name === "clear") {
      setHistory([]);
      return;
    }

    const command = TERMINAL_COMMANDS[name];
    setHistory((prev) => [
      ...prev,
      { type: "input", text: name },
      ...(command
        ? command
            .run()
            .map((line): TerminalLine => ({ type: "output", text: line }))
        : [
            {
              type: "output" as const,
              text: `command not found: ${name} — type "help"`,
            },
          ]),
    ]);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div
      className="flex h-full min-h-[260px] flex-col overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[#0a0a0c] font-mono text-[#f5f5f7]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-os-2 border-b border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-os-2 truncate text-[#a1a1aa]">
          building_better_v1.0
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-1 overflow-y-auto px-os-3 py-os-3"
        aria-live="polite"
      >
        {history.map((line, i) => (
          <p
            key={i}
            className={
              line.type === "input"
                ? "text-[#4ade80]"
                : line.type === "system"
                  ? "text-[#a1a1aa]"
                  : "whitespace-pre-wrap text-[color:var(--color-os-text-secondary)]"
            }
          >
            {line.type === "input" ? `> ${line.text}` : line.text}
          </p>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-os-2 border-t border-[color:var(--color-os-glass-border)] px-os-3 py-os-2"
      >
        <span className="text-[#4ade80]">{">"}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type a command… (try: help)"
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
          className="flex-1 bg-transparent text-[color:var(--color-os-text-primary)] outline-none placeholder:text-[#a1a1aa]"
        />
      </form>
    </div>
  );
}
