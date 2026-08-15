import type { Achievement, EducationEntry, Experience, Project } from '@krishnaos/shared-types';

/**
 * Hardcoded portfolio content, per apps/server/src/routes/content.ts's own
 * note: "content can stay hardcoded client-side" until/unless it moves into
 * MongoDB via a real content API. This is the single source of truth every
 * content app in apps/client/src/apps/* reads from.
 *
 * ⚠️ PLACEHOLDER CONTENT. Every string below is a stand-in, not final copy.
 * "Final copy/voice" is an explicitly open question in both
 * krishnaos-ux-flow.md §8 and krishnaos-coding-prompt.md §6, pending a
 * content pass. Swap these for real bio/project/experience text — the
 * shape (and every component reading it) won't need to change when you do.
 */

export const ABOUT_CONTENT = {
  name: 'Krishna Goyal',
  headline: 'Frontend Engineer',
  bio: [
    'Add your real bio here — a couple of paragraphs on who you are, what kind of engineer you are, and what you care about when building things.',
    'This is placeholder copy, not final. Replace it during the content pass noted in the UX flow doc\u2019s open questions (§8).',
  ],
};

/**
 * External profile links surfaced in Recruiter Mode's quick tiles and anywhere
 * else the UX doc requires resume/GitHub/LinkedIn to be one click away.
 *
 * ⚠️ PLACEHOLDER URLS. Swap `resume` and `linkedin` during the final content
 * pass. `github` defaults to a username-derived URL below — override it here
 * if the profile URL ever diverges from github.com/<username>.
 */
export const PROFILE_LINKS = {
  resume: '',
  github: 'https://github.com/Error-Krishna',
  linkedin: '',
} as const;

export const PROJECTS_CONTENT: Project[] = [
  {
    id: 'project-krishnaos',
    title: 'KrishnaOS',
    summary: 'This site — a personal portfolio disguised as a macOS-inspired desktop OS.',
    description:
      'Placeholder description. Talk about the window-manager architecture, the boot sequence, the three-mode navigation, and why you built it this way.',
    role: 'Sole designer & engineer',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'Zustand'],
    links: {},
    featured: true,
  },
  {
    id: 'project-2',
    title: 'Project Two',
    summary: 'One-line summary of what this project is and why it matters.',
    description: 'Placeholder description of the second project — replace with a real case study.',
    role: 'Your role',
    stack: ['React', 'TypeScript'],
    links: {},
    featured: true,
  },
  {
    id: 'project-3',
    title: 'Project Three',
    summary: 'One-line summary of a third project.',
    description: 'Placeholder description — replace with a real case study.',
    role: 'Your role',
    stack: ['TypeScript', 'Node.js'],
    links: {},
    featured: false,
  },
];

export const EXPERIENCE_CONTENT: Experience[] = [
  {
    id: 'exp-1',
    company: 'Company Name',
    title: 'Frontend Engineer',
    startDate: '2024',
    endDate: 'present',
    highlights: [
      'Placeholder highlight — a concrete, measurable thing you shipped or improved.',
      'Placeholder highlight — replace with real bullet points.',
    ],
  },
  {
    id: 'exp-2',
    company: 'Previous Company',
    title: 'Previous Role',
    startDate: '2022',
    endDate: '2024',
    highlights: ['Placeholder highlight from a previous role.'],
  },
];

export const EDUCATION_CONTENT: EducationEntry[] = [
  {
    id: 'edu-1',
    institution: 'University / Institution Name',
    degree: 'Degree, Field of Study',
    startDate: '20XX',
    endDate: '20XX',
  },
];

export const ACHIEVEMENTS_CONTENT: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Achievement Title',
    description: 'Placeholder description of an award, certification, or notable win.',
    date: '20XX',
  },
];

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

/**
 * Skills has no shared-types entry deliberately — per the coding prompt's
 * §5 data model (Project, Experience, EducationEntry, Achievement,
 * ContactPayload only) the server never needs to know about skills, so
 * per docs/01-architecture.md's "does the server ever need this shape?"
 * test, this type lives entirely client-side rather than in shared-types.
 */
export const SKILLS_CONTENT: SkillGroup[] = [
  { id: 'languages', label: 'Languages', skills: ['TypeScript', 'JavaScript'] },
  { id: 'frontend', label: 'Frontend', skills: ['React', 'Tailwind CSS', 'Framer Motion', 'GSAP'] },
  { id: 'state-data', label: 'State & Data', skills: ['Zustand', 'REST'] },
  { id: 'tooling', label: 'Tooling', skills: ['Vite', 'Git', 'Node.js'] },
];

/**
 * The subset of `PROJECTS_CONTENT` flagged `featured: true` — exactly the
 * mechanism the coding prompt §5 described in advance: "this is exactly
 * how Recruiter Mode's '2–4 featured projects' filters from the same data
 * source as the full Projects app." `RecruiterRoot.tsx` and the
 * `FeaturedProjectWidget` (`os/widgets/StatusWidgets.tsx`) both read this
 * one export rather than each computing their own filter over
 * `PROJECTS_CONTENT` — a second `.filter(p => p.featured)` living in
 * `RecruiterRoot.tsx` was consolidated into this single source of truth.
 */
export const FEATURED_PROJECTS: Project[] = PROJECTS_CONTENT.filter((project) => project.featured);
