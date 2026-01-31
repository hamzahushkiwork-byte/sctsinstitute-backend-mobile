import Course from '../models/Course.model.js';

export async function getCourses() {
  return await Course.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getCourseBySlug(slug) {
  return await Course.findOne({ slug, isActive: true }).lean();
}

export async function getAllCourses() {
  return await Course.find().sort({ createdAt: -1 }).lean();
}

export async function getCourseById(id) {
  return await Course.findById(id).lean();
}

export async function createCourse(data) {
  const course = new Course(data);
  return await course.save();
}

export async function updateCourse(id, data) {
  return await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function deleteCourse(id) {
  return await Course.findByIdAndDelete(id).lean();
}
