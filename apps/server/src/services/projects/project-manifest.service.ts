import type { ProjectManifest } from '@krishnaos/shared-types';
import type { GitHubRepositoryReference } from '@krishnaos/shared-types';

interface GitHubContentResponse {
  content?: string;
  encoding?: string;
}

export class ProjectManifestService {
  private readonly apiBaseUrl = 'https://api.github.com';
  private readonly manifestPath = '.krishnaos/project.json';

  constructor(
    private readonly token = process.env.GITHUB_TOKEN,
  ) {}

  async loadManifest(
    repository: GitHubRepositoryReference,
  ): Promise<ProjectManifest | undefined> {
    const response = await fetch(
      `${this.apiBaseUrl}/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/contents/${this.manifestPath}?ref=${encodeURIComponent(repository.defaultBranch)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(this.token
            ? { Authorization: `Bearer ${this.token}` }
            : {}),
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

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
