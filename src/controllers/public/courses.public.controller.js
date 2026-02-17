import { ok, fail } from '../../utils/response.js';
import Course from '../../models/Course.model.js';
import { toAbsoluteUrl } from '../../utils/url.js';
import config from '../../config/env.js';

const BASE_URL = config.baseUrl || '';
const SHORT_DESC_LENGTH = 160;

/**
 * Plain-text excerpt: strip HTML, take first N chars. Fallback to cardBody or null.
 */
function buildShortDescription(description, cardBody) {
  const source = (description && String(description).trim()) || (cardBody && String(cardBody).trim()) || '';
  if (!source) return null;
  const plain = source.replace(/<[^>]*>/g, '').trim();
  if (!plain) return null;
  return plain.length <= SHORT_DESC_LENGTH ? plain : plain.slice(0, SHORT_DESC_LENGTH).trim();
}

/**
 * availabilityStatus: "available" | "coming_soon" | "closed"
 */
function getAvailabilityStatus(isAvailable) {
  if (isAvailable === true) return 'available';
  return 'coming_soon';
}

/**
 * Build media object from course imageUrl; omit if no imageUrl.
 */
function buildMedia(imageUrl, title) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return undefined;
  const url = toAbsoluteUrl(imageUrl.trim(), BASE_URL);
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: title != null ? String(title) : '',
    width: null,
    height: null,
  };
}

/**
 * Build actions array for a course.
 */
function buildActions(slug, canRegister) {
  return [
    { type: 'view', label: 'View', url: `/courses/${slug || ''}`, enabled: true },
    { type: 'register', label: 'Register', url: '/course-registrations/register', enabled: !!canRegister },
  ];
}

/**
 * Build content object for single course (mobile-friendly structured content).
 * Additive only; does not replace description/cardBody.
 */
function buildContent(cardBody, shortDescription, description) {
  const summary = (cardBody && String(cardBody).trim()) || shortDescription || null;
  const sections = [
    { key: 'description', title: 'Description', body: (description != null && String(description)) || null },
  ];
  return { summary: summary || null, sections };
}

/**
 * Get active courses (public)
 * Returns only courses where isActive=true, sorted by sortOrder asc, createdAt desc.
 * Keeps all existing fields; adds optional mobile-friendly fields.
 */
export async function getActiveCourses(req, res) {
  try {
    const { status } = req.query;
    let query = { isActive: true };

    if (status === 'available') {
      query.isAvailable = true;
    } else if (status === 'coming-soon') {
      query.isAvailable = false;
    }

    const courses = await Course.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const canRegister = (c) => c.isAvailable === true && c.isActive === true;

    const list = courses.map((c) => {
      const isAvailable = c.isAvailable === true;
      const canReg = canRegister(c);
      const out = { ...c };
      out.shortDescription = buildShortDescription(c.description, c.cardBody);
      out.availabilityStatus = getAvailabilityStatus(c.isAvailable);
      out.canRegister = canReg;
      if (c.imageUrl && c.imageUrl.trim()) {
        out.media = buildMedia(c.imageUrl, c.title);
      }
      out.actions = buildActions(c.slug, canReg);
      return out;
    });

    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch courses');
  }
}

/**
 * Get a single active course by slug (public)
 * Returns course only if isActive=true.
 * Keeps all existing fields; adds optional mobile-friendly fields (shortDescription, availabilityStatus, canRegister, media, content, actions).
 */
export async function getCourseBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return fail(res, 400, 'Slug is required');
    }

    const course = await Course.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    })
      .lean();

    if (!course) {
      return fail(res, 404, 'Course not found');
    }

    const canReg = course.isAvailable === true && course.isActive === true;
    const shortDesc =
      (course.shortDescription && String(course.shortDescription).trim()) ||
      buildShortDescription(course.description, course.cardBody);

    const out = { ...course };
    out.shortDescription = shortDesc || null;
    out.availabilityStatus = getAvailabilityStatus(course.isAvailable);
    out.canRegister = canReg;
    if (course.imageUrl && String(course.imageUrl).trim()) {
      out.media = buildMedia(course.imageUrl, course.title);
    }
    out.content = buildContent(course.cardBody, out.shortDescription, course.description);
    out.actions = buildActions(course.slug, canReg);

    return ok(res, out);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course');
  }
}
