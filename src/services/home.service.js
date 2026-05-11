import HeroSlide from '../models/HeroSlide.model.js';
import TrendingCourse from '../models/TrendingCourse.model.js';
import MobileSlide from '../models/MobileSlide.model.js';

export async function getHeroSlides() {
  return await HeroSlide.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
}

/**
 * Active trending rows with active courses only (populate match drops inactive courses).
 */
export async function getTrendingCoursesForPublic() {
  return await TrendingCourse.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate({
      path: 'courseId',
      match: { isActive: true },
    })
    .lean();
}

/**
 * Active mobile slides with link targets populated.
 */
export async function getMobileSlidesForPublic() {
  return await MobileSlide.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .populate([
      { path: 'courseId', match: { isActive: true }, select: 'title slug imageUrl price' },
      { path: 'certificateId', match: { isActive: true }, select: 'title slug cardImageUrl' },
    ])
    .lean();
}
