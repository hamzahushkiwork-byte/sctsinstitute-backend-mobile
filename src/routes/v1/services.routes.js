import express from 'express';
import * as servicesController from '../../controllers/services.controller.js';

const router = express.Router();

router.get('/', servicesController.getServices);
router.get('/:slug', servicesController.getServiceBySlug);

export default router;



