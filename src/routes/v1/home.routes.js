import express from 'express';
import * as homeController from '../../controllers/home.controller.js';

const router = express.Router();

router.get('/hero-slides', homeController.getHeroSlides);

export default router;



