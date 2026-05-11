import path from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import mongoose from 'mongoose';
import { ok, fail } from '../../utils/response.js';
import MobileSlide from '../../models/MobileSlide.model.js';
import Course from '../../models/Course.model.js';
import CertificationService from '../../models/CertificationService.model.js';
import config from '../../config/env.js';

const populateLinks = [
  { path: 'courseId', model: 'Course', select: 'title slug imageUrl isActive isAvailable price' },
  { path: 'certificateId', model: 'CertificationService', select: 'title slug cardImageUrl isActive' },
];

function isObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function deleteUploadIfExists(relPath) {
  if (!relPath || typeof relPath !== 'string') return;
  try {
    const uploadRoot = path.join(process.cwd(), config.uploadDir || 'uploads');
    const trimmed = relPath.replace(/^\/+/, '').replace(/^uploads\//i, '');
    const filePath = path.join(uploadRoot, trimmed);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (err) {
    console.error('Failed to delete mobile slide image:', err);
  }
}

async function ensureLinkedExists(type, courseId, certificateId) {
  if (type === 'course') {
    if (!courseId) return 'courseId is required when type is "course"';
    const c = await Course.findById(courseId).lean();
    if (!c) return 'Linked course not found';
  }
  if (type === 'certificate') {
    if (!certificateId) return 'certificateId is required when type is "certificate"';
    const c = await CertificationService.findById(certificateId).lean();
    if (!c) return 'Linked certificate not found';
  }
  return null;
}

/**
 * GET /api/v1/admin/mobile-slides
 */
export async function listMobileSlides(req, res) {
  try {
    const rows = await MobileSlide.find()
      .sort({ order: 1, createdAt: -1 })
      .populate(populateLinks)
      .lean();
    return ok(res, rows);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to list mobile slides');
  }
}

/**
 * GET /api/v1/admin/mobile-slides/:id
 */
export async function getMobileSlideById(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return fail(res, 400, 'Invalid id');
    const row = await MobileSlide.findById(id).populate(populateLinks).lean();
    if (!row) return fail(res, 404, 'Mobile slide not found');
    return ok(res, row);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch mobile slide');
  }
}

/**
 * POST /api/v1/admin/mobile-slides
 * multipart/form-data (image field: "images")
 */
export async function createMobileSlide(req, res) {
  try {
    if (!req.file) {
      return fail(res, 400, 'Image file is required (field: "images")');
    }

    const { title, body = '', type = null, order = 0, isActive = true } = req.body;
    const courseId = type === 'course' ? req.body.courseId : null;
    const certificateId = type === 'certificate' ? req.body.certificateId : null;

    const linkErr = await ensureLinkedExists(type, courseId, certificateId);
    if (linkErr) {
      await deleteUploadIfExists(`/uploads/mobile-slides/${req.file.filename}`);
      return fail(res, 400, linkErr);
    }

    const slide = await MobileSlide.create({
      title,
      body,
      images: `/uploads/mobile-slides/${req.file.filename}`,
      type,
      courseId,
      certificateId,
      order,
      isActive,
    });

    const row = await MobileSlide.findById(slide._id).populate(populateLinks).lean();
    return ok(res, row, 'Mobile slide created', null, 201);
  } catch (error) {
    if (req.file?.filename) {
      await deleteUploadIfExists(`/uploads/mobile-slides/${req.file.filename}`);
    }
    return fail(res, 500, error.message || 'Failed to create mobile slide');
  }
}

/**
 * PUT /api/v1/admin/mobile-slides/:id
 * multipart/form-data (image field: "images", optional)
 */
export async function updateMobileSlide(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return fail(res, 400, 'Invalid id');

    const existing = await MobileSlide.findById(id);
    if (!existing) {
      if (req.file?.filename) {
        await deleteUploadIfExists(`/uploads/mobile-slides/${req.file.filename}`);
      }
      return fail(res, 404, 'Mobile slide not found');
    }

    const updateData = {};
    const { title, body, type, order, isActive } = req.body;

    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    let nextType = existing.type;
    if (type !== undefined) {
      updateData.type = type;
      nextType = type;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'courseId')) {
      updateData.courseId = nextType === 'course' ? req.body.courseId : null;
    } else if (nextType !== 'course') {
      updateData.courseId = null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'certificateId')) {
      updateData.certificateId = nextType === 'certificate' ? req.body.certificateId : null;
    } else if (nextType !== 'certificate') {
      updateData.certificateId = null;
    }

    const linkErr = await ensureLinkedExists(nextType, updateData.courseId, updateData.certificateId);
    if (linkErr) {
      if (req.file?.filename) {
        await deleteUploadIfExists(`/uploads/mobile-slides/${req.file.filename}`);
      }
      return fail(res, 400, linkErr);
    }

    if (req.file) {
      await deleteUploadIfExists(existing.images);
      updateData.images = `/uploads/mobile-slides/${req.file.filename}`;
    }

    const updated = await MobileSlide.findByIdAndUpdate(id, { $set: updateData }, {
      new: true,
      runValidators: true,
    })
      .populate(populateLinks)
      .lean();

    return ok(res, updated, 'Mobile slide updated');
  } catch (error) {
    if (req.file?.filename) {
      await deleteUploadIfExists(`/uploads/mobile-slides/${req.file.filename}`);
    }
    return fail(res, 500, error.message || 'Failed to update mobile slide');
  }
}

/**
 * DELETE /api/v1/admin/mobile-slides/:id
 */
export async function deleteMobileSlide(req, res) {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return fail(res, 400, 'Invalid id');
    const deleted = await MobileSlide.findByIdAndDelete(id).lean();
    if (!deleted) return fail(res, 404, 'Mobile slide not found');
    await deleteUploadIfExists(deleted.images);
    return ok(res, deleted, 'Mobile slide removed');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete mobile slide');
  }
}
