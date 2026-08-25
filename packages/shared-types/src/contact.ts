export interface ContactPayload {
  name: string;
  email: string;
  /** Optional — the form and backend both accept a missing/empty subject. */
  subject?: string;
  message: string;
}

export interface ContactSubmission extends ContactPayload {
  id: string;
  createdAt: string;
}
