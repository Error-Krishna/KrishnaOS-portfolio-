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
} from "@krishnaos/shared-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Every request made through this client races against this timeout so a
// slow/unreachable backend (e.g. a cold Render/Railway instance, or a
// misconfigured VITE_API_BASE_URL after deploy) can never leave a window
// stuck on its loading state indefinitely — callers' existing try/catch
// and `finally { setLoading(false) }` patterns already handle this,
// they just never previously had a bounded failure to catch.
const REQUEST_TIMEOUT_MS = 10_000;

// The project catalog is the one call that can legitimately hit a *sleeping*
// free-tier backend, where a cold start can take 30–50s. It gets a longer
// budget so a slow wake-up doesn't read as a failure; the UI shows a "waking
// up" message and falls back to the cached catalog in the meantime.
const CATALOG_TIMEOUT_MS = 45_000;

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
      signal: controller.signal,
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    return {
      success: false,
      error: {
        message: isTimeout
          ? "Request timed out. Please check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Network request failed",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getHealth() {
  return request<{ status: "ok" }>("/api/health");
}

/**
 * Contact form payload as sent over the wire. `website` is a honeypot: it is
 * rendered off-screen in the form, so real users never fill it, while naive
 * bots do. The server silently drops any submission where it is non-empty.
 */
export type ContactRequest = ContactPayload & { website?: string };

export function submitContactForm(payload: ContactRequest) {
  return request<ContactSubmission>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProjectCatalog() {
  return request<ProjectCatalog>("/api/projects", undefined, CATALOG_TIMEOUT_MS);
}

export function getUdhyogSaathiDashboard() {
  return request<UdhyogSaathiDemoDashboard>(
    "/api/projects/udhyog-saathi/dashboard",
  );
}

export function getUdhyogSaathiBills() {
  return request<UdhyogSaathiDemoBill[]>("/api/projects/udhyog-saathi/bills");
}

export function getUdhyogSaathiInventory() {
  return request<UdhyogSaathiDemoInventoryItem[]>(
    "/api/projects/udhyog-saathi/inventory",
  );
}

export function createUdhyogSaathiDemoBill(
  payload: UdhyogSaathiCreateDemoBillPayload,
) {
  return request<UdhyogSaathiDemoBill>("/api/projects/udhyog-saathi/bills", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUdhyogSaathiDemoBill(
  id: string,
  payload: UdhyogSaathiUpdateDemoBillPayload,
) {
  return request<UdhyogSaathiDemoBill>(
    `/api/projects/udhyog-saathi/bills/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteUdhyogSaathiDemoBill(id: string) {
  return request<{ id: string }>(`/api/projects/udhyog-saathi/bills/${id}`, {
    method: "DELETE",
  });
}

export function createUdhyogSaathiInventoryItem(
  payload: UdhyogSaathiCreateDemoInventoryItemPayload,
) {
  return request<UdhyogSaathiDemoInventoryItem>(
    "/api/projects/udhyog-saathi/inventory",
    {
      method: "POST",
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
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteUdhyogSaathiInventoryItem(id: string) {
  return request<{ deleted: true }>(
    `/api/projects/udhyog-saathi/inventory/${id}`,
    {
      method: "DELETE",
    },
  );
}
