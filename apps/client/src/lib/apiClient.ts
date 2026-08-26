import type {
  ApiResponse,
  ContactPayload,
  ContactSubmission,
  ProjectCatalog,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoInventoryItem,
  UdhyogSaathiCreateDemoInventoryItemPayload,
  UdhyogSaathiUpdateDemoInventoryItemPayload,
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiUpdateDemoBillPayload,
} from '@krishnaos/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err) {
    return {
      success: false,
      error: { message: err instanceof Error ? err.message : 'Network request failed' },
    };
  }
}

export function getHealth() {
  return request<{ status: 'ok' }>('/api/health');
}

export function submitContactForm(payload: ContactPayload) {
  return request<ContactSubmission>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProjectCatalog() {
  return request<ProjectCatalog>('/api/projects');
}

export function getUdhyogSaathiDashboard() {
  return request<UdhyogSaathiDemoDashboard>(
    '/api/projects/udhyog-saathi/dashboard',
  );
}

export function getUdhyogSaathiBills() {
  return request<UdhyogSaathiDemoBill[]>(
    '/api/projects/udhyog-saathi/bills',
  );
}

export function getUdhyogSaathiInventory() {
  return request<UdhyogSaathiDemoInventoryItem[]>(
    '/api/projects/udhyog-saathi/inventory',
  );
}


export function createUdhyogSaathiDemoBill(
  payload: UdhyogSaathiCreateDemoBillPayload,
) {
  return request<UdhyogSaathiDemoBill>(
    '/api/projects/udhyog-saathi/bills',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}


export function updateUdhyogSaathiDemoBill(
  id: string,
  payload: UdhyogSaathiUpdateDemoBillPayload,
) {
  return request<UdhyogSaathiDemoBill>(
    `/api/projects/udhyog-saathi/bills/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export function deleteUdhyogSaathiDemoBill(id: string) {
  return request<{ id: string }>(
    `/api/projects/udhyog-saathi/bills/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export function createUdhyogSaathiInventoryItem(
  payload: UdhyogSaathiCreateDemoInventoryItemPayload,
) {
  return request<UdhyogSaathiDemoInventoryItem>(
    '/api/projects/udhyog-saathi/inventory',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function updateUdhyogSaathiInventoryItem(
  id: string,
  payload: UdhyogSaathiUpdateDemoInventoryItemPayload,
) {
  return request<UdhyogSaathiDemoInventoryItem>(
    `/api/projects/udhyog-saathi/inventory/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export function deleteUdhyogSaathiInventoryItem(id: string) {
  return request<{ deleted: true }>(
    `/api/projects/udhyog-saathi/inventory/${id}`,
    {
      method: 'DELETE',
    },
  );
}
