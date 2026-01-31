import express from 'express';
import * as courseRegistrationController from '../../controllers/courseRegistration.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public route - requires authentication
router.post('/register', authMiddleware, courseRegistrationController.registerForCourse);

// User route - get their own registrations
router.get('/my-registrations', authMiddleware, courseRegistrationController.getUserRegistrations);
router.get('/course/:courseId', authMiddleware, courseRegistrationController.getUserCourseRegistration);

// Admin routes
router.get('/admin', authMiddleware, courseRegistrationController.getAllRegistrations);
router.get('/admin/course/:courseId', authMiddleware, courseRegistrationController.getRegistrationsByCourse);
router.put('/admin/:id/status', authMiddleware, courseRegistrationController.updateRegistrationStatus);

export default router;
