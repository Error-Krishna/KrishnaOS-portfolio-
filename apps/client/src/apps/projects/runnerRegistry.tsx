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
 * Compatibility metadata for the existing project gallery.
 *
 * This intentionally contains no project-specific React components.
 * Interactive execution will be resolved by the generic project runtime
 * architecture rather than by importing one runner per project.
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
    demoLabel: 'Live analytics demo',
    runtimeType: 'embedded',
  },
  'project-personal-finance-tracker': {
    category: 'Web Apps',
    demoLabel: 'Working expense tracker',
    runtimeType: 'embedded',
  },
  'project-job-automation': {
    category: 'Automation',
    demoLabel: 'Automation pipeline demo',
    runtimeType: 'embedded',
  },
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'SaaS',
  'Web Apps',
  'Developer Tools',
  'Automation',
];
