import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

export const contactRouter = Router();

// 5 submissions per IP per 15 minutes — generous for a real person (a typo'd
// retry or two) but enough to stop a script from flooding the database.
const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'You have sent several messages recently. Please try again in a few minutes.',
});

contactRouter.post('/', contactRateLimit, submitContact);
