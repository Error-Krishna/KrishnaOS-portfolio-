import type { ProjectManifest } from './project-manifest.js';
import type { ProjectRuntimeState } from './project-manifest.js';

export interface GitHubRepositoryReference {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string;
}

export interface ProjectCatalogEntry {
  /**
   * Stable KrishnaOS project identifier.
   */
  id: string;

  /**
   * GitHub repository associated with this project.
   */
  repository: GitHubRepositoryReference;

  /**
   * Repository-provided manifest, when one exists.
   */
  manifest?: ProjectManifest;

  /**
   * KrishnaOS controls these values, not the repository.
   */
  enabled: boolean;
  featured: boolean;
  order: number;

  /**
   * Latest known runtime state.
   */
  runtime?: ProjectRuntimeState;

  /**
   * Synchronization metadata.
   */
  syncedAt?: string;
}

export interface ProjectCatalog {
  version: 1;
  entries: ProjectCatalogEntry[];
  syncedAt?: string;
}
