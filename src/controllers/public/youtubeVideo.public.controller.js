import { ok, fail } from '../../utils/response.js';
import YoutubeVideo from '../../models/YoutubeVideo.model.js';

/**
 * Get active youtube videos (public)
 * Returns only videos where isActive=true, sorted by sortOrder asc, createdAt desc
 */
export async function getActiveYoutubeVideos(req, res) {
  try {
    const videos = await YoutubeVideo.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
    
    return ok(res, videos);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch youtube videos');
  }
}
