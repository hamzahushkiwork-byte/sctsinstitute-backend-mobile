import express from 'express';
import * as coursesController from '../../controllers/courses.controller.js';

const router = express.Router();

router.get('/', coursesController.getCourses);
router.get('/:slug', coursesController.getCourseBySlug);

export default router;



