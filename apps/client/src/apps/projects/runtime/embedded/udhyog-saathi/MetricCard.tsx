export function MetricCard({
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
