import path from 'path';
import { ok, fail } from '../../utils/response.js';
import Course from '../../models/Course.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import config from '../../config/env.js';
import { slugify, generateUniqueSlug } from '../../utils/slug.js';
import { toAbsoluteUrl } from '../../utils/url.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = config.baseUrl || '';

function absoluteUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return toAbsoluteUrl(url.trim(), BASE_URL);
}

/**
 * Build admin/mobile-friendly optional fields for admin courses list. Keeps data as array.
 */
function buildAdminCoursesData(courses) {
  if (!Array.isArray(courses)) return courses;

  const SHORT_DESC_LENGTH = 160;

  return courses.map((c) => {
    if (!c || typeof c !== 'object') return c;

    const id = c._id != null ? String(c._id) : c.id != null ? String(c.id) : null;
    const hasId = !!id;
    const baseUrl = hasId ? `/admin/courses/${id}` : null;
    const toggleUrl = hasId ? `/admin/courses/${id}/toggle-availability` : null;

    const out = { ...c };

    const desc = c.description != null ? String(c.description).trim() : '';
    const card = c.cardBody != null ? String(c.cardBody).trim() : '';
    out.shortDescription =
      desc.length > 0
        ? desc.slice(0, SHORT_DESC_LENGTH)
        : card.length > 0
          ? card.slice(0, SHORT_DESC_LENGTH)
          : null;

    if (c.imageUrl != null && String(c.imageUrl).trim() !== '') {
      out.media = {
        url: absoluteUrl(c.imageUrl),
        alt: c.title != null && String(c.title).trim() !== '' ? c.title : 'Course',
      };
    }

    const isAvail = c.isAvailable === true;
    out.availabilityStatus = isAvail ? 'available' : 'coming_soon';

    out.canRegister = c.isActive === true && c.isAvailable === true;

    out.adminUi = {
      canEdit: true,
      canDelete: true,
      canToggleAvailability: true,
    };

    out.actions = [
      { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
      { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
      { type: 'toggle_availability', label: 'Toggle Availability', url: toggleUrl, enabled: hasId },
      { type: 'delete', label: 'Delete', url: baseUrl, enabled: hasId },
    ];

    return out;
  });
}

/**
 * Build admin/mobile-friendly optional fields for single course (GET by id). Keeps data as object.
 */
function buildCourseByIdData(course) {
  if (!course || typeof course !== 'object') return course;

  const SHORT_DESC_LENGTH = 160;
  const id = course._id != null ? String(course._id) : course.id != null ? String(course.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/courses/${id}` : null;
  const toggleUrl = hasId ? `/admin/courses/${id}/toggle-availability` : null;

  const out = { ...course };

  const desc = course.description != null ? String(course.description).trim() : '';
  const card = course.cardBody != null ? String(course.cardBody).trim() : '';
  out.shortDescription =
    desc.length > 0
      ? desc.slice(0, SHORT_DESC_LENGTH)
      : card.length > 0
        ? card.slice(0, SHORT_DESC_LENGTH)
        : null;

  if (course.imageUrl != null && String(course.imageUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(course.imageUrl),
      alt: course.title != null && String(course.title).trim() !== '' ? course.title : 'Course',
    };
  }

  out.availabilityStatus = course.isAvailable === true ? 'available' : 'coming_soon';
  out.canRegister = course.isActive === true && course.isAvailable === true;

  out.content = {
    summary: card || out.shortDescription || null,
    sections: [
      { key: 'description', title: 'Description', body: course.description ?? null },
    ],
  };

  out.adminUi = {
    canEdit: true,
    canDelete: true,
    canToggleAvailability: true,
  };

  out.actions = [
    { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
    { type: 'toggle_availability', label: 'Toggle Availability', url: toggleUrl, enabled: hasId },
    { type: 'delete', label: 'Delete', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/courses', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for created course response (POST). Keeps data as object.
 */
function buildCreateCourseData(course) {
  if (!course || typeof course !== 'object') return course;

  const plain =
    typeof course.toObject === 'function' ? course.toObject() : { ...course };
  const SHORT_DESC_LENGTH = 160;
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/courses/${id}` : null;
  const toggleUrl = hasId ? `/admin/courses/${id}/toggle-availability` : null;

  const out = { ...plain };

  const desc = plain.description != null ? String(plain.description).trim() : '';
  const card = plain.cardBody != null ? String(plain.cardBody).trim() : '';
  out.shortDescription =
    desc.length > 0
      ? desc.slice(0, SHORT_DESC_LENGTH)
      : card.length > 0
        ? card.slice(0, SHORT_DESC_LENGTH)
        : null;

  if (plain.imageUrl != null && String(plain.imageUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(plain.imageUrl),
      alt: plain.title != null && String(plain.title).trim() !== '' ? plain.title : 'Course',
    };
  }

  out.availabilityStatus = plain.isAvailable === true ? 'available' : 'coming_soon';
  out.canRegister = plain.isActive === true && plain.isAvailable === true;

  out.adminUi = {
    canEdit: true,
    canDelete: true,
    canToggleAvailability: true,
  };

  out.actions = [
    { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
    { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
    { type: 'toggle_availability', label: 'Toggle Availability', url: toggleUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/courses', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for updated course response (PUT). Keeps data as object.
 */
function buildUpdateCourseData(course) {
  if (!course || typeof course !== 'object') return course;

  const plain =
    typeof course.toObject === 'function' ? course.toObject() : { ...course };
  const SHORT_DESC_LENGTH = 160;
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/courses/${id}` : null;

  const out = { ...plain };

  const desc = plain.description != null ? String(plain.description).trim() : '';
  const card = plain.cardBody != null ? String(plain.cardBody).trim() : '';
  out.shortDescription =
    desc.length > 0
      ? desc.slice(0, SHORT_DESC_LENGTH)
      : card.length > 0
        ? card.slice(0, SHORT_DESC_LENGTH)
        : null;

  if (plain.imageUrl != null && String(plain.imageUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(plain.imageUrl),
      alt: plain.title != null && String(plain.title).trim() !== '' ? plain.title : 'Course',
    };
  }

  out.availabilityStatus = plain.isAvailable === true ? 'available' : 'coming_soon';
  out.canRegister = plain.isActive === true && plain.isAvailable === true;

  out.adminUi = {
    canEdit: true,
    canDelete: true,
    canToggleAvailability: true,
  };

  out.actions = [
    { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/courses', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for toggle-availability response (PATCH). Keeps data as object.
 */
function buildToggleCourseAvailabilityData(course) {
  if (!course || typeof course !== 'object') return course;

  const plain =
    typeof course.toObject === 'function' ? course.toObject() : { ...course };
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/courses/${id}` : null;

  const toggledAt =
    plain.updatedAt != null
      ? plain.updatedAt instanceof Date
        ? plain.updatedAt.toISOString()
        : plain.updatedAt
      : new Date().toISOString();

  const isAvailableVal = plain.isAvailable !== undefined ? plain.isAvailable : null;
  const availabilityLabel =
    isAvailableVal === true ? 'Available' : isAvailableVal === false ? 'Unavailable' : 'Unknown';

  const toggleMeta = {
    toggledAt,
    availabilityLabel,
    isAvailable: isAvailableVal,
  };

  const availabilityStatus = plain.isAvailable === true ? 'available' : 'coming_soon';
  const canRegister = plain.isActive === true && plain.isAvailable === true;

  const actions = [
    { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/courses', enabled: true },
  ];

  return { ...plain, toggleMeta, availabilityStatus, canRegister, actions };
}

/**
 * List all courses (admin)
 */
export async function listCourses(req, res) {
  try {
    const { status } = req.query;
    let query = {};

    if (status === 'available') {
      query.isAvailable = true;
    } else if (status === 'coming-soon') {
      query.isAvailable = false;
    }

    // Admin still sees everything by default unless filtered
    const courses = await Course.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    const data = buildAdminCoursesData(courses);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch courses');
  }
}

/**
 * Get course by ID (admin)
 */
export async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();

    if (!course) {
      return fail(res, 404, 'Course not found');
    }

    const data = buildCourseByIdData(course);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course');
  }
}

/**
 * Create a new course
 * Requires: title
 * Optional: slug, cardBody, description, sortOrder, isActive, image
 */
export async function createCourse(req, res) {
  try {
    // Debug logs
    console.log('[createCourse] Content-Type:', req.headers['content-type']);
    console.log('[createCourse] req.body:', req.body);
    console.log('[createCourse] req.file:', req.file);

    // Extract fields from FormData
    const title = String(req.body.title || '').trim();
    const slug = String(req.body.slug || '').trim();
    const cardBody = String(req.body.cardBody || '').trim();
    const description = String(req.body.description || '').trim();
    const sortOrder = Number(req.body.sortOrder ?? 0);
    const isActive = req.body.isActive === 'true' || req.body.isActive === true || req.body.isActive === undefined;
    const isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true || req.body.isAvailable === undefined;

    // Validate required fields
    if (!title) {
      return fail(res, 400, 'title is required');
    }

    // Handle file upload (using req.file from multer.single())
    const imageFile = req.file;

    // Build imageUrl from uploaded file (if present)
    const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : '';

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      const baseSlug = slugify(title);
      if (!baseSlug) {
        return fail(res, 400, 'Unable to generate slug from title');
      }

      // Check if slug exists and generate unique one
      const checkSlugExists = async (slugToCheck, excludeId) => {
        const query = { slug: slugToCheck };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Course.findOne(query);
        return !!existing;
      };

      finalSlug = await generateUniqueSlug(baseSlug, checkSlugExists);
    } else {
      // Validate provided slug is unique
      const existing = await Course.findOne({ slug: finalSlug.toLowerCase() });
      if (existing) {
        return fail(res, 400, 'A course with this slug already exists');
      }
      finalSlug = finalSlug.toLowerCase();
    }

    // Create course - include all fields (empty strings are fine per schema defaults)
    const courseData = {
      title,
      slug: finalSlug,
      cardBody: cardBody || '',
      description: description || '',
      sortOrder,
      isActive,
      isAvailable,
    };

    // Only add imageUrl if we have a file
    if (imageUrl) {
      courseData.imageUrl = imageUrl;
    }

    console.log('[createCourse] Course data to create:', courseData);

    const course = await Course.create(courseData);

    const data = buildCreateCourseData(course);
    return ok(res, data, 'Course created successfully', null, 201);
  } catch (error) {
    console.error('[createCourse] Error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(err => err.message).join(', ');
      return fail(res, 400, `Course validation failed: ${validationErrors}`);
    }

    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return fail(res, 400, 'A course with this slug already exists');
    }

    return fail(res, 400, error.message || 'Failed to create course');
  }
}

/**
 * Update an existing course
 * Optional: title, slug, cardBody, description, sortOrder, isActive, image
 * If title changes and slug not provided, slug will be regenerated
 */
export async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    // Find existing course
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return fail(res, 404, 'Course not found');
    }

    // Extract fields from req.body
    const title = req.body.title?.trim();
    const slug = req.body.slug?.trim();
    const cardBody = req.body.cardBody?.trim();
    const description = req.body.description?.trim();
    const sortOrder = req.body.sortOrder !== undefined ? Number(req.body.sortOrder) : undefined;
    const isActive = req.body.isActive !== undefined
      ? (req.body.isActive === 'true' || req.body.isActive === true)
      : undefined;
    const isAvailable = req.body.isAvailable !== undefined
      ? (req.body.isAvailable === 'true' || req.body.isAvailable === true)
      : undefined;

    // Build update data
    const updateData = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (slug !== undefined) {
      // Validate slug is unique (excluding current course)
      const existing = await Course.findOne({ slug: slug.toLowerCase(), _id: { $ne: id } });
      if (existing) {
        return fail(res, 400, 'A course with this slug already exists');
      }
      updateData.slug = slug.toLowerCase();
    } else if (title !== undefined && title !== existingCourse.title) {
      // Regenerate slug if title changed but slug not provided
      const baseSlug = slugify(title);
      if (baseSlug) {
        const checkSlugExists = async (slugToCheck, excludeId) => {
          const query = { slug: slugToCheck };
          if (excludeId) {
            query._id = { $ne: excludeId };
          }
          const existing = await Course.findOne(query);
          return !!existing;
        };

        const uniqueSlug = await generateUniqueSlug(baseSlug, checkSlugExists, id);
        updateData.slug = uniqueSlug;
      }
    }

    if (cardBody !== undefined) {
      updateData.cardBody = cardBody || undefined;
    }

    if (description !== undefined) {
      updateData.description = description || undefined;
    }

    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable;
    }

    // Helper function to delete old file
    const deleteOldFile = async (oldUrl) => {
      if (!oldUrl) return;
      try {
        const imagePath = oldUrl.startsWith('/uploads/')
          ? oldUrl.replace('/uploads/', '')
          : oldUrl;

        const uploadDir = path.join(process.cwd(), config.uploadDir || 'uploads');
        const filePath = join(uploadDir, imagePath);

        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error('Failed to delete old course image:', error);
        // Continue with update even if file deletion fails
      }
    };

    // Handle file upload (using req.file from multer.single())
    const imageFile = req.file;

    // If new image uploaded, replace imageUrl and delete old file
    if (imageFile) {
      await deleteOldFile(existingCourse.imageUrl);
      updateData.imageUrl = `/uploads/${imageFile.filename}`;
    }

    // Update course
    const course = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    const data = buildUpdateCourseData(course);
    return ok(res, data, 'Course updated successfully');
  } catch (error) {
    console.error('[updateCourse] Error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map(err => err.message).join(', ');
      return fail(res, 400, `Course validation failed: ${validationErrors}`);
    }

    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return fail(res, 400, 'A course with this slug already exists');
    }

    return fail(res, 400, error.message || 'Failed to update course');
  }
}

