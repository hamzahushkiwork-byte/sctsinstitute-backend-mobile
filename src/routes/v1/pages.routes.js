import express from 'express';
import * as pagesController from '../../controllers/pages.controller.js';

const router = express.Router();

router.get('/:key', pagesController.getPageContent);

export default router;



