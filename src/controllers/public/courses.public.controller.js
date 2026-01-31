import { ok, fail } from '../../utils/response.js';
import Course from '../../models/Course.model.js';

/**
 * Get active courses (public)
 * Returns only courses where isActive=true, sorted by sortOrder asc, createdAt desc
 * Response fields: title, slug, cardBody, imageUrl
 */
export async function getActiveCourses(req, res) {
  try {
    const courses = await Course.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('title slug cardBody imageUrl')
      .lean();
    
    return ok(res, courses);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch courses');
  }
}

/**
 * Get a single active course by slug (public)
 * Returns course only if isActive=true
 * Response fields: title, slug, cardBody, description, imageUrl
 */
export async function getCourseBySlug(req, res) {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return fail(res, 400, 'Slug is required');
    }
    
    const course = await Course.findOne({ 
      slug: slug.toLowerCase().trim(),
      isActive: true 
    })
    .select('title slug cardBody description imageUrl')
    .lean();
    
    if (!course) {
      return fail(res, 404, 'Course not found');
    }
    
    return ok(res, course);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course');
  }
}
