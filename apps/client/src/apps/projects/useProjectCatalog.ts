import { useEffect, useMemo, useState } from 'react';
import type {
  Project,
  ProjectCatalog,
  ProjectCatalogEntry,
} from '@krishnaos/shared-types';
import { getProjectCatalog } from '@/lib/apiClient';

const CACHE_KEY = 'krishnaos:projectCatalog:v1';

/** How long a fetch can run before the UI tells the visitor the server is waking up. */
const SLOW_THRESHOLD_MS = 2_500;

function catalogEntryToProject(entry: ProjectCatalogEntry): Project {
  const manifest = entry.manifest;

  return {
    id: entry.id,
    title: manifest?.name ?? entry.repository.name,
    summary:
      manifest?.description ??
      `Project from ${entry.repository.fullName}.`,
    description:
      manifest?.description ??
      `Explore ${manifest?.name ?? entry.repository.name}.`,
    role: manifest?.role ?? 'Developer',
    stack: manifest?.stack ?? [],
    links: {
      github: entry.repository.url,
      live: manifest?.runtime.url,
    },
    featured: entry.featured,
    runtime: manifest?.runtime,
  };
}

/**
 * The last successfully fetched catalog, kept in localStorage so repeat
 * visitors see projects instantly (stale-while-revalidate) even if the
 * backend is asleep or briefly unreachable. Always defensively parsed —
 * storage can be unavailable (private mode) or hold stale/corrupt data.
 */
function readCachedCatalog(): ProjectCatalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectCatalog;
    return Array.isArray(parsed?.entries) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedCatalog(catalog: ProjectCatalog) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    // Storage full or unavailable — caching is a nice-to-have, never required.
  }
}

export function useProjectCatalog() {
  const [catalog, setCatalog] = useState<ProjectCatalog | null>(() => readCachedCatalog());
  // Only "loading" when there is nothing to show yet; with a cached catalog
  // the refresh below happens silently in the background.
  const [loading, setLoading] = useState(() => readCachedCatalog() === null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects = useMemo<Project[]>(
    () => (catalog ? catalog.entries.map(catalogEntryToProject) : []),
    [catalog],
  );

  useEffect(() => {
    let cancelled = false;
    const hadCache = readCachedCatalog() !== null;

    // Flag a slow response (almost always a cold-starting backend) so the UI
    // can say so instead of looking frozen.
    const slowTimer = hadCache
      ? undefined
      : window.setTimeout(() => {
          if (!cancelled) setSlow(true);
        }, SLOW_THRESHOLD_MS);

    async function loadCatalog() {
      setError(null);

      try {
        const response = await getProjectCatalog();

        if (cancelled) {
          return;
        }

        if (!response.success) {
          // A failed refresh must not wipe out a perfectly good cached list.
          if (!hadCache) setError(response.error.message);
          return;
        }

        setCatalog(response.data);
        writeCachedCatalog(response.data);
      } catch (error) {
        if (!cancelled && !hadCache) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load project catalog',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSlow(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
      window.clearTimeout(slowTimer);
    };
  }, []);

  return {
    projects,
    catalog,
    loading,
    slow,
    error,
  };
}
