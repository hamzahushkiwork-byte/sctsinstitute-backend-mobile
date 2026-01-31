import { ok, fail } from '../utils/response.js';
import * as coursesService from '../services/courses.service.js';

export async function getCourses(req, res) {
  try {
    const courses = await coursesService.getCourses();
    return ok(res, courses);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch courses');
  }
}

export async function getCourseBySlug(req, res) {
  try {
    const { slug } = req.params;
    const course = await coursesService.getCourseBySlug(slug);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }
    return ok(res, course);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course');
  }
}
