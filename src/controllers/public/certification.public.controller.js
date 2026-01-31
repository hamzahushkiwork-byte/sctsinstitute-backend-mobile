import { ok, fail } from '../../utils/response.js';
import CertificationService from '../../models/CertificationService.model.js';

/**
 * Get active certification services (public)
 * Returns only services where isActive=true, sorted by sortOrder asc, createdAt desc
 * Response fields: title, slug, shortDescription, cardImageUrl
 */
export async function getActiveCertificationServices(req, res) {
  try {
    const services = await CertificationService.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title slug shortDescription cardImageUrl')
      .lean();
    
    return ok(res, services);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch certification services');
  }
}

/**
 * Get a single active certification service by slug (public)
 * Returns service only if isActive=true
 * Response fields: title, heroSubtitle, description, heroImageUrl, innerImageUrl
 */
export async function getCertificationServiceBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return fail(res, 400, 'Slug is required');
    }
    
    const service = await CertificationService.findOne({ 
      slug: slug.toLowerCase().trim(),
      isActive: true 
    })
    .select('title heroSubtitle description heroImageUrl innerImageUrl')
    .lean();
    
    if (!service) {
      return fail(res, 404, 'Certification service not found');
    }
    
    return ok(res, service);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch certification service');
  }
}
