import { useEffect, useState } from 'react';
import { PlusGlyph } from '@/os/icons';
import { RunnerLoadingSkeleton } from '../ProjectRunnerShell';

type OrderStatus = 'Pending' | 'In Progress' | 'Completed';

interface DemoOrder {
  id: string;
  product: string;
  amount: number;
  status: OrderStatus;
}

interface DemoWorker {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const SEED_ORDERS: DemoOrder[] = [
  { id: 'ORD-001', product: 'Steel Sheets (500kg)', amount: 42500, status: 'Completed' },
  { id: 'ORD-002', product: 'Machine Parts Batch', amount: 18750, status: 'In Progress' },
  { id: 'ORD-003', product: 'Raw Cotton (2T)', amount: 96000, status: 'Pending' },
  { id: 'ORD-004', product: 'Packaging Rolls', amount: 8200, status: 'Completed' },
];

const SEED_WORKERS: DemoWorker[] = [
  { id: 'w1', name: 'Rakesh Kumar', role: 'Line Supervisor', active: true },
  { id: 'w2', name: 'Sunita Devi', role: 'Quality Check', active: true },
  { id: 'w3', name: 'Arjun Yadav', role: 'Machine Operator', active: false },
  { id: 'w4', name: 'Priya Sharma', role: 'Warehouse Lead', active: true },
];

const PRODUCT_POOL = ['Steel Coils', 'Cotton Bales', 'Plastic Granules', 'Machine Bearings', 'Copper Wire (1T)'];

const STATUS_STYLES: Record<OrderStatus, string> = {
  Completed: 'text-[#4ade80] bg-[#4ade80]/15',
  'In Progress': 'text-[#facc15] bg-[#facc15]/15',
  Pending: 'text-[color:var(--color-os-text-tertiary)] bg-[color:var(--color-os-glass)]',
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  Pending: 'In Progress',
  'In Progress': 'Completed',
  Completed: 'Pending',
};

type Tab = 'dashboard' | 'orders' | 'workers';
const TABS: Tab[] = ['dashboard', 'orders', 'workers'];
const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed'] as const;

let seq = SEED_ORDERS.length + 1;

/**
 * Udhyog Saathi's live demo: a small "business OS" dashboard with three
 * real tabs. Orders can be added (recomputes revenue/order-count stat
 * cards live), filtered by status, and cycled through their workflow by
 * tapping the status pill; workers can be toggled active/inactive, which
 * feeds the "Active Workers" stat. All state is local — this mirrors the
 * real product's dashboard interactions, it isn't wired to the real
 * Udhyog Saathi backend.
 */
export function UdhyogSaathiRunner() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<DemoOrder[]>(SEED_ORDERS);
  const [workers, setWorkers] = useState<DemoWorker[]>(SEED_WORKERS);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('All');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeWorkers = workers.filter((w) => w.active).length;

  function addOrder() {
    const product = PRODUCT_POOL[Math.floor(Math.random() * PRODUCT_POOL.length)];
    const amount = Math.round((Math.random() * 80000 + 5000) / 100) * 100;
    const id = `ORD-${String(seq).padStart(3, '0')}`;
    seq += 1;
    setOrders((prev) => [{ id, product, amount, status: 'Pending' }, ...prev]);
  }

  function cycleStatus(id: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: NEXT_STATUS[o.status] } : o)));
  }

  function toggleWorker(id: string) {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  }

  if (loading) return <RunnerLoadingSkeleton label="Connecting to workspace…" />;

  const filteredOrders = statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="flex flex-col gap-os-4">
      <div className="flex flex-wrap items-center gap-os-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-os-full px-os-3 py-os-1 text-os-caption font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-[color:var(--color-os-accent)] text-white'
                : 'border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]'
            }`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-os-caption text-[color:var(--color-os-text-tertiary)]">
          Demo mode — sample data
        </span>
      </div>

      {tab === 'dashboard' && (
        <div className="flex flex-col gap-os-4">
          <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-3">
            <StatCard label="Total Orders" value={String(totalOrders)} tint="#38bdf8" />
            <StatCard label="Total Revenue" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} tint="#4ade80" />
            <StatCard label="Active Workers" value={String(activeWorkers)} tint="#a78bfa" />
          </div>
          <button
            type="button"
            onClick={addOrder}
            className="flex w-fit items-center gap-os-2 rounded-os-full bg-[color:var(--color-os-accent)] px-os-4 py-os-2 text-os-caption font-medium text-white transition-opacity hover:opacity-90"
          >
            <PlusGlyph className="h-3.5 w-3.5" />
            Simulate new order
          </button>
          <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
            <p className="mb-os-3 text-os-caption font-semibold text-[color:var(--color-os-text-primary)]">
              Recent Orders
            </p>
            <OrdersTable orders={orders.slice(0, 5)} onCycle={cycleStatus} />
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="flex flex-col gap-os-3">
          <div className="flex flex-wrap items-center gap-os-2">
            <span className="text-os-caption text-[color:var(--color-os-text-tertiary)]">Filter:</span>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-os-full px-os-3 py-os-1 text-os-caption transition-colors ${
                  statusFilter === s
                    ? 'bg-[color:var(--color-os-accent)] text-white'
                    : 'border border-[color:var(--color-os-glass-border)] text-[color:var(--color-os-text-secondary)] hover:bg-[color:var(--color-os-glass)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
            {filteredOrders.length === 0 ? (
              <p className="py-os-6 text-center text-os-caption text-[color:var(--color-os-text-tertiary)]">
                No orders match this filter.
              </p>
            ) : (
              <OrdersTable orders={filteredOrders} onCycle={cycleStatus} />
            )}
          </div>
          <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">
            Tap a status pill to move an order through its workflow.
          </p>
        </div>
      )}

      {tab === 'workers' && (
        <div className="grid grid-cols-1 gap-os-3 sm:grid-cols-2">
          {workers.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-os-3 rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4"
            >
              <div>
                <p className="text-os-body font-semibold text-[color:var(--color-os-text-primary)]">{w.name}</p>
                <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{w.role}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleWorker(w.id)}
                aria-pressed={w.active}
                aria-label={`Toggle ${w.name} active status`}
                className={`relative h-6 w-11 shrink-0 rounded-os-full transition-colors ${
                  w.active ? 'bg-[#4ade80]' : 'bg-[color:var(--color-os-glass-border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    w.active ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="rounded-os-lg border border-[color:var(--color-os-glass-border)] bg-[color:var(--color-os-glass)] p-os-4">
      <p className="text-os-title font-bold" style={{ color: tint }}>
        {value}
      </p>
      <p className="text-os-caption text-[color:var(--color-os-text-tertiary)]">{label}</p>
    </div>
  );
}

function OrdersTable({ orders, onCycle }: { orders: DemoOrder[]; onCycle: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-os-2">
      {orders.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-os-2 text-os-caption">
          <span className="text-[color:var(--color-os-text-tertiary)]">{o.id}</span>
          <span className="flex-1 truncate px-os-2 text-[color:var(--color-os-text-secondary)]">{o.product}</span>
          <span className="text-[color:var(--color-os-text-secondary)]">₹{o.amount.toLocaleString('en-IN')}</span>
          <button
            type="button"
            onClick={() => onCycle(o.id)}
            className={`rounded-os-full px-os-2 py-0.5 font-medium ${STATUS_STYLES[o.status]}`}
          >
            {o.status}
          </button>
        </div>
      ))}
    </div>
  );
}
