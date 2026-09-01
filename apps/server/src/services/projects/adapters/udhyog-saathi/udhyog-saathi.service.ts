import type {
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiCreateDemoInventoryItemPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
  UdhyogSaathiUpdateDemoBillPayload,
  UdhyogSaathiUpdateDemoInventoryItemPayload,
} from '@krishnaos/shared-types';
import { UdhyogSaathiStore } from './udhyog-saathi.store.js';

export class UdhyogSaathiService {
  constructor(
    private readonly store = new UdhyogSaathiStore(),
  ) {}

  async getDashboard(): Promise<UdhyogSaathiDemoDashboard> {
    const data = await this.store.load();

    const revenue = data.bills.reduce(
      (sum, bill) => sum + bill.total,
      0,
    );

    return {
      projectId: 'project-udhyog-saathi',
      source: 'demo',
      metrics: [
        {
          label: 'Bills',
          value: String(data.bills.length),
        },
        {
          label: 'Inventory Items',
          value: String(data.inventory.length),
        },
        {
          label: 'Revenue',
          value: this.formatCurrency(revenue),
        },
      ],
    };
  }

  async getBills(): Promise<UdhyogSaathiDemoBill[]> {
    const data = await this.store.load();
    return [...data.bills];
  }

  async createBill(
    payload: UdhyogSaathiCreateDemoBillPayload,
  ): Promise<UdhyogSaathiDemoBill> {
    const data = await this.store.load();

    const bill: UdhyogSaathiDemoBill = {
      id: `demo-bill-${Date.now()}`,
      type: payload.type,
      clientName: payload.clientName,
      total: payload.total,
      createdAt: new Date().toISOString(),
    };

    data.bills.unshift(bill);
    await this.store.save(data);

    return bill;
  }

  async updateBill(
    id: string,
    payload: UdhyogSaathiUpdateDemoBillPayload,
  ): Promise<UdhyogSaathiDemoBill | undefined> {
    const data = await this.store.load();
    const index = data.bills.findIndex((bill) => bill.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedBill: UdhyogSaathiDemoBill = {
      ...data.bills[index],
      clientName: payload.clientName,
      type: payload.type,
      total: payload.total,
    };

    data.bills[index] = updatedBill;
    await this.store.save(data);

    return updatedBill;
  }

  async deleteBill(id: string): Promise<boolean> {
    const data = await this.store.load();
    const index = data.bills.findIndex((bill) => bill.id === id);

    if (index === -1) {
      return false;
    }

    data.bills.splice(index, 1);
    await this.store.save(data);

    return true;
  }

  async getInventory(): Promise<UdhyogSaathiDemoInventoryItem[]> {
    const data = await this.store.load();
    return [...data.inventory];
  }

  async createInventoryItem(
    payload: UdhyogSaathiCreateDemoInventoryItemPayload,
  ): Promise<UdhyogSaathiDemoInventoryItem> {
    const data = await this.store.load();

    const item: UdhyogSaathiDemoInventoryItem = {
      id: `demo-inventory-${Date.now()}`,
      name: payload.name,
      type: payload.type,
      quantity: payload.quantity,
    };

    data.inventory.unshift(item);
    await this.store.save(data);

    return item;
  }

  async updateInventoryItem(
    id: string,
    payload: UdhyogSaathiUpdateDemoInventoryItemPayload,
  ): Promise<UdhyogSaathiDemoInventoryItem | null> {
    const data = await this.store.load();
    const item = data.inventory.find((entry) => entry.id === id);

    if (!item) {
      return null;
    }

    item.name = payload.name;
    item.type = payload.type;
    item.quantity = payload.quantity;

    await this.store.save(data);

    return item;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const data = await this.store.load();
    const index = data.inventory.findIndex(
      (entry) => entry.id === id,
    );

    if (index === -1) {
      return false;
    }

    data.inventory.splice(index, 1);
    await this.store.save(data);

    return true;
  }

  private formatCurrency(value: number): string {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }

    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }

    return `₹${value.toLocaleString('en-IN')}`;
  }
}
