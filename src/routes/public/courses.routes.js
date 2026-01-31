import express from 'express';
import * as coursesController from '../../controllers/public/courses.public.controller.js';

const router = express.Router();

// GET /api/v1/courses - Get active courses (public)
router.get('/', coursesController.getActiveCourses);

// GET /api/v1/courses/:slug - Get active course by slug (public)
router.get('/:slug', coursesController.getCourseBySlug);

export default router;
