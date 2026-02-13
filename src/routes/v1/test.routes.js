import express from 'express';
import * as testController from '../../controllers/test.controller.js';

const router = express.Router();

// Public - get active tests
router.get('/', testController.getActiveTests);

export default router;
