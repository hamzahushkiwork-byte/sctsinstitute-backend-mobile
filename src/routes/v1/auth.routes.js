import express from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { registerRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { loginSchema, signupSchema } from '../../validators/auth.validator.js';

const router = express.Router();

// Apply rate limiting to signup route
router.post('/signup', registerRateLimiter, validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
