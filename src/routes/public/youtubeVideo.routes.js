import express from 'express';
import * as youtubeVideoController from '../../controllers/public/youtubeVideo.public.controller.js';

const router = express.Router();

// GET /api/v1/youtube-videos - Get active youtube videos (public)
router.get('/', youtubeVideoController.getActiveYoutubeVideos);

export default router;
