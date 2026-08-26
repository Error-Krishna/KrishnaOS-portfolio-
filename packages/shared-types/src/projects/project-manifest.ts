import type { ProjectRuntimeConfig } from './project-runtime.js';

export interface ProjectManifestVisibility {
  /**
   * Whether the project is eligible to appear in KrishnaOS.
   *
   * This is metadata supplied by the repository. Final portfolio
   * visibility is controlled by the KrishnaOS project catalog.
   */
  showInKrishnaOS: boolean;
}

export interface ProjectManifest {
  /**
   * Manifest schema version.
   */
  schemaVersion: 1;

  /**
   * Stable project identifier.
   */
  id: string;

  /**
   * Human-readable project name.
   */
  name: string;

  /**
   * Short description used by KrishnaOS.
   */
  description?: string;

  /**
   * Optional project version.
   */
  version?: string;

  /**
   * Role performed on the project.
   */
  role?: string;

  /**
   * Technologies used by the project.
   */
  stack?: string[];

  visibility: ProjectManifestVisibility;

  runtime: ProjectRuntimeConfig;
}
