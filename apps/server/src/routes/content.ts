import { Router, type Response } from 'express';
import type { ApiResponse } from '@krishnaos/shared-types';

export const contentRouter = Router();

/**
 * Placeholder. Once content collections (projects, experience, education,
 * achievements) are modeled in Mongoose, this becomes a real read API —
 * e.g. GET /api/content/projects, GET /api/content/experience, etc.
 * For now content can stay hardcoded client-side; this route just proves
 * the surface exists.
 */
contentRouter.get('/', (_req, res: Response<ApiResponse<{ collections: string[] }>>) => {
  res.json({
    success: true,
    data: { collections: ['projects', 'experience', 'education', 'achievements'] },
  });
});
