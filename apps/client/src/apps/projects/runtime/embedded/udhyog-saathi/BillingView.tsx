import type {
  UdhyogSaathiDemoBill,
} from '@krishnaos/shared-types';
import {
  createUdhyogSaathiDemoBill,
  deleteUdhyogSaathiDemoBill,
  updateUdhyogSaathiDemoBill,
} from '@/lib/apiClient';
import { useState } from 'react';
import { MetricCard } from './MetricCard';
import { SearchFilterBar } from './SearchFilterBar';

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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

    setDeletingId(id);
    setDeleteError(null);

    const response = await deleteUdhyogSaathiDemoBill(id);

    if (!response.success) {
      setDeleteError(response.error.message);
      setDeletingId(null);
      return;
    }

    if (editingBill?.id === id) {
      cancelEditing();
    }

    setConfirmDeleteId(null);
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

      <SearchFilterBar
        search={billSearch}
        onSearchChange={setBillSearch}
        searchPlaceholder="Search by client name…"
        searchLabel="Search bills by client name"
        filter={billFilter}
        onFilterChange={(value) =>
          setBillFilter(value as 'all' | 'pakka' | 'kaccha')
        }
        filterLabel="Filter bills by type"
        filterOptions={[
          { value: 'all', label: 'All Types' },
          { value: 'pakka', label: 'Pakka' },
          { value: 'kaccha', label: 'Kaccha' },
        ]}
        resultLabel={`Showing ${filteredBills.length} of ${bills.length} bills`}
      />

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

      {deleteError && (
        <div className="flex items-center justify-between gap-os-3 rounded-os-md border border-red-500/20 bg-red-500/5 px-os-3 py-os-2">
          <p className="text-os-caption text-red-500">
            {deleteError}
          </p>

          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="text-os-caption font-medium text-red-500 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

              {confirmDeleteId === bill.id ? (
                <div className="flex items-center gap-os-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === bill.id}
                    className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-1 text-os-caption font-medium text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDeleteBill(bill.id)}
                    disabled={deletingId === bill.id}
                    className="rounded-os-full bg-red-500 px-os-3 py-1 text-os-caption font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {deletingId === bill.id ? 'Deleting…' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmDeleteId(bill.id);
                  }}
                  disabled={deletingId === bill.id}
                  className="rounded-os-full border border-red-500/30 px-os-3 py-1 text-os-caption font-medium text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export { BillingView };
