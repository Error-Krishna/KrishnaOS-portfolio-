import type {
  ApiResponse,
  ContactPayload,
  ContactSubmission,
  ProjectCatalog,
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
