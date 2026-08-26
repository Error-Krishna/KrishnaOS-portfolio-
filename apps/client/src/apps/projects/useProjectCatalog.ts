import { useEffect, useState } from 'react';
import type {
  Project,
  ProjectCatalog,
  ProjectCatalogEntry,
} from '@krishnaos/shared-types';
import { getProjectCatalog } from '@/lib/apiClient';

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

export function useProjectCatalog() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalog, setCatalog] = useState<ProjectCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError(null);

      try {
        const response = await getProjectCatalog();

        if (cancelled) {
          return;
        }

        if (!response.success) {
          setError(response.error.message);
          return;
        }

        setCatalog(response.data);
        setProjects(response.data.entries.map(catalogEntryToProject));
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load project catalog',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    projects,
    catalog,
    loading,
    error,
  };
}
