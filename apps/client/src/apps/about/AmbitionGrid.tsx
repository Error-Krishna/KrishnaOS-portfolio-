import { CompassGlyph, LayersGlyph, PuzzleGlyph, HeartGlyph } from '@/os/icons';
import type { AmbitionFocusItem, AmbitionPillar } from '@/lib/content';

const PILLAR_ICONS = [CompassGlyph, LayersGlyph, PuzzleGlyph, HeartGlyph];
const PILLAR_TINTS = ['#818cf8', '#38bdf8', '#a78bfa', '#fb7185'];
const FOCUS_ICONS = [PuzzleGlyph, HeartGlyph, LayersGlyph];

interface AmbitionGridProps {
  focus: AmbitionFocusItem[];
  pillars: AmbitionPillar[];
}

/**
 * "What I'm building toward": a short focus list on the left, four
 * identity-pillar cards on the right. Same principle as JourneyPipeline —
 * a visual restatement of the ambition paragraphs already rendered above
 * it, not new content (see AmbitionFocusItem/AmbitionPillar in
 * lib/content.ts).
 */
export function AmbitionGrid({ focus, pillars }: AmbitionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-[minmax(0,1fr)_2fr]">
      <ul className="flex flex-col gap-os-3">
        {focus.map((item, i) => {
          const Icon = FOCUS_ICONS[i % FOCUS_ICONS.length];
          return (
            <li key={item.id} className="flex items-start gap-os-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-os-md bg-[color:var(--color-os-glass)] text-[color:var(--color-os-accent)]">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                  {item.title}
                </p>
                <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-2 gap-os-3 sm:grid-cols-4">
        {pillars.map((pillar, i) => {
          const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
          const tint = PILLAR_TINTS[i % PILLAR_TINTS.length];

          return (
            <div
              key={pillar.id}
              className="flex flex-col items-center gap-os-2 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 text-center"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-os-full"
                style={{ backgroundColor: `${tint}22`, color: tint }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                {pillar.title}
              </p>
              <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
