import type { ComponentType } from 'react';
import type { Project } from '@krishnaos/shared-types';
import { lazy } from 'react';

export type SandboxRuntimeProps = {
  project: Project;
};

type SandboxRuntimeComponent = ComponentType<SandboxRuntimeProps>;

export const SANDBOX_RUNTIMES: Record<
  string,
  SandboxRuntimeComponent
> = {
  'job-automation': lazy(
    () =>
      import('./sandbox/job-automation/JobAutomationRuntime').then(
        (module) => ({
          default: module.JobAutomationRuntime,
        }),
      ),
  ),

  'personal-finance-tracker': lazy(
    () =>
      import(
        './sandbox/personal-finance-tracker/PersonalFinanceRuntime'
      ).then((module) => ({
        default: module.PersonalFinanceRuntime,
      })),
  ),
};
