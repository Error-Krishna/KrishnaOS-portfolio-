import { Router, type Request, type Response } from 'express';
import type {
  ApiResponse,
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
  UdhyogSaathiUpdateDemoBillPayload,
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

udhyogSaathiRouter.put(
  '/bills/:id',
  (
    req: Request<
      { id: string },
      unknown,
      UdhyogSaathiUpdateDemoBillPayload
    >,
    res: Response<ApiResponse<UdhyogSaathiDemoBill>>,
  ) => {
    const bill = service.updateBill(req.params.id, req.body);

    if (!bill) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Bill not found',
          code: 'DEMO_BILL_NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: bill,
    });
  },
);

udhyogSaathiRouter.delete(
  '/bills/:id',
  (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ id: string }>>,
  ) => {
    const deleted = service.deleteBill(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Bill not found',
          code: 'DEMO_BILL_NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: req.params.id,
      },
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
