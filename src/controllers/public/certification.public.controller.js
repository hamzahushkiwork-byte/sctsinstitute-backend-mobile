import { ok, fail } from '../../utils/response.js';
import CertificationService from '../../models/CertificationService.model.js';
import { toAbsoluteUrl } from '../../utils/url.js';
import config from '../../config/env.js';

const BASE_URL = config.baseUrl || '';
const SHORT_DESC_LENGTH = 160;

/**
 * Plain-text excerpt from description (first N chars). Fallback null if missing.
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
 * Build media object from image URL. Omit if no imageUrl.
 */
function buildCertificationMedia(imageUrl, title) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return undefined;
  const url = toAbsoluteUrl(imageUrl.trim(), BASE_URL);
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: (title != null && String(title).trim()) || 'Certification',
    width: null,
    height: null,
  };
}

/**
 * Build ui object (order from sortOrder if present).
 */
function buildCertificationUi(sortOrder) {
  return { order: sortOrder ?? 0 };
}

/**
 * Build actions array when slug exists.
 */
function buildCertificationActions(slug) {
  if (slug == null || String(slug).trim() === '') return undefined;
  return [{ type: 'view', label: 'View', url: `/certification/${slug}`, enabled: true }];
}

/**
 * Build content object for single certification (mobile-friendly structured content).
 * Additive only; does not replace description.
 */
function buildCertificationContent(description) {
  const sections = [
    { key: 'description', title: 'Description', body: (description != null && String(description)) || null },
  ];
  return { sections };
}

/**
 * Get active certification services (public)
 * Returns only services where isActive=true, sorted by sortOrder asc, createdAt desc.
 * Keeps all existing fields; adds optional mobile-friendly fields (shortDescription, media, ui, actions).
 */
export async function getActiveCertificationServices(req, res) {
  try {
    const services = await CertificationService.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const list = services.map((s) => {
      const out = { ...s };
      out.shortDescription =
        (s.shortDescription != null && String(s.shortDescription).trim()) ||
        buildShortDescription(s.description) ||
        null;
      const imageUrl = s.cardImageUrl ?? s.heroImageUrl;
      if (imageUrl && String(imageUrl).trim()) {
        out.media = buildCertificationMedia(imageUrl, s.title);
      }
      out.ui = buildCertificationUi(s.sortOrder);
      if (s.slug != null && String(s.slug).trim() !== '') {
        out.actions = buildCertificationActions(s.slug);
      }
      return out;
    });

    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch certification services');
  }
}

/**
 * Get a single active certification service by slug (public)
 * Returns service only if isActive=true.
 * Keeps all existing fields; adds optional mobile-friendly fields (shortDescription, media, content, actions).
 */
export async function getCertificationServiceBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return fail(res, 400, 'Slug is required');
    }

    const service = await CertificationService.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).lean();

    if (!service) {
      return fail(res, 404, 'Certification service not found');
    }

    const out = { ...service };
    out.shortDescription =
      (service.shortDescription != null && String(service.shortDescription).trim()) ||
      buildShortDescription(service.description) ||
      null;
    const imageUrl = service.cardImageUrl ?? service.heroImageUrl;
    if (imageUrl && String(imageUrl).trim()) {
      out.media = buildCertificationMedia(imageUrl, service.title);
    }
    out.content = buildCertificationContent(service.description);
    if (service.slug != null && String(service.slug).trim() !== '') {
      out.actions = buildCertificationActions(service.slug);
    }

    return ok(res, out);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch certification service');
  }
}
