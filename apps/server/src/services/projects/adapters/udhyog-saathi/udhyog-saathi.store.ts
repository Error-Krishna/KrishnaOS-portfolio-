import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type {
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoInventoryItem,
} from '@krishnaos/shared-types';

interface UdhyogSaathiStoreData {
  bills: UdhyogSaathiDemoBill[];
  inventory: UdhyogSaathiDemoInventoryItem[];
}

const STORE_PATH = resolve(process.cwd(), 'data/udhyog-saathi-demo.json');

const DEFAULT_DATA: UdhyogSaathiStoreData = {
  bills: [
    {
      id: 'demo-bill-001',
      type: 'pakka',
      clientName: 'Acme Manufacturing',
      total: 18500,
      createdAt: '2026-08-20T10:00:00.000Z',
    },
    {
      id: 'demo-bill-002',
      type: 'pakka',
      clientName: 'Sharma Industries',
      total: 12400,
      createdAt: '2026-08-21T11:30:00.000Z',
    },
    {
      id: 'demo-bill-003',
      type: 'kaccha',
      clientName: 'Demo Retailer',
      total: 7600,
      createdAt: '2026-08-22T09:15:00.000Z',
    },
  ],
  inventory: [
    {
      id: 'demo-finished-001',
      name: 'Steel Cabinet',
      type: 'finished',
      quantity: 42,
    },
    {
      id: 'demo-finished-002',
      name: 'Industrial Table',
      type: 'finished',
      quantity: 32,
    },
    {
      id: 'demo-raw-001',
      name: 'Steel Sheet',
      type: 'raw',
      quantity: 36,
    },
    {
      id: 'demo-raw-002',
      name: 'Aluminium Rod',
      type: 'raw',
      quantity: 18,
    },
  ],
};

/**
 * Backs the Udhyog Saathi demo runtime's Billing/Inventory CRUD with a
 * small JSON file on local disk, seeded from `DEFAULT_DATA` on first run.
 *
 * **Deployment note:** several common hosting targets (serverless
 * platforms, containers without a persistent volume, some free-tier PaaS
 * dynos) either have a read-only filesystem or wipe `process.cwd()` on
 * every redeploy/restart/instance-swap. Neither `load()` nor `save()`
 * treats a failed disk read/write as fatal: `this.data` (the in-memory
 * copy) is always the real source of truth for the life of the running
 * process, and `persist()` failures are caught and logged rather than
 * thrown. This means the live demo keeps working correctly for every
 * visitor for as long as the process stays up, even on a filesystem that
 * silently can't be written to — worst case, changes don't survive a
 * server restart, which is an honest limitation of a demo sandbox, not a
 * broken feature. A future upgrade path (swapping this store for a real
 * MongoDB collection, matching how `ContactSubmission` already persists)
 * would remove this caveat entirely without changing this class's public
 * `load`/`save` shape.
 */
export class UdhyogSaathiStore {
  private data: UdhyogSaathiStoreData | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  async load(): Promise<UdhyogSaathiStoreData> {
    if (this.data) {
      return this.data;
    }

    try {
      const raw = await readFile(STORE_PATH, 'utf8');
      this.data = JSON.parse(raw) as UdhyogSaathiStoreData;
      return this.data;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code !== 'ENOENT') {
        console.warn(
          '[udhyog-saathi] Could not read demo store from disk, starting from seed data:',
          nodeError.message,
        );
      }

      this.data = structuredClone(DEFAULT_DATA);
      await this.persist();
      return this.data;
    }
  }

  async save(data: UdhyogSaathiStoreData): Promise<void> {
    this.data = data;

    this.writeQueue = this.writeQueue.then(async () => {
      await this.persist();
    });

    await this.writeQueue;
  }

  private async persist(): Promise<void> {
    if (!this.data) {
      return;
    }

    try {
      await mkdir(dirname(STORE_PATH), { recursive: true });

      await writeFile(
        STORE_PATH,
        `${JSON.stringify(this.data, null, 2)}\n`,
        'utf8',
      );
    } catch (error) {
      // Non-fatal by design — see the class doc comment above. The
      // in-memory `this.data` this process just updated remains correct
      // and keeps serving requests; only durability across a restart is
      // lost on a filesystem that can't be written to.
      console.warn(
        '[udhyog-saathi] Could not persist demo store to disk (non-fatal, in-memory state is unaffected):',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
