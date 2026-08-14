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
    </div>
  );
}
