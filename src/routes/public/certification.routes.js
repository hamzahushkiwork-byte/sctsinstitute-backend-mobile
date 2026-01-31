import express from 'express';
import * as certificationController from '../../controllers/public/certification.public.controller.js';

const router = express.Router();

// GET /api/v1/certification - Get active certification services (public)
router.get('/', certificationController.getActiveCertificationServices);

// GET /api/v1/certification/:slug - Get active certification service by slug (public)
router.get('/:slug', certificationController.getCertificationServiceBySlug);

export default router;
