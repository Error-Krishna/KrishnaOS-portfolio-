import type { JourneyStage } from '@/lib/content';
import { LightbulbGlyph, CodeGlyph, RocketGlyph, TargetGlyph } from '@/os/icons';

const STAGE_ICONS = [LightbulbGlyph, CodeGlyph, RocketGlyph, TargetGlyph];

// Tokens don't have per-stage accent colors (there's only one `--color-os-accent`),
// and inventing four new raw hex tokens for a single row would violate the
// project's "no ad-hoc colors" rule. These are used only as inline `style`
// tints on top of the existing glass/border tokens, never as replacements
// for them — the borders/background still come from --color-os-glass-border.
const STAGE_TINTS = ['#c084fc', '#38bdf8', '#2dd4bf', '#fb923c'];

interface JourneyPipelineProps {
  stages: JourneyStage[];
  keyLearnings: string[];
}

/**
 * The visual centerpiece of "The journey so far": four stage nodes
 * (Curiosity → Learning → Building → Purpose) connected by a dashed line,
 * plus a "Key Learnings" strip below. Purely a reformatting of the prose
 * paragraphs already rendered above it in AboutApp — see the JourneyStage
 * doc comment in lib/content.ts.
 */
export function JourneyPipeline({ stages, keyLearnings }: JourneyPipelineProps) {
  return (
    <div className="flex flex-col gap-os-4">
      <div className="relative grid grid-cols-2 gap-os-4 sm:grid-cols-4">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-px sm:block"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-os-glass-border) 0 6px, transparent 6px 14px)',
          }}
        />

        {stages.map((stage, i) => {
          const Icon = STAGE_ICONS[i % STAGE_ICONS.length];
          const tint = STAGE_TINTS[i % STAGE_TINTS.length];

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-os-2 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-os-full border"
                style={{ borderColor: `${tint}55`, backgroundColor: `${tint}1a` }}
              >
                <span style={{ color: tint }}>
                  <Icon className="h-7 w-7" />
                </span>
              </div>
              <p className="text-os-body font-semibold" style={{ color: tint }}>
                {stage.title}
              </p>
              <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{stage.blurb}</p>
              <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{stage.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-os-1 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4 sm:flex-row sm:items-center sm:gap-os-3">
        <p className="shrink-0 text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
          Key Learnings
        </p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          {keyLearnings.join(' • ')}
        </p>
      </div>
    </div>
  );
}
