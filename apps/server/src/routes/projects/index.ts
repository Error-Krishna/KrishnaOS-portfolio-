import { Router, type Response } from 'express';
import type {
  ApiResponse,
  ProjectCatalog,
} from '@krishnaos/shared-types';
import { ProjectCatalogService } from '../../services/projects/project-catalog.service.js';

export const projectsRouter = Router();

const catalogService = new ProjectCatalogService();

projectsRouter.get(
  '/',
  async (_req, res: Response<ApiResponse<ProjectCatalog>>) => {
    try {
      const catalog = await catalogService.buildCatalog();

      res.json({
        success: true,
        data: catalog,
      });
    } catch (error) {
      console.error('[projects] Failed to build project catalog:', error);

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to load project catalog',
          code: 'PROJECT_CATALOG_ERROR',
        },
      });
    }
  },
);
