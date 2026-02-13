import express from 'express';
import homeRoutes from './home.routes.js';
import servicesRoutes from './services.routes.js';
import publicServicesRoutes from '../public/services.routes.js';
import publicCertificationRoutes from '../public/certification.routes.js';
import publicCoursesRoutes from '../public/courses.routes.js';
import coursesRoutes from './courses.routes.js';
import partnersRoutes from './partners.routes.js';
import pagesRoutes from './pages.routes.js';
import contactRoutes from './contact.routes.js';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import courseRegistrationRoutes from './courseRegistration.routes.js';
import testRoutes from './test.routes.js';
import { ok } from '../../utils/response.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return ok(res, null, 'API is running');
});

// Mount route modules
router.use('/home', homeRoutes);
router.use('/services', publicServicesRoutes); // Public active services endpoint
router.use('/certification', publicCertificationRoutes); // Public active certification endpoint
router.use('/courses', publicCoursesRoutes); // Public active courses endpoint
router.use('/partners', partnersRoutes);
router.use('/pages', pagesRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/course-registrations', courseRegistrationRoutes);
router.use('/tests', testRoutes);

export default router;



