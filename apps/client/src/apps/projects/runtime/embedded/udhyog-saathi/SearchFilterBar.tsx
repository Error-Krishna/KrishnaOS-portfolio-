interface SearchFilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  filter: string;
  onFilterChange: (value: string) => void;
  filterLabel: string;
  filterOptions: readonly SearchFilterOption[];
  resultLabel: string;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  filter,
  onFilterChange,
  filterLabel,
  filterOptions,
  resultLabel,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] p-os-4">
      <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          type="search"
          className="min-w-0 rounded-os-md border border-[color:var(--color-os-glass-border)] bg-transparent px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none focus:border-[color:var(--color-os-accent)]"
        />

        <select
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          aria-label={filterLabel}
          className="rounded-os-md border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-surface-elevated)] px-os-3 py-os-2 text-os-caption text-[color:var(--color-os-text-primary)] outline-none"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
        {resultLabel}
      </p>
    </div>
  );
}
