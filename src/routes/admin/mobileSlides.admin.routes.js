import express from 'express';
import * as mobileSlidesController from '../../controllers/admin/mobileSlides.admin.controller.js';
import uploadMobileSlideImage from '../../middlewares/uploadMobileSlideImage.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createMobileSlideSchema,
  updateMobileSlideSchema,
} from '../../validators/mobileSlide.validator.js';

const router = express.Router();

router.get('/mobile-slides', mobileSlidesController.listMobileSlides);
router.get('/mobile-slides/:id', mobileSlidesController.getMobileSlideById);

router.post(
  '/mobile-slides',
  uploadMobileSlideImage,
  validate(createMobileSlideSchema),
  mobileSlidesController.createMobileSlide
);

router.put(
  '/mobile-slides/:id',
  uploadMobileSlideImage,
  validate(updateMobileSlideSchema),
  mobileSlidesController.updateMobileSlide
);

router.delete('/mobile-slides/:id', mobileSlidesController.deleteMobileSlide);

export default router;
