import type { ProjectManifest } from '@krishnaos/shared-types';
import type { GitHubRepositoryReference } from '@krishnaos/shared-types';

interface GitHubContentResponse {
  content?: string;
  encoding?: string;
}

export class ProjectManifestService {
  private readonly apiBaseUrl = 'https://api.github.com';
  private readonly manifestPath = '.krishnaos/project.json';

  // Called once per discovered repository (see project-catalog.service.ts's
  // sequential buildFromGitHub loop) — an unbounded hang here blocks every
  // repository after it, not just the one being fetched.
  private readonly requestTimeoutMs = 8_000;

  constructor(
    private readonly token = process.env.GITHUB_TOKEN,
  ) {}

  async loadManifest(
    repository: GitHubRepositoryReference,
  ): Promise<ProjectManifest | undefined> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    let response: Response;

    try {
      response = await fetch(
        `${this.apiBaseUrl}/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/contents/${this.manifestPath}?ref=${encodeURIComponent(repository.defaultBranch)}`,
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/vnd.github+json',
            ...(this.token
              ? { Authorization: `Bearer ${this.token}` }
              : {}),
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          `GitHub manifest fetch timed out for ${repository.fullName}`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(
        `GitHub manifest fetch failed for ${repository.fullName}: ${response.status} ${response.statusText}`,
      );
    }

    const content = (await response.json()) as GitHubContentResponse;

    if (content.encoding !== 'base64' || !content.content) {
      throw new Error(
        `Invalid GitHub manifest response for ${repository.fullName}`,
      );
    }

    let parsed: unknown;

    try {
      const decoded = Buffer.from(content.content, 'base64').toString('utf8');
      parsed = JSON.parse(decoded);
    } catch {
      throw new Error(
        `Invalid JSON manifest in ${repository.fullName}/${this.manifestPath}`,
      );
    }

    return this.validateManifest(parsed, repository);
  }

  private validateManifest(
    value: unknown,
    repository: GitHubRepositoryReference,
  ): ProjectManifest {
    if (!this.isRecord(value)) {
      throw new Error(`Manifest in ${repository.fullName} must be an object`);
    }

    if (value.schemaVersion !== 1) {
      throw new Error(
        `Unsupported manifest schema in ${repository.fullName}`,
      );
    }

    if (typeof value.id !== 'string' || !value.id.trim()) {
      throw new Error(`Manifest id is required in ${repository.fullName}`);
    }

    if (typeof value.name !== 'string' || !value.name.trim()) {
      throw new Error(`Manifest name is required in ${repository.fullName}`);
    }

    if (value.description !== undefined && typeof value.description !== 'string') {
      throw new Error(
        `Manifest description is invalid in ${repository.fullName}`,
      );
    }

    if (value.version !== undefined && typeof value.version !== 'string') {
      throw new Error(
        `Manifest version is invalid in ${repository.fullName}`,
      );
    }

    if (value.role !== undefined && typeof value.role !== 'string') {
      throw new Error(
        `Manifest role is invalid in ${repository.fullName}`,
      );
    }

    if (
      value.stack !== undefined &&
      (!Array.isArray(value.stack) ||
        value.stack.some((technology) => typeof technology !== 'string'))
    ) {
      throw new Error(
        `Manifest stack is invalid in ${repository.fullName}`,
      );
    }

    if (
      !this.isRecord(value.visibility) ||
      typeof value.visibility.showInKrishnaOS !== 'boolean'
    ) {
      throw new Error(
        `Manifest visibility is invalid in ${repository.fullName}`,
      );
    }

    if (!this.isRecord(value.runtime) || typeof value.runtime.type !== 'string') {
      throw new Error(
        `Manifest runtime is invalid in ${repository.fullName}`,
      );
    }

    const runtimeTypes = ['embedded', 'remote', 'sandbox', 'static'] as const;

    if (
      !runtimeTypes.includes(
        value.runtime.type as (typeof runtimeTypes)[number],
      )
    ) {
      throw new Error(
        `Unsupported runtime type in ${repository.fullName}`,
      );
    }

    return value as unknown as ProjectManifest;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
