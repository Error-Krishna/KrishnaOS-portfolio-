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

  constructor(
    private readonly owner = process.env.GITHUB_OWNER,
    private readonly token = process.env.GITHUB_TOKEN,
  ) {}

  async discoverRepositories(): Promise<GitHubRepositoryReference[]> {
    if (!this.owner) {
      throw new Error('GITHUB_OWNER is not configured');
    }

    const response = await fetch(
      `${this.apiBaseUrl}/users/${encodeURIComponent(this.owner)}/repos?per_page=100&sort=updated`,
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
