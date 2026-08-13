export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactSubmission extends ContactPayload {
  id: string;
  createdAt: string;
}
