import express from 'express';
import * as partnersController from '../../controllers/admin/partners.controller.js';
import uploadPartnerLogo from '../../middlewares/uploadPartnerLogo.js';

const router = express.Router();

// GET /api/v1/admin/partners - List all partners
router.get('/partners', partnersController.listPartners);

// GET /api/v1/admin/partners/:id - Get partner by ID
router.get('/partners/:id', partnersController.getPartnerById);

// POST /api/v1/admin/partners - Create new partner
router.post('/partners', uploadPartnerLogo, partnersController.createPartner);

// PUT /api/v1/admin/partners/:id - Update partner
router.put('/partners/:id', uploadPartnerLogo, partnersController.updatePartner);

// DELETE /api/v1/admin/partners/:id - Delete partner
router.delete('/partners/:id', partnersController.deletePartner);

export default router;
