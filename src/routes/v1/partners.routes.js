import express from 'express';
import * as partnersController from '../../controllers/partners.controller.js';

const router = express.Router();

// Public endpoint - returns only active partners sorted by sortOrder
router.get('/public', partnersController.getPartners);

// Legacy endpoint (keep for backward compatibility)
router.get('/', partnersController.getPartners);

export default router;



