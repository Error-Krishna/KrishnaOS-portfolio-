export interface ProjectDemoMetric {
  label: string;
  value: string;
}

export interface UdhyogSaathiDemoDashboard {
  projectId: 'project-udhyog-saathi';
  metrics: ProjectDemoMetric[];
  source: 'demo' | 'live';
}

export interface UdhyogSaathiDemoBill {
  id: string;
  type: 'pakka' | 'kaccha';
  clientName: string;
  total: number;
  createdAt: string;
}

export interface UdhyogSaathiDemoInventoryItem {
  id: string;
  name: string;
  type: 'finished' | 'raw';
  quantity: number;
}

export interface UdhyogSaathiCreateDemoBillPayload {
  clientName: string;
  type: 'pakka' | 'kaccha';
  total: number;
}
