import type { ReactElement } from 'react';
import {
  ABOUT_CONTENT,
  ABOUT_JOURNEY_STAGES,
  ABOUT_KEY_LEARNINGS,
  ABOUT_AMBITION_FOCUS,
  ABOUT_AMBITION_PILLARS,
  PROFILE_LINKS,
} from '@/lib/content';
import { HeroSection } from './HeroSection';
import { JourneyPipeline } from './JourneyPipeline';
import { AmbitionGrid } from './AmbitionGrid';
import { AboutTerminal } from './AboutTerminal';
import {
  FullScreenGlyph,
  LinkGlyph,
  WifiOffGlyph,
  ServerGlyph,
  LightbulbGlyph,
  TargetGlyph,
  QuestionGlyph,
  TimelineGlyph,
  NoteGlyph,
  RocketGlyph,
} from '@/os/icons';

const CURIOSITY_ICONS = [
  FullScreenGlyph,
  LinkGlyph,
  WifiOffGlyph,
  ServerGlyph,
  LightbulbGlyph,
  TargetGlyph,
  QuestionGlyph,
  TimelineGlyph,
];

// One icon per story-section id, so "The journey so far", "What I'm still
// working on", and "What I'm building toward" read as visually distinct
// beats instead of three identical purple-circle headings.
const STORY_ICONS: Record<string, (props: { className?: string }) => ReactElement> = {
  journey: TimelineGlyph,
  'self-awareness': NoteGlyph,
  ambition: RocketGlyph,
};

// A self-awareness bullet gets one of these tints, cycling — purely a
// visual rhythm device, not tied to any meaning per-bullet.
const SELF_AWARENESS_TINTS = ['#c084fc', '#38bdf8', '#fb923c'];

/**
 * About window content, per coding prompt Phase 4 item 10 and UX flow
 * doc §4 (tour step 1: "About — who I am"). Renders directly into the
 * window content region WindowManager already provides (scroll, padding);
 * this component just owns its own layout, not scroll behavior.
 */
export function AboutApp() {
  return (
    <div className="flex h-full flex-col gap-os-6">
      <HeroSection />

      <div className="flex flex-col gap-os-6">
        {ABOUT_CONTENT.sections.map((section) => {
          // QUOTE SECTIONS — a plain pull-quote for most, and a richer
          // "closing card" (quote + real trait badges + GitHub avatar)
          // specifically for the krishnaos-meaning section, since that one
          // closes the whole page rather than just punctuating a beat.
          if (section.kind === 'quote') {
            if (section.id === 'krishnaos-meaning') {
              return (
                <div
                  key={section.id}
                  className="flex flex-col gap-os-4 rounded-os-xl border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-6"
                >
                  <div className="flex flex-col items-start gap-os-4 sm:flex-row sm:items-center sm:justify-between">
                    <blockquote className="max-w-2xl border-l-2 border-[color:var(--color-os-accent)] pl-os-4 text-os-title italic text-[color:var(--color-os-text-primary)]">
                      {section.quote}
                    </blockquote>
                    <img
                      src={`${PROFILE_LINKS.github}.png`}
                      alt={ABOUT_CONTENT.name}
                      className="h-16 w-16 shrink-0 rounded-os-full border border-[color:var(--color-os-glass-border)] object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap gap-os-2">
                    {ABOUT_CONTENT.badges.map((badge) => (
                      <span
                        key={badge.label}
                        className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <blockquote
                key={section.id}
                className="border-l-2 border-[color:var(--color-os-accent)] pl-os-4 text-os-title italic text-[color:var(--color-os-text-primary)]"
              >
                {section.quote}
              </blockquote>
            );
          }

          // "QUESTIONS I KEEP ASKING MYSELF" (traits, id: curiosity) —
          // 6-icon grid — and the generic pill-row traits fallback.
          if (section.kind === 'traits') {
            if (section.id === 'curiosity') {
              return (
                <div key={section.id} className="flex flex-col gap-os-3">
                  {section.heading && (
                    <div className="flex items-center gap-os-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
                        <QuestionGlyph className="h-5 w-5 text-[#c084fc]" />
                      </div>
                      <h3 className="text-os-title font-semibold">{section.heading}</h3>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {section.items?.map((item, i) => {
                      const Icon = CURIOSITY_ICONS[i % CURIOSITY_ICONS.length];
                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
                        >
                          <Icon className="h-8 w-8 text-[color:var(--color-os-accent)]" />
                          <span className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={section.id} className="flex flex-col gap-os-2">
                {section.heading && <h3 className="text-os-title font-semibold">{section.heading}</h3>}
                <div className="flex flex-wrap gap-os-2">
                  {section.items?.map((item, i) => (
                    <span
                      key={i}
                      className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          // STORY SECTIONS — shared heading treatment, then a section-
          // specific visual: journey gets the pipeline, self-awareness
          // gets the terminal + bullet list, ambition gets the focus/
          // pillar grid.
          if (section.kind === 'story') {
            const StoryIcon = STORY_ICONS[section.id] ?? TimelineGlyph;

            return (
              <div key={section.id} className="flex flex-col gap-os-4">
                {section.heading && (
                  <div className="flex items-center gap-os-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
                      <StoryIcon className="h-5 w-5 text-[#c084fc]" />
                    </div>
                    <h3 className="text-os-title font-semibold">{section.heading}</h3>
                  </div>
                )}

                {section.id === 'self-awareness' ? (
                  <div className="grid grid-cols-1 gap-os-4 lg:grid-cols-2">
                    <AboutTerminal />
                    <ul className="flex flex-col gap-os-3">
                      {section.body?.map((paragraph, i) => {
                        const tint = SELF_AWARENESS_TINTS[i % SELF_AWARENESS_TINTS.length];
                        return (
                          <li key={i} className="flex items-start gap-os-3">
                            <span
                              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: tint }}
                              aria-hidden
                            />
                            <p className="text-os-body text-[color:var(--color-os-text-secondary)]">
                              {paragraph}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  section.body?.map((paragraph, i) => (
                    <p key={i} className="text-os-body text-[color:var(--color-os-text-secondary)]">
                      {paragraph}
                    </p>
                  ))
                )}

                {section.id === 'journey' && (
                  <JourneyPipeline stages={ABOUT_JOURNEY_STAGES} keyLearnings={ABOUT_KEY_LEARNINGS} />
                )}

                {section.id === 'ambition' && (
                  <AmbitionGrid focus={ABOUT_AMBITION_FOCUS} pillars={ABOUT_AMBITION_PILLARS} />
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
