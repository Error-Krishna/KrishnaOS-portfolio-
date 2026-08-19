import { ABOUT_CONTENT } from '@/lib/content';
import { HeroSection } from './HeroSection';
import {
  FullScreenGlyph,
  LinkGlyph,
  WifiOffGlyph,
  ServerGlyph,
  LightbulbGlyph,
  TargetGlyph,
  QuestionGlyph,
  TimelineGlyph,
} from '@/os/icons';

/**
 * About window content, per coding prompt Phase 4 item 10 and UX flow
 * doc §4 (tour step 1: "About — who I am"). Renders directly into the
 * window content region WindowManager already provides (scroll, padding);
 * this component just owns its own layout, not scroll behavior.
 */
export function AboutApp() {
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

  return (
    <div className="flex h-full flex-col gap-os-4">
      <HeroSection />

      {/* BIO SECTION
      <div className="flex flex-col gap-os-3">
        {ABOUT_CONTENT.bio.map((paragraph, i) => (
          <p
            key={i}
            className="text-os-body text-[color:var(--color-os-text-secondary)]"
          >
            {paragraph}
          </p>
        ))}
      </div> */}

      <div className="flex flex-col gap-os-4">
        {ABOUT_CONTENT.sections.map((section) => {
          // QUOTES SECTION
          // else if(section.kind === 'quote') {
          //   return (
          //     <blockquote
          //       key={section.id}
          //       className="border-l-2 border-[color:var(--color-os-accent)] pl-os-4 text-os-title italic text-[color:var(--color-os-text-primary)]"
          //     >
          //       {section.quote}
          //     </blockquote>
          //   );
          // }

          // QUESTIONS I KEEP ASKING MYSLEF SECTION
          if (section.kind === 'traits') {
            if (section.id === 'curiosity') {
              return (
                <div key={section.id} className="flex flex-col gap-os-3">
                  {section.heading && (
                    <div className="flex items-center gap-os-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass-bg)]">
                        <QuestionGlyph className="h-10 w-10 text-[#c084fc]" />
                      </div>

                      <h3 className="text-os-title font-semibold">
                        {section.heading}
                      </h3>
                    </div>
                  )}

                <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">                    
                  {section.items?.map((item, i) => {
                      const Icon = CURIOSITY_ICONS[i];

                      return (
                        <div
                          key={i}
                          className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass-bg)] p-os-4"
                        >
                          <Icon className="h-8 w-8 text-[color:var(--color-os-accent)]" />

                          <span className="text-os-title font-semibold text-[color:var(--color-os-text-primary)]">
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
                {section.heading && (
                  <h3 className="text-os-title font-semibold">
                    {section.heading}
                  </h3>
                )}

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

          // STORY SECTION
          else if (section.kind === 'story') {
            return (
              <div key={section.id} className="flex flex-col gap-os-2">
                {section.heading && (
                  <div className="flex items-center gap-os-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass-bg)]">
                      <TimelineGlyph className="h-10 w-10 text-[#c084fc]" />
                    </div>

                    <h3 className="text-os-title font-semibold">
                      {section.heading}
                    </h3>
                  </div>
                )}

                {section.body?.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-os-body text-[color:var(--color-os-text-secondary)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}