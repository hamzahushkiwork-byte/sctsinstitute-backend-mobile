import express from 'express';
import * as servicesController from '../../controllers/public/services.controller.js';

const router = express.Router();

// GET /api/v1/services - Get active services (public)
router.get('/', servicesController.getActiveServices);

// GET /api/v1/services/:slug - Get active service by slug (public)
router.get('/:slug', servicesController.getServiceBySlug);

export default router;
