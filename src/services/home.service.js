import HeroSlide from '../models/HeroSlide.model.js';

export async function getHeroSlides() {
  return await HeroSlide.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
}
