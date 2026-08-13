/**
 * Direct-linkable Recruiter Mode entry (route: /recruiter). Per UX doc §6,
 * this should render the single-screen glass "document" view without
 * requiring a pass through boot/welcome first. Placeholder for Phase 6.
 */
export function RecruiterRoot() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="glass-panel px-os-8 py-os-6 text-center">
        <p className="text-os-title font-semibold">Recruiter Mode</p>
        <p className="text-os-body text-[color:var(--color-os-text-secondary)] mt-os-2">
          Fast-access view — coming in Phase 6.
        </p>
      </div>
    </div>
  );
}
