import express from 'express';
import * as coursesController from '../../controllers/admin/courses.admin.controller.js';
import uploadCourseImage from '../../middlewares/uploadCourseImage.js';

const router = express.Router();

// GET /api/v1/admin/courses - List all courses
router.get('/courses', coursesController.listCourses);

// GET /api/v1/admin/courses/:id - Get course by ID
router.get('/courses/:id', coursesController.getCourseById);

// POST /api/v1/admin/courses - Create new course
router.post('/courses', uploadCourseImage, coursesController.createCourse);

// PUT /api/v1/admin/courses/:id - Update course
router.put('/courses/:id', uploadCourseImage, coursesController.updateCourse);

// DELETE /api/v1/admin/courses/:id - Delete course
router.delete('/courses/:id', coursesController.deleteCourse);

export default router;
