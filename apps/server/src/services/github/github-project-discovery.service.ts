import type { GitHubRepositoryReference } from '@krishnaos/shared-types';

interface GitHubRepositoryResponse {
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  fork: boolean;
  archived: boolean;
}

export class GitHubProjectDiscoveryService {
  private readonly apiBaseUrl = 'https://api.github.com';

  // GitHub's API is generally fast, but a hung request here has an outsized
  // blast radius: it blocks buildCatalog() from ever reaching its own
  // try/catch fallback to the static catalog, which in turn hangs the
  // /api/projects route and the client's loading state. Bounding it means
  // a slow/unreachable GitHub always resolves into the fallback path
  // instead of hanging indefinitely.
  private readonly requestTimeoutMs = 8_000;

  constructor(
    private readonly owner = process.env.GITHUB_OWNER,
    private readonly token = process.env.GITHUB_TOKEN,
  ) {}

  async discoverRepositories(): Promise<GitHubRepositoryReference[]> {
    if (!this.owner) {
      throw new Error('GITHUB_OWNER is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    let response: Response;

    try {
      response = await fetch(
        `${this.apiBaseUrl}/users/${encodeURIComponent(this.owner)}/repos?per_page=100&sort=updated`,
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
        throw new Error('GitHub repository discovery timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(
        `GitHub repository discovery failed: ${response.status} ${response.statusText}`,
      );
    }

    const repositories =
      (await response.json()) as GitHubRepositoryResponse[];

    return repositories
      .filter((repository) => !repository.archived)
      .map((repository) => ({
        owner: this.owner!,
        name: repository.name,
        fullName: repository.full_name,
        url: repository.html_url,
        defaultBranch: repository.default_branch,
      }));
  }
}
