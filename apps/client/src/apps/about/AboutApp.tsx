import { ABOUT_CONTENT } from '@/lib/content';

/**
 * About window content, per coding prompt Phase 4 item 10 and UX flow
 * doc §4 (tour step 1: "About — who I am"). Renders directly into the
 * window content region WindowManager already provides (scroll, padding);
 * this component just owns its own layout, not scroll behavior.
 */
export function AboutApp() {
  return (
    <div className="flex h-full flex-col gap-os-4">
      <div className="flex flex-col gap-os-1">
        <h2 className="text-os-headline font-semibold">{ABOUT_CONTENT.name}</h2>
        <p className="text-os-body text-[color:var(--color-os-text-secondary)]">{ABOUT_CONTENT.headline}</p>
      </div>
      <div className="flex flex-col gap-os-3">
        {ABOUT_CONTENT.bio.map((paragraph, i) => (
          <p key={i} className="text-os-body text-[color:var(--color-os-text-secondary)]">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-os-4">
        {ABOUT_CONTENT.sections.map((section) => {
          if (section.kind === 'story') {
            return (
              <div key={section.id} className="flex flex-col gap-os-2">
                {section.heading && (
                  <h3 className="text-os-title font-semibold">{section.heading}</h3>
                )}
                {section.body?.map((paragraph, i) => (
                  <p key={i} className="text-os-body text-[color:var(--color-os-text-secondary)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            );
          } else if(section.kind === 'quote') {
            return (
              <blockquote
                key={section.id}
                className="border-l-2 border-[color:var(--color-os-accent)] pl-os-4 text-os-title italic text-[color:var(--color-os-text-primary)]"
              >
                {section.quote}
              </blockquote>
            );
          } else if (section.kind === 'traits') {
            return (
              <div key={section.id} className="flex flex-col gap-os-2"> 
                {section.heading && (
                  <h3 className="text-os-title font-semibold">{section.heading}</h3>
                )}
                <div className="flex flex-wrap gap-os-2">
                  {section.items?.map((item, i) => (
                    <span key={i} className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
