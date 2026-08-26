import { useEffect, useState } from 'react';
import type {
  Project,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
} from '@krishnaos/shared-types';
import {
  createUdhyogSaathiDemoBill,
  createUdhyogSaathiInventoryItem,
  updateUdhyogSaathiInventoryItem,
  deleteUdhyogSaathiInventoryItem,
  deleteUdhyogSaathiDemoBill,
  getUdhyogSaathiBills,
  getUdhyogSaathiDashboard,
  getUdhyogSaathiInventory,
  updateUdhyogSaathiDemoBill,
} from '@/lib/apiClient';
import { RunnerLoadingSkeleton } from '../../ProjectRunnerShell';

interface UdhyogSaathiRuntimeProps {
  project: Project;
}

type View = 'dashboard' | 'billing' | 'inventory';

export function UdhyogSaathiRuntime({
  project,
}: UdhyogSaathiRuntimeProps) {
  const [view, setView] = useState<View>('dashboard');
  const [dashboard, setDashboard] =
    useState<UdhyogSaathiDemoDashboard | null>(null);
  const [bills, setBills] = useState<UdhyogSaathiDemoBill[]>([]);
  const [inventory, setInventory] =
    useState<UdhyogSaathiDemoInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  async function syncRuntime() {
    setRefreshing(true);
    setRefreshError(null);

    try {
      const [
        dashboardResponse,
        billsResponse,
        inventoryResponse,
      ] = await Promise.all([
        getUdhyogSaathiDashboard(),
        getUdhyogSaathiBills(),
        getUdhyogSaathiInventory(),
      ]);

      if (!dashboardResponse.success) {
        throw new Error(dashboardResponse.error.message);
      }

      if (!billsResponse.success) {
        throw new Error(billsResponse.error.message);
      }

      if (!inventoryResponse.success) {
        throw new Error(inventoryResponse.error.message);
      }

      setDashboard(dashboardResponse.data);
      setBills(billsResponse.data);
      setInventory(inventoryResponse.data);
    } catch (syncError) {
      setRefreshError(
        syncError instanceof Error
          ? syncError.message
          : 'Unable to synchronize Udhyog Saathi.',
      );
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [dashboardResponse, billsResponse, inventoryResponse] =
        await Promise.all([
          getUdhyogSaathiDashboard(),
          getUdhyogSaathiBills(),
          getUdhyogSaathiInventory(),
        ]);

      if (cancelled) {
        return;
      }

      if (!dashboardResponse.success) {
        setError(dashboardResponse.error.message);
        setLoading(false);
        return;
      }

      if (!billsResponse.success) {
        setError(billsResponse.error.message);
        setLoading(false);
        return;
      }

      if (!inventoryResponse.success) {
        setError(inventoryResponse.error.message);
        setLoading(false);
        return;
      }

      setDashboard(dashboardResponse.data);
      setBills(billsResponse.data);
      setInventory(inventoryResponse.data);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
              onBillCreated={() => {
                void syncRuntime();
              }}
              onBillUpdated={() => {
                void syncRuntime();
              }}
              onBillDeleted={() => {
                void syncRuntime();
              }}
            />
          )}

          {view === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onInventoryCreated={() => {
                void syncRuntime();
              }}
              onInventoryUpdated={() => {
                void syncRuntime();
              }}
              onInventoryDeleted={() => {
                void syncRuntime();
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

function BillingView({
  bills,
  onBillCreated,
  onBillUpdated,
  onBillDeleted,
}: {
  bills: UdhyogSaathiDemoBill[];
  onBillCreated: (bill: UdhyogSaathiDemoBill) => void;
  onBillUpdated: (bill: UdhyogSaathiDemoBill) => void;
  onBillDeleted: (id: string) => void;
}) {
  const [clientName, setClientName] = useState('');
  const [type, setType] = useState<'pakka' | 'kaccha'>('pakka');
  const [total, setTotal] = useState('');
  const [billSearch, setBillSearch] = useState('');
  const [billFilter, setBillFilter] =
    useState<'all' | 'pakka' | 'kaccha'>('all');

  const [editingBill, setEditingBill] =
    useState<UdhyogSaathiDemoBill | null>(null);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const pakkaBills = bills.filter((bill) => bill.type === 'pakka');
  const kacchaBills = bills.filter((bill) => bill.type === 'kaccha');

  const normalizedBillSearch = billSearch.trim().toLowerCase();

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      !normalizedBillSearch ||
      bill.clientName.toLowerCase().includes(normalizedBillSearch);

    const matchesFilter =
      billFilter === 'all' || bill.type === billFilter;

    return matchesSearch && matchesFilter;
  });

  async function handleCreateBill(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedClientName = clientName.trim();
    const numericTotal = Number(total);

    if (!trimmedClientName) {
      setCreateError('Client name is required.');
      return;
    }

    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      setCreateError('Enter a valid bill amount.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    const response = await createUdhyogSaathiDemoBill({
      clientName: trimmedClientName,
      type,
      total: numericTotal,
    });

    if (!response.success) {
      setCreateError(response.error.message);
      setCreating(false);
      return;
    }

    onBillCreated(response.data);
    setClientName('');
    setType('pakka');
    setTotal('');
    setCreating(false);
  }

  function startEditing(bill: UdhyogSaathiDemoBill) {
    setEditingBill(bill);
    setClientName(bill.clientName);
    setType(bill.type);
    setTotal(String(bill.total));
    setEditError(null);
  }

  function cancelEditing() {
    setEditingBill(null);
    setClientName('');
    setType('pakka');
    setTotal('');
    setEditError(null);
  }

  async function handleUpdateBill(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!editingBill) {
      return;
    }

    const trimmedClientName = clientName.trim();
    const numericTotal = Number(total);

    if (!trimmedClientName) {
      setEditError('Client name is required.');
      return;
    }

    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      setEditError('Enter a valid bill amount.');
      return;
    }

    setSaving(true);
    setEditError(null);

    const response = await updateUdhyogSaathiDemoBill(
      editingBill.id,
      {
        clientName: trimmedClientName,
        type,
        total: numericTotal,
      },
    );

    if (!response.success) {
      setEditError(response.error.message);
      setSaving(false);
      return;
    }

    onBillUpdated(response.data);
    cancelEditing();
    setSaving(false);
  }

  async function handleDeleteBill(id: string) {
    const bill = bills.find((item) => item.id === id);

    if (!bill) {
      return;
    }

    const confirmed = window.confirm(
      `Delete the bill for ${bill.clientName}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    const response = await deleteUdhyogSaathiDemoBill(id);

    if (!response.success) {
      window.alert(response.error.message);
      setDeletingId(null);
      return;
    }

    if (editingBill?.id === id) {
      cancelEditing();
    }

    onBillDeleted(id);
    setDeletingId(null);
  }

  const formTitle = editingBill
    ? `Edit ${editingBill.clientName}`
    : 'Create Demo Bill';

  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex items-start justify-between gap-os-3">
        <div>
          <p className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
            Billing
          </p>

          <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
            Demo invoices from Udhyog Saathi.
          </p>
        </div>

        {editingBill && (
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-4 py-os-2 text-os-caption font-medium text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)]"
          >
            Cancel edit
          </button>
        )}
      </div>

      <form
        onSubmit={editingBill ? handleUpdateBill : handleCreateBill}
        className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4"
      >
        <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
          {formTitle}
        </p>

        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3">
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Client name"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as 'pakka' | 'kaccha')
            }
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none"
          >
            <option value="pakka">Pakka</option>
            <option value="kaccha">Kaccha</option>
          </select>

          <input
            value={total}
            onChange={(event) => setTotal(event.target.value)}
            type="number"
            min="1"
            step="0.01"
            placeholder="Amount"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />
        </div>

        {(createError || editError) && (
          <p className="text-os-caption text-red-500">
            {createError ?? editError}
          </p>
        )}

        <button
          type="submit"
          disabled={creating || saving}
          className="w-fit rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {editingBill
            ? saving
              ? 'Saving…'
              : 'Save Changes'
            : creating
              ? 'Creating…'
              : 'Create Demo Bill'}
        </button>
      </form>

      <div className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4">
        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-[1fr_auto]">
          <input
            value={billSearch}
            onChange={(event) => setBillSearch(event.target.value)}
            placeholder="Search by client name…"
            aria-label="Search bills by client name"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />

          <select
            value={billFilter}
            onChange={(event) =>
              setBillFilter(
                event.target.value as 'all' | 'pakka' | 'kaccha',
              )
            }
            aria-label="Filter bills by type"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none"
          >
            <option value="all">All Types</option>
            <option value="pakka">Pakka</option>
            <option value="kaccha">Kaccha</option>
          </select>
        </div>

        <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Showing {filteredBills.length} of {bills.length} bills
        </p>
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        <MetricCard
          label="Pakka Bills"
          value={String(pakkaBills.length)}
        />

        <MetricCard
          label="Kaccha Bills"
          value={String(kacchaBills.length)}
        />
      </div>

      <div className="overflow-x-auto rounded-os-lg border border-[color:var(--color-os-glass-border)]">
        <div className="grid min-w-[620px] grid-cols-[1fr_auto_auto_auto] gap-os-3 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3 text-os-caption font-semibold text-[color:var(--color-os-text-tertiary)]">
          <span>Client</span>
          <span>Type</span>
          <span>Total</span>
          <span>Actions</span>
        </div>

        {bills.length === 0 && (
          <div className="px-os-4 py-os-8 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
            No demo bills yet.
          </div>
        )}

        {bills.length > 0 && filteredBills.length === 0 && (
          <div className="px-os-4 py-os-8 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
            No bills match the current search or filter.
          </div>
        )}

        {filteredBills.map((bill) => (
          <div
            key={bill.id}
            className="grid min-w-[620px] grid-cols-[1fr_auto_auto_auto] items-center gap-os-3 border-b border-[color:var(--color-os-glass-border)] px-os-4 py-os-3 last:border-b-0"
          >
            <span className="min-w-0 truncate text-os-caption text-[color:var(--color-os-text-primary)]">
              {bill.clientName}
            </span>

            <span className="text-os-caption capitalize text-[color:var(--color-os-text-secondary)]">
              {bill.type}
            </span>

            <span className="text-os-caption font-medium text-[color:var(--color-os-text-primary)]">
              ₹{bill.total.toLocaleString('en-IN')}
            </span>

            <div className="flex items-center gap-os-2">
              <button
                type="button"
                onClick={() => startEditing(bill)}
                disabled={deletingId === bill.id}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-1 text-os-caption font-medium text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteBill(bill.id)}
                disabled={deletingId === bill.id}
                className="rounded-os-full border border-red-500/30 px-os-3 py-1 text-os-caption font-medium text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === bill.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryView({
  inventory,
  onInventoryCreated,
  onInventoryUpdated,
  onInventoryDeleted,
}: {
  inventory: UdhyogSaathiDemoInventoryItem[];
  onInventoryCreated: (item: UdhyogSaathiDemoInventoryItem) => void;
  onInventoryUpdated: (item: UdhyogSaathiDemoInventoryItem) => void;
  onInventoryDeleted: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] =
    useState<'finished' | 'raw'>('finished');
  const [quantity, setQuantity] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] =
    useState<'all' | 'finished' | 'raw'>('all');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const finished = inventory.filter((item) => item.type === 'finished');
  const raw = inventory.filter((item) => item.type === 'raw');

  const normalizedInventorySearch =
    inventorySearch.trim().toLowerCase();

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      !normalizedInventorySearch ||
      item.name.toLowerCase().includes(normalizedInventorySearch);

    const matchesFilter =
      inventoryFilter === 'all' || item.type === inventoryFilter;

    return matchesSearch && matchesFilter;
  });

  function resetForm() {
    setEditingId(null);
    setName('');
    setType('finished');
    setQuantity('');
    setFormError(null);
  }

  function startEditing(item: UdhyogSaathiDemoInventoryItem) {
    setEditingId(item.id);
    setName(item.name);
    setType(item.type);
    setQuantity(String(item.quantity));
    setFormError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();
    const numericQuantity = Number(quantity);

    if (!trimmedName) {
      setFormError('Item name is required.');
      return;
    }

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity < 0 ||
      !Number.isInteger(numericQuantity)
    ) {
      setFormError('Enter a valid whole-number quantity.');
      return;
    }

    setSaving(true);
    setFormError(null);

    if (editingId) {
      const response = await updateUdhyogSaathiInventoryItem(
        editingId,
        {
          name: trimmedName,
          type,
          quantity: numericQuantity,
        },
      );

      if (!response.success) {
        setFormError(response.error.message);
        setSaving(false);
        return;
      }

      onInventoryUpdated(response.data);
      resetForm();
      setSaving(false);
      return;
    }

    const response = await createUdhyogSaathiInventoryItem({
      name: trimmedName,
      type,
      quantity: numericQuantity,
    });

    if (!response.success) {
      setFormError(response.error.message);
      setSaving(false);
      return;
    }

    onInventoryCreated(response.data);
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this inventory item?')) {
      return;
    }

    setDeletingId(id);
    setFormError(null);

    const response = await deleteUdhyogSaathiInventoryItem(id);

    if (!response.success) {
      setFormError(response.error.message);
      setDeletingId(null);
      return;
    }

    onInventoryDeleted(id);

    if (editingId === id) {
      resetForm();
    }

    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-os-4">
      <div>
        <p className="text-os-title font-bold text-[color:var(--color-os-text-primary)]">
          Inventory
        </p>

        <p className="text-os-caption text-[color:var(--color-os-text-secondary)]">
          Manage demo stock from Udhyog Saathi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        <MetricCard
          label="Finished Products"
          value={String(finished.length)}
        />

        <MetricCard
          label="Raw Materials"
          value={String(raw.length)}
        />
      </div>

      <div className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4">
        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-[1fr_auto]">
          <input
            value={inventorySearch}
            onChange={(event) => setInventorySearch(event.target.value)}
            placeholder="Search inventory…"
            aria-label="Search inventory by item name"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />

          <select
            value={inventoryFilter}
            onChange={(event) =>
              setInventoryFilter(
                event.target.value as 'all' | 'finished' | 'raw',
              )
            }
            aria-label="Filter inventory by type"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none"
          >
            <option value="all">All Types</option>
            <option value="finished">Finished Products</option>
            <option value="raw">Raw Materials</option>
          </select>
        </div>

        <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Showing {filteredInventory.length} of {inventory.length} items
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4"
      >
        <div className="flex items-center justify-between gap-os-3">
          <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
            {editingId ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </p>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-os-caption text-[color:var(--color-os-text-tertiary)] hover:text-[color:var(--color-os-text-primary)]"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Item name"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as 'finished' | 'raw')
            }
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none"
          >
            <option value="finished">Finished Product</option>
            <option value="raw">Raw Material</option>
          </select>

          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            min="0"
            step="1"
            placeholder="Quantity"
            className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
          />
        </div>

        {formError && (
          <p className="text-os-caption text-red-500">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? 'Saving…'
            : editingId
              ? 'Update Item'
              : 'Add Item'}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
        {inventory.length > 0 && filteredInventory.length === 0 && (
          <div className="col-span-full rounded-os-lg border border-[color:var(--color-os-glass-border)] px-os-4 py-os-8 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
            No inventory items match the current search or filter.
          </div>
        )}

        {filteredInventory.map((item) => (
          <div
            key={item.id}
            className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4"
          >
            <div className="flex items-start justify-between gap-os-3">
              <div>
                <p className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
                  {item.name}
                </p>

                <p className="mt-os-1 text-os-caption text-[color:var(--color-os-text-tertiary)]">
                  {item.type === 'finished'
                    ? 'Finished product'
                    : 'Raw material'}
                </p>
              </div>

              <span className="text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
                {item.quantity}
              </span>
            </div>

            <div className="mt-os-4 flex gap-os-2">
              <button
                type="button"
                onClick={() => startEditing(item)}
                disabled={deletingId === item.id}
                className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-1.5 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)] disabled:opacity-50"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => void handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="rounded-os-full border border-red-500/30 px-os-3 py-1.5 text-os-caption text-red-500 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deletingId === item.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
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
