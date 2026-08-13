import { Router, type Response } from 'express';
import mongoose from 'mongoose';
import type { ApiResponse } from '@krishnaos/shared-types';

export const healthRouter = Router();

const DB_STATE_NAMES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

healthRouter.get('/', (_req, res: Response<ApiResponse<{ status: 'ok'; db: string }>>) => {
  const dbState = DB_STATE_NAMES[mongoose.connection.readyState] ?? 'unknown';

  res.json({
    success: true,
    data: { status: 'ok', db: dbState },
  });
});
