import express from 'express';
import * as homeController from '../../controllers/home.controller.js';

const router = express.Router();

router.get('/hero-slides', homeController.getHeroSlides);
router.get('/trending-courses', homeController.getTrendingCourses);
router.get('/mobile-slides', homeController.getMobileSlides);

export default router;