/**
 * Delete a course
 * Also removes image file (imageUrl) from disk
 */
export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    // Find course before deletion to access imageUrl
    const course = await Course.findById(id);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }

    // Helper function to delete file
    const deleteFile = async (imageUrl) => {
      if (!imageUrl) return;
      try {
        const imagePath = imageUrl.startsWith('/uploads/')
          ? imageUrl.replace('/uploads/', '')
          : imageUrl;

        const uploadDir = path.join(process.cwd(), config.uploadDir || 'uploads');
        const filePath = join(uploadDir, imagePath);

        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error('Failed to delete course image file:', error);
        // Continue with course deletion even if file deletion fails
      }
    };

    // Delete image file
    await deleteFile(course.imageUrl);

    // Delete course record
    await Course.findByIdAndDelete(id);

    return ok(res, null, 'Course deleted successfully');
  } catch (error) {
    console.error('[deleteCourse] Error:', error);
    return fail(res, 500, error.message || 'Failed to delete course');
  }
}

/**
 * Toggle course availability status
 */
export async function toggleCourseAvailability(req, res) {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }

    course.isAvailable = !course.isAvailable;
    await course.save();

    const data = buildToggleCourseAvailabilityData(course);
    return ok(res, data, `Course availability set to ${course.isAvailable}`);
  } catch (error) {
    console.error('[toggleCourseAvailability] Error:', error);
    return fail(res, 500, error.message || 'Failed to toggle availability');
  }
}
