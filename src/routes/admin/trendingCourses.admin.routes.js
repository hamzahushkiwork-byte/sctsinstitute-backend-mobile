import express from 'express';
import * as trendingCoursesController from '../../controllers/admin/trendingCourses.admin.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createTrendingCourseSchema,
  updateTrendingCourseSchema,
} from '../../validators/trendingCourse.validator.js';

const router = express.Router();

router.get('/trending-courses', trendingCoursesController.listTrendingCourses);
router.get('/trending-courses/:id', trendingCoursesController.getTrendingCourseById);
router.post(
  '/trending-courses',
  validate(createTrendingCourseSchema),
  trendingCoursesController.createTrendingCourse
);
router.put(
  '/trending-courses/:id',
  validate(updateTrendingCourseSchema),
  trendingCoursesController.updateTrendingCourse
);
router.delete('/trending-courses/:id', trendingCoursesController.deleteTrendingCourse);

export default router;
