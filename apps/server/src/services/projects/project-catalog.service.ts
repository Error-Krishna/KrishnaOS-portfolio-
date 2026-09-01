import type {
  ProjectCatalog,
  ProjectCatalogEntry,
} from "@krishnaos/shared-types";
import { GitHubProjectDiscoveryService } from "../github/github-project-discovery.service.js";
import { ProjectManifestService } from "./project-manifest.service.js";
import { FALLBACK_CATALOG_ENTRIES } from "./fallback-catalog.data.js";

interface ProjectCatalogOverride {
  enabled: boolean;
  featured: boolean;
  order: number;
}

/**
 * Builds the real-time project catalog KrishnaOS's Projects window renders.
 *
 * Primary path: live GitHub discovery + per-repo `.krishnaos/project.json`
 * manifests (see `github-project-discovery.service.ts` /
 * `project-manifest.service.ts`). This is the intended long-term source of
 * truth — a project becomes visible in KrishnaOS by the repository itself
 * declaring so, not by hand-editing this codebase.
 *
 * That path has two real dependencies this service cannot itself
 * guarantee: `GITHUB_OWNER` must be configured, and each repository must
 * already carry a valid manifest on its default branch. Neither is true
 * yet for all of Krishna's real repositories. Rather than let a missing
 * env var or an un-manifested repo silently turn into an empty or
 * errored Projects window in production — which `AGENTS.md`'s "don't
 * ship fake/broken UI" rule and this file's own "no invented content"
 * discipline both argue against — `buildCatalog()` treats total sync
 * failure as recoverable: it logs the real cause and falls back to
 * `FALLBACK_CATALOG_ENTRIES`, a static list mirroring the exact same real
 * project data already confirmed in `krish_public.md` /
 * `apps/client/src/lib/content.ts`. The moment `GITHUB_OWNER`/`GITHUB_TOKEN`
 * are set and a repo's manifest lands, live discovery takes over for that
 * repo automatically — this fallback never needs to be manually retired,
 * it just stops being the thing that returns data.
 */
export class ProjectCatalogService {
  private readonly discoveryService: GitHubProjectDiscoveryService;
  private readonly manifestService: ProjectManifestService;

  /**
   * KrishnaOS-owned metadata.
   *
   * Repository manifests describe the project itself.
   * Portfolio presentation metadata remains controlled here.
   */
  private readonly overrides: Record<string, ProjectCatalogOverride> = {
    "project-udhyog-saathi": {
      enabled: true,
      featured: true,
      order: 0,
    },
    "project-hotreload": {
      enabled: true,
      featured: true,
      order: 1,
    },
    "project-insightloop": {
      enabled: true,
      featured: true,
      order: 2,
    },
  };

  constructor(
    discoveryService = new GitHubProjectDiscoveryService(),
    manifestService = new ProjectManifestService(),
  ) {
    this.discoveryService = discoveryService;
    this.manifestService = manifestService;
  }

  async buildCatalog(): Promise<ProjectCatalog> {
    try {
      const entries = await this.buildFromGitHub();

      if (entries.length === 0) {
        console.warn(
          "[projects] GitHub sync returned zero visible projects — falling back to the static catalog.",
        );
        return this.buildFallbackCatalog();
      }

      return {
        version: 1,
        entries,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "[projects] Live GitHub catalog sync failed, falling back to the static catalog:",
        error instanceof Error ? error.message : error,
      );
      return this.buildFallbackCatalog();
    }
  }

  private async buildFromGitHub(): Promise<ProjectCatalogEntry[]> {
    const repositories = await this.discoveryService.discoverRepositories();

    const syncedAt = new Date().toISOString();

    const manifests = await Promise.all(
      repositories.map(async (repository) => ({
        repository,
        manifest: await this.manifestService.loadManifest(repository),
      })),
    );

    const entries: ProjectCatalogEntry[] = [];

    for (const { repository, manifest } of manifests) {
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
        syncedAt,
      });
    }

    entries.sort((a, b) => a.order - b.order);

    return entries;
  }

  private buildFallbackCatalog(): ProjectCatalog {
    const entries = [...FALLBACK_CATALOG_ENTRIES]
      .sort((a, b) => a.order - b.order)
      .map((entry) => ({ ...entry, syncedAt: new Date().toISOString() }));

    return {
      version: 1,
      entries,
      syncedAt: new Date().toISOString(),
    };
  }
}
