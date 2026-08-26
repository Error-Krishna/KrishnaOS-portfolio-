import { Router, type Request, type Response } from 'express';
import type {
  ApiResponse,
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
} from '@krishnaos/shared-types';
import { UdhyogSaathiService } from '../../services/projects/adapters/udhyog-saathi/udhyog-saathi.service.js';

export const udhyogSaathiRouter = Router();

const service = new UdhyogSaathiService();

udhyogSaathiRouter.get(
  '/dashboard',
  (_req, res: Response<ApiResponse<UdhyogSaathiDemoDashboard>>) => {
    res.json({
      success: true,
      data: service.getDashboard(),
    });
  },
);

udhyogSaathiRouter.get(
  '/bills',
  (_req, res: Response<ApiResponse<UdhyogSaathiDemoBill[]>>) => {
    res.json({
      success: true,
      data: service.getBills(),
    });
  },
);

udhyogSaathiRouter.post(
  '/bills',
  (
    req: Request<unknown, unknown, UdhyogSaathiCreateDemoBillPayload>,
    res: Response<ApiResponse<UdhyogSaathiDemoBill>>,
  ) => {
    const bill = service.createBill(req.body);

    res.status(201).json({
      success: true,
      data: bill,
    });
  },
);

udhyogSaathiRouter.get(
  '/inventory',
  (_req, res: Response<ApiResponse<UdhyogSaathiDemoInventoryItem[]>>) => {
    res.json({
      success: true,
      data: service.getInventory(),
    });
  },
);
