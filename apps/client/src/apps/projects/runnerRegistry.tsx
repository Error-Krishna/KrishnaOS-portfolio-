import type { ProjectRuntimeType } from '@krishnaos/shared-types';

export type ProjectCategory =
  | 'SaaS'
  | 'Web Apps'
  | 'Developer Tools'
  | 'Automation';

export interface ProjectRunnerEntry {
  category: ProjectCategory;
  demoLabel: string;
  runtimeType: ProjectRuntimeType;
}

/**
 * Display/filter metadata for the Projects gallery — category pill and
 * "Try Live" demo-label copy, keyed by project id.
 *
 * This is intentionally NOT what decides how a project's live demo
 * actually renders — that's `project.runtime` (see
 * `@krishnaos/shared-types`'s `ProjectRuntimeConfig`), sourced from the
 * project catalog (GitHub manifest when synced, or the server's
 * `fallback-catalog.data.ts` otherwise) and dispatched by
 * `runtime/ProjectRuntime.tsx`. `runtimeType` here is kept in sync with
 * the real runtime for documentation/readability, but if the two ever
 * drift, `project.runtime.type` on the actual catalog entry wins — this
 * map contains no React components and cannot itself change what renders.
 *
 * A project id with no entry here still renders in "All Projects" (see
 * `ProjectCard.tsx`) — it just doesn't gain a category pill or demo-label,
 * matching this file's existing "don't hide or break an unregistered
 * project" principle.
 */
export const PROJECT_RUNNERS: Record<string, ProjectRunnerEntry> = {
  'project-udhyog-saathi': {
    category: 'SaaS',
    demoLabel: 'Live dashboard demo',
    runtimeType: 'embedded',
  },
  'project-hotreload': {
    category: 'Developer Tools',
    demoLabel: 'CLI simulator',
    runtimeType: 'embedded',
  },
  'project-insightloop': {
    category: 'Web Apps',
    // InsightLoop's real deployment is embedded live via an iframe
    // (runtime.type: 'remote' on its catalog entry) rather than a
    // hand-built in-OS demo, since the actual full-stack app is already
    // hosted and working — see ProjectRuntime.tsx's RemoteProjectRuntime.
    demoLabel: 'Live application',
    runtimeType: 'remote',
  },
  'project-personal-finance-tracker': {
    category: 'Web Apps',
    demoLabel: 'Working expense tracker',
    runtimeType: 'sandbox',
  },
  'project-job-automation': {
    category: 'Automation',
    demoLabel: 'Automation pipeline demo',
    runtimeType: 'sandbox',
  },
  'project-alpha-vault': {
    category: 'Web Apps',
    demoLabel: 'Source available',
    runtimeType: 'static',
  },
  'project-epet': {
    category: 'Web Apps',
    demoLabel: 'Source available',
    runtimeType: 'static',
  },
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'SaaS',
  'Web Apps',
  'Developer Tools',
  'Automation',
];
