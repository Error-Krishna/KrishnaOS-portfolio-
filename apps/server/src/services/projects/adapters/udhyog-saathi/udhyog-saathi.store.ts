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
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code !== 'ENOENT') {
        throw error;
      }

      this.data = structuredClone(DEFAULT_DATA);
      await this.persist();
    }

    return this.data;
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

    await mkdir(dirname(STORE_PATH), { recursive: true });

    await writeFile(
      STORE_PATH,
      `${JSON.stringify(this.data, null, 2)}\n`,
      'utf8',
    );
  }
}
