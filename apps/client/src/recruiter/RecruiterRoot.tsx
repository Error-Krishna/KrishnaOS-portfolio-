import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ABOUT_CONTENT, ACHIEVEMENTS_CONTENT, EDUCATION_CONTENT, EXPERIENCE_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT } from '@/lib/content';
import { useModeStore } from '@/store/useModeStore';
import { useWindowStore } from '@/store/useWindowStore';

const FEATURED_PROJECTS = PROJECTS_CONTENT.filter((project) => project.featured);

const QUICK_TILES = [
  {
    label: 'Resume',
    detail: 'Condensed profile, one-screen and recruiter-friendly.',
  },
  {
    label: 'GitHub',
    detail: 'Project source and implementation details live here.',
  },
  {
    label: 'LinkedIn',
    detail: 'Professional history and network touchpoints.',
  },
] as const;

/**
 * Direct-linkable Recruiter Mode entry (route: /recruiter). Per UX doc §6,
 * this is the single-screen glass "document" view: the same design tokens
 * as the rest of KrishnaOS, but condensed into a resume-style layout with
 * the most important information visible up front.
 *
 * The route also syncs the global mode store to `recruiter` on mount so a
 * direct visit keeps the in-app state honest, even though this route bypasses
 * Boot + Welcome entirely.
 */
