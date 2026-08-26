export type ProjectRuntimeType =
  | 'embedded'
  | 'remote'
  | 'sandbox'
  | 'static';

export type ProjectRuntimeStatus =
  | 'ready'
  | 'building'
  | 'offline'
  | 'unsupported'
  | 'error';

export interface ProjectRuntimeConfig {
  type: ProjectRuntimeType;

  /**
   * Optional runtime-specific entry point.
   * Examples:
   * - embedded: component/adapter identifier
   * - remote: deployed URL
   * - sandbox: runtime service identifier
   * - static: built application path
   */
  entry?: string;

  /**
   * Optional public URL for remote projects.
   */
  url?: string;

  /**
   * Optional port used by a sandboxed project runtime.
   */
  port?: number;
}
