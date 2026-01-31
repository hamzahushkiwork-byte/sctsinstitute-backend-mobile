import { ok, fail } from '../../utils/response.js';
import Service from '../../models/Service.model.js';

/**
 * Get active services (public)
 * Returns only services where isActive=true, sorted by sortOrder asc, createdAt desc
 */
export async function getActiveServices(req, res) {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title description imageUrl slug sortOrder')
      .lean();
    
    return ok(res, services);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch services');
  }
}

/**
 * Get a single active service by slug (public)
 * Returns service only if isActive=true
 */
export async function getServiceBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return fail(res, 400, 'Slug is required');
    }
    
    const service = await Service.findOne({ 
      slug: slug.toLowerCase().trim(),
      isActive: true 
    }).lean();
    
    if (!service) {
      return fail(res, 404, 'Service not found');
    }
    
    return ok(res, service);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch service');
  }
}
