import type {
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
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

  getInventory(): UdhyogSaathiDemoInventoryItem[] {
    return [
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
  }
}
