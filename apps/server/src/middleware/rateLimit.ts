import type { NextFunction, Request, Response } from 'express';

interface RateLimiterOptions {
  /** Length of the sliding window, in milliseconds. */
  windowMs: number;
  /** Max requests allowed per client within one window. */
  max: number;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Minimal fixed-window, in-memory rate limiter keyed by client IP.
 *
 * Deliberately dependency-free: this API has one public write endpoint and
 * runs as a single instance, so a Map is enough. If the server is ever scaled
 * to multiple instances, swap this for a shared store (e.g. Redis) — limits
 * would otherwise be tracked per instance.
 *
 * Requires `app.set('trust proxy', 1)` behind a reverse proxy (Render,
 * Railway, Vercel), otherwise every request appears to come from the proxy's
 * IP and all visitors would share one bucket.
 */
export function createRateLimiter({ windowMs, max, message }: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  // Periodically drop expired buckets so the map can't grow without bound.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  sweeper.unref(); // never keep the process alive just for cleanup

  return function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        error: {
          message: message ?? 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
        },
      });
      return;
    }

    next();
  };
}
