import express from 'express';
import * as contactController from '../../controllers/contact.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { contactSchema } from '../../validators/contact.validator.js';

const router = express.Router();

router.post('/', validate(contactSchema), contactController.submitContact);

export default router;



