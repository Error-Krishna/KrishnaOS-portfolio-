import { useState } from 'react';
import type {
  Project,
  UdhyogSaathiDemoDashboard,
} from '@krishnaos/shared-types';

import { RunnerLoadingSkeleton } from '../../ProjectRunnerShell';
import { useUdhyogSaathiRuntime } from './udhyog-saathi/useUdhyogSaathiRuntime';
import { BillingView } from './udhyog-saathi/BillingView';
import { InventoryView } from './udhyog-saathi/InventoryView';
import { MetricCard } from './udhyog-saathi/MetricCard';

interface UdhyogSaathiRuntimeProps {
  project: Project;
}

type View = 'dashboard' | 'billing' | 'inventory';

export function UdhyogSaathiRuntime({
  project,
}: UdhyogSaathiRuntimeProps) {
  const [view, setView] = useState<View>('dashboard');

  const {
    dashboard,
    bills,
    inventory,
    loading,
    refreshing,
    error,
    refreshError,
    syncDashboard,
    updateBill,
    removeBill,
    updateInventory,
    removeInventory,
    syncRuntime,
  } = useUdhyogSaathiRuntime();

  if (loading) {
    return (
      <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
        <RunnerLoadingSkeleton label="Loading Udhyog Saathi demo…" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-6 text-center">
        <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
          Unable to load Udhyog Saathi
        </p>

        <p className="max-w-md text-os-caption text-[color:var(--color-os-text-tertiary)]">
          {error ?? 'The demo API returned an unexpected response.'}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3">
        <div>
          <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
            {project.title}
          </p>
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            Live KrishnaOS demo API
          </p>
        </div>

        <div className="flex items-center gap-os-2">
          {refreshing && (
            <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
              Syncing…
            </span>
          )}

          <button
            type="button"
            onClick={() => void syncRuntime()}
            disabled={refreshing}
            className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-1.5 text-os-caption font-medium text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? 'Syncing…' : 'Refresh'}
          </button>

          <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
            {dashboard.source === 'demo' ? 'Demo data' : 'Live data'}
          </span>
        </div>
      </div>

      {refreshError && (
        <div className="border-b border-amber-500/20 bg-amber-500/5 px-os-4 py-os-2">
          <div className="flex items-center justify-between gap-os-3">
            <p className="text-os-caption text-amber-600">
              {refreshError}
            </p>

            <button
              type="button"
              onClick={() => void syncRuntime()}
              disabled={refreshing}
              className="text-os-caption font-medium text-amber-600 hover:underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col sm:flex-row">
        <aside className="shrink-0 border-b border-[color:var(--color-os-glass-border)] p-os-2 sm:w-44 sm:border-b-0 sm:border-r sm:p-os-3">
          <nav className="flex flex-row gap-os-1 overflow-x-auto sm:flex-col">
            {(
              [
                ['dashboard', 'Dashboard'],
                ['billing', 'Billing'],
                ['inventory', 'Inventory'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`rounded-os-md px-os-3 py-os-2 text-left text-os-caption transition-colors ${
                  view === value
                    ? 'bg-[color:var(--color-os-accent)] text-white'
                    : 'text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-os-3 sm:p-os-5">
          {view === 'dashboard' && (
            <DashboardView dashboard={dashboard} project={project} />
          )}

          {view === 'billing' && (
            <BillingView
              bills={bills}
              onBillCreated={(bill) => {
                updateBill(bill);
                void syncDashboard();
              }}
              onBillUpdated={(bill) => {
                updateBill(bill);
                void syncDashboard();
              }}
              onBillDeleted={(id) => {
                removeBill(id);
                void syncDashboard();
              }}
            />
          )}

          {view === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onInventoryCreated={(item) => {
                updateInventory(item);
                void syncDashboard();
              }}
              onInventoryUpdated={(item) => {
                updateInventory(item);
                void syncDashboard();
              }}
              onInventoryDeleted={(id) => {
                removeInventory(id);
                void syncDashboard();
              }}
            />
          )}

        </main>
      </div>
    </div>
  );
}

function DashboardView({
  dashboard,
  project,
}: {
  dashboard: UdhyogSaathiDemoDashboard;
  project: Project;
}) {
  return (
    <div className="flex flex-col gap-os-4">
      <div>
        <p className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
          Business Dashboard
        </p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Explore the core workflows of {project.title}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3">
        {dashboard.metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] p-os-4">
        <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
          Runtime status
        </p>

        <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          This dashboard is populated through the KrishnaOS server adapter.
        </p>
      </div>
    </div>
  );
}
