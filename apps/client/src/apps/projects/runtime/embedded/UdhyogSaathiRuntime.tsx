import { useMemo, useState } from 'react';
import type { Project } from '@krishnaos/shared-types';

interface UdhyogSaathiRuntimeProps {
  project: Project;
}

type View = 'dashboard' | 'billing' | 'inventory';

export function UdhyogSaathiRuntime({
  project,
}: UdhyogSaathiRuntimeProps) {
  const [view, setView] = useState<View>('dashboard');

  const apiBaseUrl = project.runtime?.apiBaseUrl;

  const apiStatus = useMemo(
    () => (apiBaseUrl ? 'Configured' : 'Not configured'),
    [apiBaseUrl],
  );

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3">
        <div>
          <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">
            Udhyog Saathi
          </p>
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            Embedded application preview
          </p>
        </div>

        <span className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-2 py-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
          API: {apiStatus}
        </span>
      </div>

      <div className="flex flex-1">
        <aside className="w-44 shrink-0 border-r border-[color:var(--color-os-glass-border)] p-os-3">
          <nav className="flex flex-col gap-os-1">
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

        <main className="flex-1 p-os-5">
          {view === 'dashboard' && (
            <DashboardView project={project} />
          )}

          {view === 'billing' && <BillingView />}

          {view === 'inventory' && <InventoryView />}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ project }: { project: Project }) {
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
        <MetricCard label="Bills" value="24" />
        <MetricCard label="Inventory Items" value="128" />
        <MetricCard label="Revenue" value="₹1.24L" />
      </div>

      <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] p-os-4">
        <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
          Embedded runtime
        </p>

        <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-secondary)]">
          The portfolio is running this project inside KrishnaOS rather than
          redirecting the visitor to another application.
        </p>
      </div>
    </div>
  );
}

function BillingView() {
  return (
    <div className="flex flex-col gap-os-4">
      <div>
        <p className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
          Billing
        </p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Create and inspect billing workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        <MetricCard label="Pakka Bills" value="18" />
        <MetricCard label="Kaccha Bills" value="6" />
      </div>

      <button
        type="button"
        className="w-fit rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white hover:opacity-90"
      >
        Create Demo Bill
      </button>
    </div>
  );
}

function InventoryView() {
  return (
    <div className="flex flex-col gap-os-4">
      <div>
        <p className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
          Inventory
        </p>
        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Manage stock, warehouses and transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        <MetricCard label="Finished Products" value="74" />
        <MetricCard label="Raw Materials" value="54" />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4">
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        {label}
      </p>
      <p className="mt-os-1 text-os-headline font-bold text-[color:var(--color-os-text-primary)]">
        {value}
      </p>
    </div>
  );
}
