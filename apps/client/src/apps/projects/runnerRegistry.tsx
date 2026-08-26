import type { ComponentType } from 'react';
import { UdhyogSaathiRunner } from './runners/UdhyogSaathiRunner';
import { HotReloadRunner } from './runners/HotReloadRunner';
import { InsightLoopRunner } from './runners/InsightLoopRunner';
import { PersonalFinanceRunner } from './runners/PersonalFinanceRunner';
import { JobAutomationRunner } from './runners/JobAutomationRunner';

export type ProjectCategory = 'SaaS' | 'Web Apps' | 'Developer Tools' | 'Automation';

interface ProjectRunnerEntry {
  category: ProjectCategory;
  /** Short tag shown on the project card (e.g. "Live dashboard demo"). */
  demoLabel: string;
  Runner: ComponentType;
}

/**
 * Single source of truth mapping a real `PROJECTS_CONTENT` entry (by id)
 * to its category (drives the filter pills) and its in-OS interactive
 * demo component (drives what renders when a visitor presses "Try Live").
 *
 * This is the "reusable project-window component" registry: adding a new
 * project's live demo later is exactly one new entry here plus one new
 * file in `runners/` — `ProjectsApp.tsx`, `ProjectCard.tsx`, and
 * `ProjectRunnerShell.tsx` never need to change. A project id with no
 * entry here isn't hidden or broken — `ProjectsApp` falls back to
 * `RunnerComingSoon` (see `ProjectRunnerShell.tsx`), an honest "not wired
 * up yet" state, per `AGENTS.md`'s "don't build fake/placeholder UI that
 * looks finished" rule.
 */
export const PROJECT_RUNNERS: Record<string, ProjectRunnerEntry> = {
  'project-udhyog-saathi': {
    category: 'SaaS',
    demoLabel: 'Live dashboard demo',
    Runner: UdhyogSaathiRunner,
  },
  'project-hotreload': {
    category: 'Developer Tools',
    demoLabel: 'CLI simulator',
    Runner: HotReloadRunner,
  },
  'project-insightloop': {
    category: 'Web Apps',
    demoLabel: 'Live analytics demo',
    Runner: InsightLoopRunner,
  },
  'project-personal-finance-tracker': {
    category: 'Web Apps',
    demoLabel: 'Working expense tracker',
    Runner: PersonalFinanceRunner,
  },
  'project-job-automation': {
    category: 'Automation',
    demoLabel: 'Automation pipeline demo',
    Runner: JobAutomationRunner,
  },
};

export const PROJECT_CATEGORIES: ProjectCategory[] = ['SaaS', 'Web Apps', 'Developer Tools', 'Automation'];
