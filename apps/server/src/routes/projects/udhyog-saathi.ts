import { Router, type Request, type Response } from 'express';
import type {
  ApiResponse,
  UdhyogSaathiCreateDemoBillPayload,
  UdhyogSaathiDemoBill,
  UdhyogSaathiDemoDashboard,
  UdhyogSaathiDemoInventoryItem,
  UdhyogSaathiCreateDemoInventoryItemPayload,
  UdhyogSaathiUpdateDemoInventoryItemPayload,
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

udhyogSaathiRouter.post(
  '/inventory',
  (
    req: Request<unknown, unknown, UdhyogSaathiCreateDemoInventoryItemPayload>,
    res: Response<ApiResponse<UdhyogSaathiDemoInventoryItem>>,
  ) => {
    const item = service.createInventoryItem(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  },
);

udhyogSaathiRouter.put(
  '/inventory/:id',
  (
    req: Request<
      { id: string },
      unknown,
      UdhyogSaathiUpdateDemoInventoryItemPayload
    >,
    res: Response<ApiResponse<UdhyogSaathiDemoInventoryItem>>,
  ) => {
    const item = service.updateInventoryItem(req.params.id, req.body);

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Inventory item not found',
          code: 'DEMO_INVENTORY_NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  },
);

udhyogSaathiRouter.delete(
  '/inventory/:id',
  (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ deleted: true }>>,
  ) => {
    const deleted = service.deleteInventoryItem(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Inventory item not found',
          code: 'DEMO_INVENTORY_NOT_FOUND',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        deleted: true,
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
