import express from 'express';
import * as certificationController from '../../controllers/admin/certification.admin.controller.js';
import uploadCertificationImage from '../../middlewares/uploadCertificationImage.js';

const router = express.Router();

// GET /api/v1/admin/certification - List all certification services
router.get('/certification', certificationController.listCertificationServices);

// GET /api/v1/admin/certification/:id - Get certification service by ID
router.get('/certification/:id', certificationController.getCertificationServiceById);

// POST /api/v1/admin/certification - Create new certification service
router.post('/certification', uploadCertificationImage, certificationController.createCertificationService);

// PUT /api/v1/admin/certification/:id - Update certification service
router.put('/certification/:id', uploadCertificationImage, certificationController.updateCertificationService);

// DELETE /api/v1/admin/certification/:id - Delete certification service
router.delete('/certification/:id', certificationController.deleteCertificationService);

// PATCH /api/v1/admin/certification/:id/active - Toggle certification service active status
router.patch('/certification/:id/active', certificationController.toggleCertificationServiceActive);

export default router;
