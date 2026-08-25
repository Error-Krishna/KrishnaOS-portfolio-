import type { Request, Response } from 'express';
import type { ApiResponse, ContactPayload, ContactSubmission } from '@krishnaos/shared-types';
import { ContactSubmissionModel } from '../models/ContactSubmission.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactPayload(body: unknown): { valid: true; payload: ContactPayload } | { valid: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, message: 'Request body must be an object.' };
  }
  const { name, email, subject, message } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length < 1) {
    return { valid: false, message: 'Name is required.' };
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { valid: false, message: 'A valid email is required.' };
  }
  if (subject !== undefined && typeof subject !== 'string') {
    return { valid: false, message: 'Subject must be text.' };
  }
  if (typeof subject === 'string' && subject.length > 200) {
    return { valid: false, message: 'Subject is too long (max 200 characters).' };
  }
  if (typeof message !== 'string' || message.trim().length < 1) {
    return { valid: false, message: 'Message is required.' };
  }
  if (message.length > 5000) {
    return { valid: false, message: 'Message is too long (max 5000 characters).' };
  }

  const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';

  return {
    valid: true,
    payload: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(trimmedSubject.length > 0 ? { subject: trimmedSubject } : {}),
      message: message.trim(),
    },
  };
}

export async function submitContact(req: Request, res: Response<ApiResponse<ContactSubmission>>) {
  const validation = validateContactPayload(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { message: validation.message, code: 'VALIDATION_ERROR' },
    });
  }

  try {
    const doc = await ContactSubmissionModel.create(validation.payload);
    return res.status(201).json({
      success: true,
      data: {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        ...(doc.subject ? { subject: doc.subject } : {}),
        message: doc.message,
        createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[contact] Failed to save submission:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to save your message. Please try again shortly.', code: 'DB_ERROR' },
    });
  }
}
