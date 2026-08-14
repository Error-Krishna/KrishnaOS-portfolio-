import { ThemeGlyph } from '@/os/icons';
import { useThemeStore, type ThemeMode } from '@/store/useThemeStore';

const THEME_CHOICES: Array<{ value: ThemeMode; label: string }> = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeToggle() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  return (
    <div className="inline-flex items-center gap-os-1 rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-1">
      <ThemeGlyph className="h-4 w-4 text-[color:var(--color-os-text-tertiary)]" />
      {THEME_CHOICES.map((choice) => {
        const isActive = themeMode === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => setThemeMode(choice.value)}
            className={`rounded-os-full px-os-2 py-os-1 text-os-caption transition-colors ${
              isActive
                ? 'bg-[color:var(--color-os-accent)] text-white'
                : 'text-[color:var(--color-os-text-secondary)] hover:text-[color:var(--color-os-text-primary)]'
            }`}
          >
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}