export function RecruiterRoot() {
  const setMode = useModeStore((s) => s.setMode);
  const openWindow = useWindowStore((s) => s.openWindow);
  const navigate = useNavigate();

  useEffect(() => {
    setMode('recruiter');
  }, [setMode]);

  const openContactInDesktop = () => {
    openWindow('contact');
    setMode('free');
    navigate('/');
  };

  const exploreFreely = () => {
    setMode('free');
    navigate('/');
  };

  return (
    <motion.main
      className="relative h-full w-full overflow-auto bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,var(--color-os-surface),var(--color-os-bg))] px-os-4 py-os-4 sm:px-os-6 sm:py-os-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-os-4">
        <section className="glass-panel flex shrink-0 flex-col gap-os-4 p-os-6">
          <div className="flex flex-col gap-os-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-os-2">
              <p className="text-os-caption font-semibold uppercase tracking-[0.2em] text-[color:var(--color-os-text-tertiary)]">
                Recruiter Mode
              </p>
              <h1 className="text-os-display font-semibold tracking-tight">{ABOUT_CONTENT.name}</h1>
              <p className="text-os-title text-[color:var(--color-os-text-secondary)]">
                {ABOUT_CONTENT.headline}
              </p>
              <p className="max-w-2xl text-os-body text-[color:var(--color-os-text-secondary)]">
                {ABOUT_CONTENT.bio[0]}
              </p>
            </div>

            <div className="grid gap-os-2 sm:grid-cols-2 lg:max-w-md">
              {QUICK_TILES.map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-3"
                >
                  <p className="text-os-caption font-semibold uppercase tracking-wide text-[color:var(--color-os-text-tertiary)]">
                    {tile.label}
                  </p>
                  <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">{tile.detail}</p>
                </div>
              ))}

              <button
                type="button"
                onClick={openContactInDesktop}
                className="rounded-os-md border border-[color:var(--color-os-accent)] bg-[color:var(--color-os-glass)] p-os-3 text-left transition-colors hover:bg-[color:var(--color-os-glass-highlight)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
              >
                <p className="text-os-caption font-semibold uppercase tracking-wide text-[color:var(--color-os-accent)]">
                  Contact
                </p>
                <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
                  Open the contact window in Free Exploration.
                </p>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-os-2">
            <button
              type="button"
              onClick={exploreFreely}
              className="rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
            >
              Open the full desktop
            </button>
            <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              Curious? Explore the full experience without losing this view.
            </span>
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-os-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-h-0 flex-col gap-os-4">
            <section className="glass-panel shrink-0 p-os-4">
              <SectionHeading eyebrow="Skills" title="Scannable front-end depth" />
              <div className="mt-os-3 flex flex-col gap-os-3">
                {SKILLS_CONTENT.map((group) => (
                  <div key={group.id} className="flex flex-col gap-os-2">
                    <p className="text-os-caption font-semibold uppercase tracking-wide text-[color:var(--color-os-text-tertiary)]">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-os-2">
                      {group.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-os-full border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] px-os-3 py-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel shrink-0 p-os-4">
              <SectionHeading eyebrow="Experience" title="Condensed timeline" />
              <div className="mt-os-3 flex flex-col gap-os-3">
                {EXPERIENCE_CONTENT.map((experience) => (
                  <div key={experience.id} className="border-l-2 border-[color:var(--color-os-glass-border)] pl-os-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-os-2">
                      <p className="text-os-body font-semibold">{experience.title}</p>
                      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                        {experience.startDate} – {experience.endDate === 'present' ? 'Present' : experience.endDate}
                      </p>
                    </div>
                    <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{experience.company}</p>
                    <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                      {experience.highlights[0]}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-os-4 md:grid-cols-2">
              <section className="glass-panel p-os-4">
                <SectionHeading eyebrow="Education" title="Formal foundation" />
                <div className="mt-os-3 flex flex-col gap-os-1">
                  <p className="text-os-body font-semibold">{EDUCATION_CONTENT[0].institution}</p>
                  <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                    {EDUCATION_CONTENT[0].degree}
                  </p>
                  <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                    {EDUCATION_CONTENT[0].startDate} – {EDUCATION_CONTENT[0].endDate}
                  </p>
                </div>
              </section>

              <section className="glass-panel p-os-4">
                <SectionHeading eyebrow="Achievements" title="Selected signal" />
                <div className="mt-os-3 flex flex-col gap-os-1">
                  <p className="text-os-body font-semibold">{ACHIEVEMENTS_CONTENT[0].title}</p>
                  <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                    {ACHIEVEMENTS_CONTENT[0].description}
                  </p>
                  {ACHIEVEMENTS_CONTENT[0].date && (
                    <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
                      {ACHIEVEMENTS_CONTENT[0].date}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-os-4">
            <section className="glass-panel flex min-h-0 flex-1 flex-col p-os-4">
              <SectionHeading eyebrow="Projects" title="Featured case studies" />
              <div className="mt-os-3 flex flex-1 min-h-0 flex-col gap-os-3 overflow-hidden">
                {FEATURED_PROJECTS.map((project) => {
                  const hasLinks = project.links.live || project.links.github || project.links.caseStudy;

                  return (
                    <article
                      key={project.id}
                      className="flex flex-col gap-os-2 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface)] p-os-4"
                    >
                      <div className="flex items-start justify-between gap-os-2">
                        <div>
                          <h3 className="text-os-body font-semibold">{project.title}</h3>
                          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{project.summary}</p>
                        </div>
                        <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                          Featured
                        </span>
                      </div>

                      <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">{project.description}</p>

                      <div className="flex flex-wrap gap-os-1">
                        {project.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-os-full bg-[color:var(--color-os-glass)] px-os-2 py-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-os-3 pt-os-1">
                        <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{project.role}</p>
                        {hasLinks && (
                          <div className="flex flex-wrap gap-os-3">
                            {project.links.live && (
                              <a
                                href={project.links.live}
                                target="_blank"
                                rel="noreferrer"
                                className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                              >
                                Live
                              </a>
                            )}
                            {project.links.github && (
                              <a
                                href={project.links.github}
                                target="_blank"
                                rel="noreferrer"
                                className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                              >
                                GitHub
                              </a>
                            )}
                            {project.links.caseStudy && (
                              <a
                                href={project.links.caseStudy}
                                target="_blank"
                                rel="noreferrer"
                                className="text-os-caption text-[color:var(--color-os-accent)] hover:underline"
                              >
                                Case study
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel shrink-0 p-os-4">
              <SectionHeading eyebrow="Contact" title="Fast path for interested recruiters" />
              <div className="mt-os-3 flex flex-col gap-os-2">
                <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
                  Resume, GitHub, LinkedIn, and direct contact are all surfaced up front here. If you want the full
                  desktop metaphor, use the escape hatch below.
                </p>
                <div className="flex flex-wrap gap-os-2">
                  <button
                    type="button"
                    onClick={openContactInDesktop}
                    className="rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
                  >
                    Open contact window
                  </button>
                  <button
                    type="button"
                    onClick={exploreFreely}
                    className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption text-[color:var(--color-os-text-secondary)] transition-colors hover:text-[color:var(--color-os-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-os-accent)]"
                  >
                    Explore freely
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="glass-bar shrink-0 px-os-4 py-os-3">
          <div className="flex flex-wrap items-center justify-between gap-os-3">
            <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
              Curious? Explore the full experience after this fast pass.
            </p>
            <button
              type="button"
              onClick={exploreFreely}
              className="text-os-caption font-medium text-[color:var(--color-os-accent)] hover:underline"
            >
              Open the full desktop →
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
}

function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="space-y-os-1">
      <p className="text-os-caption font-semibold uppercase tracking-[0.18em] text-[color:var(--color-os-text-tertiary)]">
        {eyebrow}
      </p>
      <h2 className="text-os-headline font-semibold">{title}</h2>
    </div>
  );
}
