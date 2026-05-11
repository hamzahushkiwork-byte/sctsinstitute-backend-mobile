import mongoose from 'mongoose';
import { ok, fail } from '../../utils/response.js';
import TrendingCourse from '../../models/TrendingCourse.model.js';
import Course from '../../models/Course.model.js';

const populateCourse = { path: 'courseId', model: 'Course' };

function isDuplicateKey(err) {
  return err && (err.code === 11000 || err.code === 11001);
}

/**
 * GET /api/v1/admin/trending-courses
 */
export async function listTrendingCourses(req, res) {
  try {
    const rows = await TrendingCourse.find().populate(populateCourse).sort({ order: 1, createdAt: -1 }).lean();
    return ok(res, rows);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to list trending courses');
  }
}

/**
 * GET /api/v1/admin/trending-courses/:id
 */
export async function getTrendingCourseById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, 400, 'Invalid id');
    }
    const row = await TrendingCourse.findById(id).populate(populateCourse).lean();
    if (!row) {
      return fail(res, 404, 'Trending course not found');
    }
    return ok(res, row);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch trending course');
  }
}

/**
 * POST /api/v1/admin/trending-courses
 */
export async function createTrendingCourse(req, res) {
  try {
    const { courseId, order, price, isActive } = req.body;

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return fail(res, 404, 'Course not found');
    }

    const existing = await TrendingCourse.findOne({ courseId }).lean();
    if (existing) {
      return fail(res, 409, 'This course is already in trending');
    }

    const doc = await TrendingCourse.create({
      courseId,
      order: order ?? 0,
      price: price === undefined ? null : price,
      isActive: isActive !== false,
    });
    const row = await TrendingCourse.findById(doc._id).populate(populateCourse).lean();
    return ok(res, row, 'Trending course added', null, 201);
  } catch (error) {
    if (isDuplicateKey(error)) {
      return fail(res, 409, 'This course is already in trending');
    }
    return fail(res, 500, error.message || 'Failed to create trending course');
  }
}

/**
 * PUT /api/v1/admin/trending-courses/:id
 */
export async function updateTrendingCourse(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, 400, 'Invalid id');
    }

    const payload = { ...req.body };
    if (payload.courseId != null) {
      if (!mongoose.Types.ObjectId.isValid(payload.courseId)) {
        return fail(res, 400, 'Invalid courseId');
      }
      const course = await Course.findById(payload.courseId).lean();
      if (!course) {
        return fail(res, 404, 'Course not found');
      }
      const other = await TrendingCourse.findOne({
        courseId: payload.courseId,
        _id: { $ne: id },
      }).lean();
      if (other) {
        return fail(res, 409, 'That course is already trending in another row');
      }
    }

    const row = await TrendingCourse.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true })
      .populate(populateCourse)
      .lean();

    if (!row) {
      return fail(res, 404, 'Trending course not found');
    }
    return ok(res, row, 'Trending course updated');
  } catch (error) {
    if (isDuplicateKey(error)) {
      return fail(res, 409, 'Duplicate course in trending');
    }
    return fail(res, 500, error.message || 'Failed to update trending course');
  }
}

/**
 * DELETE /api/v1/admin/trending-courses/:id
 */
export async function deleteTrendingCourse(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return fail(res, 400, 'Invalid id');
    }
    const deleted = await TrendingCourse.findByIdAndDelete(id).lean();
    if (!deleted) {
      return fail(res, 404, 'Trending course not found');
    }
    return ok(res, deleted, 'Trending course removed');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete trending course');
  }
}
