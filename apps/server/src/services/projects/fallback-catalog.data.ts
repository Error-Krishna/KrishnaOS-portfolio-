import type { ProjectCatalogEntry } from '@krishnaos/shared-types';

/**
 * Static mirror of the confirmed real project data (see `krish_public.md`
 * and `apps/client/src/lib/content.ts`), used when live GitHub catalog
 * sync is unavailable — see the doc comment on
 * `ProjectCatalogService.buildCatalog()` for why this fallback exists and
 * when it stops being used.
 *
 * `id`, `repository`, `manifest.stack`, `links`/`runtime.url`, and
 * `featured` all match the corresponding entries in `content.ts` and the
 * runtime-type mapping in `apps/client/src/apps/projects/runnerRegistry.tsx`
 * exactly. Nothing here is invented — if a real project's data changes in
 * `content.ts`, this file should be updated to match.
 *
 * NOTE (verify before relying on in production): the `repository` fields
 * for Personal Finance Tracker, Job Automation System, and EPet were
 * inferred from naming conventions elsewhere in this repo/context.md, not
 * confirmed against the actual GitHub repo names/branches. A wrong value
 * here only means a dead "View on GitHub" link in the fallback state, not
 * a build error — but please double check these three against the real
 * repos before shipping.
 */
export const FALLBACK_CATALOG_ENTRIES: ProjectCatalogEntry[] = [
  {
    id: 'project-udhyog-saathi',
    repository: {
      owner: 'Manish-bhargava',
      name: 'udhyog-saathi-frontend',
      fullName: 'Manish-bhargava/udhyog-saathi-frontend',
      url: 'https://github.com/Manish-bhargava/udhyog-saathi-frontend',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-udhyog-saathi',
      name: 'Udhyog Saathi',
      description:
        'A Business Operating System designed to digitize and simplify workflows for small and mid-sized manufacturers.',
      role: 'Co-founder & Frontend/Product Developer',
      stack: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'WebSockets'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'embedded', entry: 'udhyog-saathi', url: 'https://udhyogsaathi.in/' },
    },
    enabled: true,
    featured: true,
    order: 0,
  },
  {
    id: 'project-hotreload',
    repository: {
      owner: 'Error-Krishna',
      name: 'hotreload',
      fullName: 'Error-Krishna/hotreload',
      url: 'https://github.com/Error-Krishna/hotreload',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-hotreload',
      name: 'HotReload',
      description:
        'A Go-based developer CLI that automatically watches files and manages server rebuilds and restarts.',
      role: 'Developer & Maintainer',
      stack: ['Go', 'fsnotify', 'CLI', 'File Watching', 'Process Management'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'embedded', entry: 'hotreload' },
    },
    enabled: true,
    featured: true,
    order: 1,
  },
  {
    id: 'project-insightloop',
    repository: {
      owner: 'Error-Krishna',
      name: 'InsightLoop',
      fullName: 'Error-Krishna/InsightLoop',
      url: 'https://github.com/Error-Krishna/InsightLoop',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-insightloop',
      name: 'InsightLoop',
      description:
        'A full-stack business management and analytics platform focused on operational visibility.',
      role: 'Full-Stack Developer',
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'WebSockets'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'remote', url: 'https://insightloop.onrender.com/' },
    },
    enabled: true,
    featured: true,
    order: 2,
  },
  {
    id: 'project-personal-finance-tracker',
    repository: {
      owner: 'Error-Krishna',
      name: 'personal-finance-tracker',
      fullName: 'Error-Krishna/personal-finance-tracker',
      url: 'https://github.com/Error-Krishna/personal-finance-tracker',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-personal-finance-tracker',
      name: 'Personal Finance Tracker',
      description: 'A personal finance application for tracking and visualizing financial activity.',
      role: 'Full-Stack Developer',
      stack: ['Python', 'Flask', 'MongoDB', 'Chart.js'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'sandbox', entry: 'personal-finance-tracker' },
    },
    enabled: true,
    featured: false,
    order: 3,
  },
  {
    id: 'project-job-automation',
    repository: {
      owner: 'Error-Krishna',
      name: 'job-automation-system',
      fullName: 'Error-Krishna/job-automation-system',
      url: 'https://github.com/Error-Krishna/job-automation-system',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-job-automation',
      name: 'Job Automation System',
      description:
        'A Python-based system for discovering, tracking, and automating parts of the job application workflow.',
      role: 'Automation Developer',
      stack: ['Python', 'Selenium', 'Browser Automation', 'CSV', 'CLI'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'sandbox', entry: 'job-automation' },
    },
    enabled: true,
    featured: false,
    order: 4,
  },
  {
    id: 'project-alpha-vault',
    repository: {
      owner: 'Error-Krishna',
      name: 'Alpha-vault-frontend',
      fullName: 'Error-Krishna/Alpha-vault-frontend',
      url: 'https://github.com/Error-Krishna/Alpha-vault-frontend',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-alpha-vault',
      name: 'Alpha Vault',
      description:
        'A modern full-stack application focused on secure financial and portfolio management workflows.',
      role: 'Full-Stack Developer',
      stack: ['React', 'TypeScript', 'Node.js', 'REST APIs'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'static' },
    },
    enabled: true,
    featured: false,
    order: 5,
  },
  {
    id: 'project-epet',
    repository: {
      owner: 'Error-Krishna',
      name: 'epet',
      fullName: 'Error-Krishna/epet',
      url: 'https://github.com/Error-Krishna/epet',
      defaultBranch: 'main',
    },
    manifest: {
      schemaVersion: 1,
      id: 'project-epet',
      name: 'EPet',
      description: 'A digital platform project focused on building a modern pet-care experience.',
      role: 'Developer',
      stack: ['Web', 'Frontend'],
      visibility: { showInKrishnaOS: true },
      runtime: { type: 'static' },
    },
    enabled: true,
    featured: false,
    order: 6,
  },
];
