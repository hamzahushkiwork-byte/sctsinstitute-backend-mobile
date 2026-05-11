import multer from 'multer';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from '../config/env.js';

const baseUploadsDir = path.join(process.cwd(), config.uploadDir || 'uploads');
const mobileSlidesDir = path.join(baseUploadsDir, 'mobile-slides');

if (!existsSync(mobileSlidesDir)) {
  mkdirSync(mobileSlidesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mobileSlidesDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    cb(null, `${timestamp}-${random}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (png, jpg, jpeg, webp, gif)'), false);
  }
};

const multerInstance = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMobileSlideImage = (req, res, next) => {
  multerInstance.single('images')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field')) {
        return next();
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed. Use field "images" (png/jpg/webp/gif, <=10MB).',
      });
    }
    next();
  });
};

export default uploadMobileSlideImage;
