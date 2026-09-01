import type { ComponentType } from 'react';
import type { Project } from '@krishnaos/shared-types';
import { lazy } from 'react';

export type EmbeddedRuntimeProps = {
  project: Project;
};

type EmbeddedRuntimeComponent = ComponentType<EmbeddedRuntimeProps>;

export const EMBEDDED_RUNTIMES: Record<
  string,
  EmbeddedRuntimeComponent
> = {
  'udhyog-saathi': lazy(
    () =>
      import('./embedded/UdhyogSaathiRuntime').then((module) => ({
        default: module.UdhyogSaathiRuntime,
      })),
  ),

  hotreload: lazy(
    () =>
      import('./embedded/hotreload/HotReloadRuntime').then((module) => ({
        default: module.HotReloadRuntime,
      })),
  ),
};
