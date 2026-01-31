import express from 'express';
import * as servicesController from '../../controllers/admin/services.controller.js';
import uploadServiceImage from '../../middlewares/upload.serviceImage.js';

const router = express.Router();

// GET /api/v1/admin/services - List all services
router.get('/services', servicesController.listServices);

// GET /api/v1/admin/services/:id - Get service by ID
router.get('/services/:id', servicesController.getServiceById);

// POST /api/v1/admin/services - Create new service
router.post('/services', uploadServiceImage, servicesController.createService);

// PUT /api/v1/admin/services/:id - Update service
router.put('/services/:id', uploadServiceImage, servicesController.updateService);

// DELETE /api/v1/admin/services/:id - Delete service
router.delete('/services/:id', servicesController.deleteService);

// PATCH /api/v1/admin/services/:id/active - Toggle service active status
router.patch('/services/:id/active', servicesController.toggleServiceActive);

export default router;
