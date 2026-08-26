import type {
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiCreateDemoInventoryItemPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
  UdhyogSaathiUpdateDemoBillPayload,
  UdhyogSaathiUpdateDemoInventoryItemPayload,
} from '@krishnaos/shared-types';

export class UdhyogSaathiService {
  private readonly bills: UdhyogSaathiDemoBill[] = [
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
  ];

  private readonly inventory: UdhyogSaathiDemoInventoryItem[] = [
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
  ];

  getDashboard(): UdhyogSaathiDemoDashboard {
    return {
      projectId: 'project-udhyog-saathi',
      source: 'demo',
      metrics: [
        { label: 'Bills', value: '24' },
        { label: 'Inventory Items', value: '128' },
        { label: 'Revenue', value: '₹1.24L' },
      ],
    };
  }

  getBills(): UdhyogSaathiDemoBill[] {
    return [...this.bills];
  }

  createBill(
    payload: UdhyogSaathiCreateDemoBillPayload,
  ): UdhyogSaathiDemoBill {
    const bill: UdhyogSaathiDemoBill = {
      id: `demo-bill-${Date.now()}`,
      type: payload.type,
      clientName: payload.clientName,
      total: payload.total,
      createdAt: new Date().toISOString(),
    };

    this.bills.unshift(bill);

    return bill;
  }

  updateBill(
    id: string,
    payload: UdhyogSaathiUpdateDemoBillPayload,
  ): UdhyogSaathiDemoBill | undefined {
    const index = this.bills.findIndex((bill) => bill.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedBill: UdhyogSaathiDemoBill = {
      ...this.bills[index],
      clientName: payload.clientName,
      type: payload.type,
      total: payload.total,
    };

    this.bills[index] = updatedBill;

    return updatedBill;
  }

  deleteBill(id: string): boolean {
    const index = this.bills.findIndex((bill) => bill.id === id);

    if (index === -1) {
      return false;
    }

    this.bills.splice(index, 1);
    return true;
  }

  getInventory(): UdhyogSaathiDemoInventoryItem[] {
    return [...this.inventory];
  }

  createInventoryItem(
    payload: UdhyogSaathiCreateDemoInventoryItemPayload,
  ): UdhyogSaathiDemoInventoryItem {
    const item: UdhyogSaathiDemoInventoryItem = {
      id: `demo-inventory-${Date.now()}`,
      name: payload.name,
      type: payload.type,
      quantity: payload.quantity,
    };

    this.inventory.unshift(item);

    return item;
  }

  updateInventoryItem(
    id: string,
    payload: UdhyogSaathiUpdateDemoInventoryItemPayload,
  ): UdhyogSaathiDemoInventoryItem | null {
    const index = this.inventory.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem: UdhyogSaathiDemoInventoryItem = {
      ...this.inventory[index],
      name: payload.name,
      type: payload.type,
      quantity: payload.quantity,
    };

    this.inventory[index] = updatedItem;

    return updatedItem;
  }

  deleteInventoryItem(id: string): boolean {
    const index = this.inventory.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    this.inventory.splice(index, 1);

    return true;
  }
}
