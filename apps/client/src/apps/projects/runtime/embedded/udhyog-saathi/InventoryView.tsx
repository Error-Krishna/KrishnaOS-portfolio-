import type {
  UdhyogSaathiDemoInventoryItem,
} from '@krishnaos/shared-types';
import {
  createUdhyogSaathiInventoryItem,
  deleteUdhyogSaathiInventoryItem,
  updateUdhyogSaathiInventoryItem,
} from '@/lib/apiClient';
import { useState } from 'react';
import { MetricCard } from './MetricCard';
import { SearchFilterBar } from './SearchFilterBar';

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
    setDeletingId(id);
    setDeleteError(null);

    const response = await deleteUdhyogSaathiInventoryItem(id);

    if (!response.success) {
      setDeleteError(response.error.message);
      setDeletingId(null);
      return;
    }

    onInventoryDeleted(id);

    if (editingId === id) {
      resetForm();
    }

    setConfirmDeleteId(null);
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

      <SearchFilterBar
        search={inventorySearch}
        onSearchChange={setInventorySearch}
        searchPlaceholder="Search inventory…"
        searchLabel="Search inventory by item name"
        filter={inventoryFilter}
        onFilterChange={(value) =>
          setInventoryFilter(value as 'all' | 'finished' | 'raw')
        }
        filterLabel="Filter inventory by type"
        filterOptions={[
          { value: 'all', label: 'All Types' },
          { value: 'finished', label: 'Finished Products' },
          { value: 'raw', label: 'Raw Materials' },
        ]}
        resultLabel={`Showing ${filteredInventory.length} of ${inventory.length} items`}
      />

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

              {confirmDeleteId === item.id ? (
                <div className="flex items-center gap-os-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === item.id}
                    className="rounded-os-full border border-[color:var(--color-os-glass-border)] px-os-3 py-1.5 text-os-caption text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-surface-elevated)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="rounded-os-full bg-red-500 px-os-3 py-1.5 text-os-caption text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Deleting…' : 'Confirm'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setConfirmDeleteId(item.id);
                  }}
                  disabled={deletingId === item.id}
                  className="rounded-os-full border border-red-500/30 px-os-3 py-1.5 text-os-caption text-red-500 hover:bg-red-500/10 disabled:opacity-50"
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


export { InventoryView };
