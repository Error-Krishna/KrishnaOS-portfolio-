import type {
  ProjectCatalog,
  ProjectCatalogEntry,
} from '@krishnaos/shared-types';
import { GitHubProjectDiscoveryService } from '../github/github-project-discovery.service.js';
import { ProjectManifestService } from './project-manifest.service.js';

interface ProjectCatalogOverride {
  enabled: boolean;
  featured: boolean;
  order: number;
}

export class ProjectCatalogService {
  private readonly discoveryService: GitHubProjectDiscoveryService;
  private readonly manifestService: ProjectManifestService;

  /**
   * KrishnaOS-owned metadata.
   *
   * Repository manifests describe the project itself.
   * Portfolio presentation metadata remains controlled here.
   */
  private readonly overrides: Record<string, ProjectCatalogOverride> = {};

  constructor(
    discoveryService = new GitHubProjectDiscoveryService(),
    manifestService = new ProjectManifestService(),
  ) {
    this.discoveryService = discoveryService;
    this.manifestService = manifestService;
  }

  async buildCatalog(): Promise<ProjectCatalog> {
    const repositories = await this.discoveryService.discoverRepositories();

    const entries: ProjectCatalogEntry[] = [];

    for (const repository of repositories) {
      const manifest = await this.manifestService.loadManifest(repository);

      if (!manifest?.visibility.showInKrishnaOS) {
        continue;
      }

      const override = this.overrides[manifest.id] ?? {
        enabled: true,
        featured: false,
        order: entries.length,
      };

      if (!override.enabled) {
        continue;
      }

      entries.push({
        id: manifest.id,
        repository,
        manifest,
        enabled: override.enabled,
        featured: override.featured,
        order: override.order,
        syncedAt: new Date().toISOString(),
      });
    }

    entries.sort((a, b) => a.order - b.order);

    return {
      version: 1,
      entries,
      syncedAt: new Date().toISOString(),
    };
  }
}
