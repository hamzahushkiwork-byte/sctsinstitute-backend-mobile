import express from 'express';
import * as cartController from '../../controllers/cart.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All cart operations require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/', cartController.addItem);
router.delete('/:courseId', cartController.removeItem);
router.post('/clear', cartController.clearCart);
router.post('/checkout', cartController.checkout);

export default router;
