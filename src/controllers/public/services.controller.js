import { ok, fail } from '../../utils/response.js';
import Service from '../../models/Service.model.js';
import { toAbsoluteUrl } from '../../utils/url.js';
import config from '../../config/env.js';

const BASE_URL = config.baseUrl || '';
const SHORT_DESC_LENGTH = 160;

/**
 * Plain-text excerpt from description (first N chars). Strip HTML if present; else keep as-is.
 */
function buildShortDescription(description) {
  if (description == null || String(description).trim() === '') return null;
  const str = String(description).trim();
  const plain = str.replace(/<[^>]*>/g, '').trim();
  const source = plain || str;
  if (!source) return null;
  return source.length <= SHORT_DESC_LENGTH ? source : source.slice(0, SHORT_DESC_LENGTH).trim();
}

/**
 * Build media object (url, thumbUrl, mediumUrl, alt, width, height). Omit if no imageUrl.
 */
function buildServiceMedia(imageUrl, title) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return undefined;
  const url = toAbsoluteUrl(imageUrl.trim(), BASE_URL);
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: (title != null && String(title).trim()) || 'Service',
    width: null,
    height: null,
  };
}

/**
 * Build ui object for mobile.
 */
function buildServiceUi(sortOrder) {
  return {
    order: sortOrder ?? 0,
    isFeatured: false,
  };
}

/**
 * Build actions array for a service.
 */
function buildServiceActions(slug) {
  return [{ type: 'view', label: 'View', url: `/services/${slug || ''}`, enabled: true }];
}

/**
 * Get active services (public)
 * Returns only services where isActive=true, sorted by sortOrder asc, createdAt desc.
 * Keeps all existing fields; adds optional mobile-friendly fields (shortDescription, media, innerMedia, ui, actions).
 */
export async function getActiveServices(req, res) {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const list = services.map((s) => {
      const out = { ...s };
      out.shortDescription = buildShortDescription(s.description);
      if (s.imageUrl && String(s.imageUrl).trim()) {
        out.media = buildServiceMedia(s.imageUrl, s.title);
      }
      if (s.innerImageUrl && String(s.innerImageUrl).trim()) {
        out.innerMedia = buildServiceMedia(s.innerImageUrl, s.title);
      }
      out.ui = buildServiceUi(s.sortOrder);
      out.actions = buildServiceActions(s.slug);
      return out;
    });

    return ok(res, list);
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
