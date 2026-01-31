import { ok, fail } from '../utils/response.js';
import * as homeService from '../services/home.service.js';

export async function getHeroSlides(req, res) {
  try {
    const slides = await homeService.getHeroSlides();
    return ok(res, slides);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch hero slides');
  }
}
