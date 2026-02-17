import { ok, fail } from '../utils/response.js';
import * as adminService from '../services/admin.service.js';
import * as contactService from '../services/contact.service.js';
import * as courseRegistrationService from '../services/courseRegistration.service.js';
import Partner from '../models/Partner.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import config from '../config/env.js';
import { toAbsoluteUrl } from '../utils/url.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = config.baseUrl || '';

function absoluteUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return toAbsoluteUrl(url.trim(), BASE_URL);
}

function mediaKind(mediaUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string') return 'unknown';
  const lower = mediaUrl.toLowerCase().trim();
  if (/\.(mp4|mov|webm)(\?|$)/i.test(lower)) return 'video';
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(lower)) return 'image';
  return 'unknown';
}

/**
 * Build admin/mobile-friendly optional fields for hero slides list. Keeps data as array.
 */
function buildHeroSlidesData(slides) {
  if (!Array.isArray(slides)) return slides;

  return slides.map((s) => {
    if (!s || typeof s !== 'object') return s;

    const id = s._id != null ? String(s._id) : s.id != null ? String(s.id) : null;
    const hasId = !!id;
    const baseUrl = hasId ? `/admin/hero-slides/${id}` : null;

    const out = { ...s };

    if (s.mediaUrl != null && String(s.mediaUrl).trim() !== '') {
      out.media = {
        url: absoluteUrl(s.mediaUrl),
        kind: mediaKind(s.mediaUrl),
        alt: s.title != null && String(s.title).trim() !== '' ? s.title : 'Hero slide',
      };
    }

    const buttonLink = s.buttonLink != null ? String(s.buttonLink).trim() : null;
    const linkType =
      !buttonLink || buttonLink === ''
        ? 'none'
        : /^https?:\/\//i.test(buttonLink)
          ? 'external'
          : 'internal';
    out.cta = {
      text: s.buttonText != null ? s.buttonText : null,
      link: buttonLink || null,
      type: linkType,
      target: linkType === 'external' ? 'new_tab' : 'same_tab',
    };

    out.adminUi = { canEdit: true, canDelete: true };

    out.actions = [
      { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
      { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
      { type: 'delete', label: 'Delete', url: baseUrl, enabled: hasId },
    ];

    return out;
  });
}

/**
 * Build admin/mobile-friendly optional fields for a single hero slide (GET by id). Keeps data as object.
 */
function buildHeroSlideData(slide) {
  if (!slide || typeof slide !== 'object') return slide;

  const id = slide._id != null ? String(slide._id) : slide.id != null ? String(slide.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/hero-slides/${id}` : null;

  const out = { ...slide };

  if (slide.mediaUrl != null && String(slide.mediaUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(slide.mediaUrl),
      kind: mediaKind(slide.mediaUrl),
      alt: slide.title != null && String(slide.title).trim() !== '' ? slide.title : 'Hero slide',
    };
  }

  const buttonLink = slide.buttonLink != null ? String(slide.buttonLink).trim() : null;
  const linkType =
    !buttonLink || buttonLink === ''
      ? 'none'
      : /^https?:\/\//i.test(buttonLink)
        ? 'external'
        : 'internal';
  out.cta = {
    text: slide.buttonText != null ? slide.buttonText : null,
    link: buttonLink || null,
    type: linkType,
    target: linkType === 'external' ? 'new_tab' : 'same_tab',
  };

  out.adminUi = { canEdit: true, canDelete: true };

  out.actions = [
    { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
    { type: 'delete', label: 'Delete', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/hero-slides', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for created hero slide response (POST). Keeps data as object.
 */
function buildCreateHeroSlideData(slide) {
  if (!slide || typeof slide !== 'object') return slide;

  const plain =
    typeof slide.toObject === 'function' ? slide.toObject() : { ...slide };
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/hero-slides/${id}` : null;

  const out = { ...plain };

  if (plain.mediaUrl != null && String(plain.mediaUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(plain.mediaUrl),
      kind: mediaKind(plain.mediaUrl),
      alt: plain.title != null && String(plain.title).trim() !== '' ? plain.title : 'Hero slide',
    };
  }

  const buttonLink = plain.buttonLink != null ? String(plain.buttonLink).trim() : null;
  const linkType =
    !buttonLink || buttonLink === ''
      ? 'none'
      : /^https?:\/\//i.test(buttonLink)
        ? 'external'
        : 'internal';
  out.cta = {
    text: plain.buttonText != null ? plain.buttonText : null,
    link: buttonLink || null,
    type: linkType,
    target: linkType === 'external' ? 'new_tab' : 'same_tab',
  };

  out.adminUi = { canEdit: true, canDelete: true };

  out.actions = [
    { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
    { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/hero-slides', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for updated hero slide response (PUT). Keeps data as object.
 */
function buildUpdateHeroSlideData(slide) {
  if (!slide || typeof slide !== 'object') return slide;

  const plain =
    typeof slide.toObject === 'function' ? slide.toObject() : { ...slide };
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;
  const baseUrl = hasId ? `/admin/hero-slides/${id}` : null;

  const out = { ...plain };

  if (plain.mediaUrl != null && String(plain.mediaUrl).trim() !== '') {
    out.media = {
      url: absoluteUrl(plain.mediaUrl),
      kind: mediaKind(plain.mediaUrl),
      alt: plain.title != null && String(plain.title).trim() !== '' ? plain.title : 'Hero slide',
    };
  }

  const buttonLink = plain.buttonLink != null ? String(plain.buttonLink).trim() : null;
  const linkType =
    !buttonLink || buttonLink === ''
      ? 'none'
      : /^https?:\/\//i.test(buttonLink)
        ? 'external'
        : 'internal';
  out.cta = {
    text: plain.buttonText != null ? plain.buttonText : null,
    link: buttonLink || null,
    type: linkType,
    target: linkType === 'external' ? 'new_tab' : 'same_tab',
  };

  out.adminUi = { canEdit: true, canDelete: true };

  out.actions = [
    { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/hero-slides', enabled: true },
  ];

  return out;
}

/**
 * Build admin/mobile-friendly optional fields for deleted hero slide response.
 * Only adds fields when data is an object; if data is null, returns null.
 */
function buildDeleteHeroSlideData(deleted) {
  if (deleted == null || typeof deleted !== 'object') return deleted;

  const deletionMeta = {
    deletedAt: new Date().toISOString(),
  };

  const actions = [
    { type: 'back_to_list', label: 'Back', url: '/admin/hero-slides', enabled: true },
  ];

  return { ...deleted, deletionMeta, actions };
}

// Hero Slides
export async function getAllHeroSlides(req, res) {
  try {
    const slides = await adminService.getAllHeroSlides();
    const data = buildHeroSlidesData(slides);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch hero slides');
  }
}

export async function getHeroSlideById(req, res) {
  try {
    const slide = await adminService.getHeroSlideById(req.params.id);
    if (!slide) {
      return fail(res, 404, 'Hero slide not found');
    }
    const data = buildHeroSlideData(slide);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch hero slide');
  }
}

export async function createHeroSlide(req, res) {
  try {
    const slide = await adminService.createHeroSlide(req.body);
    const data = buildCreateHeroSlideData(slide);
    return ok(res, data, 'Hero slide created successfully', null, 201);
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to create hero slide');
  }
}

export async function updateHeroSlide(req, res) {
  try {
    const slide = await adminService.updateHeroSlide(req.params.id, req.body);
    if (!slide) {
      return fail(res, 404, 'Hero slide not found');
    }
    const data = buildUpdateHeroSlideData(slide);
    return ok(res, data, 'Hero slide updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update hero slide');
  }
}

export async function deleteHeroSlide(req, res) {
  try {
    const slide = await adminService.deleteHeroSlide(req.params.id);
    if (!slide) {
      return fail(res, 404, 'Hero slide not found');
    }
    const data = buildDeleteHeroSlideData(slide);
    return ok(res, data, 'Hero slide deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete hero slide');
  }
}

// Services
export async function getAllServices(req, res) {
  try {
    const services = await adminService.getAllServices();
    return ok(res, services);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch services');
  }
}

export async function getServiceById(req, res) {
  try {
    const service = await adminService.getServiceById(req.params.id);
    if (!service) {
      return fail(res, 404, 'Service not found');
    }
    return ok(res, service);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch service');
  }
}

export async function createService(req, res) {
  try {
    const service = await adminService.createService(req.body);
    return ok(res, service, 'Service created successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to create service');
  }
}

export async function updateService(req, res) {
  try {
    const service = await adminService.updateService(req.params.id, req.body);
    if (!service) {
      return fail(res, 404, 'Service not found');
    }
    return ok(res, service, 'Service updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update service');
  }
}

export async function deleteService(req, res) {
  try {
    const service = await adminService.deleteService(req.params.id);
    if (!service) {
      return fail(res, 404, 'Service not found');
    }
    return ok(res, service, 'Service deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete service');
  }
}

// Courses
export async function getAllCourses(req, res) {
  try {
    const courses = await adminService.getAllCourses();
    return ok(res, courses);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch courses');
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await adminService.getCourseById(req.params.id);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }
    return ok(res, course);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course');
  }
}

export async function createCourse(req, res) {
  try {
    const course = await adminService.createCourse(req.body);
    return ok(res, course, 'Course created successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to create course');
  }
}

export async function updateCourse(req, res) {
  try {
    const course = await adminService.updateCourse(req.params.id, req.body);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }
    return ok(res, course, 'Course updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update course');
  }
}

export async function deleteCourse(req, res) {
  try {
    const course = await adminService.deleteCourse(req.params.id);
    if (!course) {
      return fail(res, 404, 'Course not found');
    }
    return ok(res, course, 'Course deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete course');
  }
}

// Partners CRUD - REMOVED: Now handled by src/controllers/admin/partners.controller.js
// Routes are mounted via src/routes/admin/partners.routes.js in admin.routes.js

// Page Content
export async function getAllPageContent(req, res) {
  try {
    const pages = await adminService.getAllPageContent();
    return ok(res, pages);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch page content');
  }
}

export async function getPageContentByKey(req, res) {
  try {
    const page = await adminService.getPageContentByKey(req.params.key);
    if (!page) {
      return fail(res, 404, 'Page content not found');
    }
    return ok(res, page);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch page content');
  }
}

export async function createPageContent(req, res) {
  try {
    const page = await adminService.createPageContent(req.body);
    return ok(res, page, 'Page content created successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to create page content');
  }
}

export async function updatePageContent(req, res) {
  try {
    const page = await adminService.updatePageContent(req.params.key, req.body);
    if (!page) {
      return fail(res, 404, 'Page content not found');
    }
    return ok(res, page, 'Page content updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update page content');
  }
}

export async function deletePageContent(req, res) {
  try {
    const page = await adminService.deletePageContent(req.params.key);
    if (!page) {
      return fail(res, 404, 'Page content not found');
    }
    return ok(res, page, 'Page content deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete page content');
  }
}

// Contact Messages
export async function getAllContactMessages(req, res) {
  try {
    const messages = await contactService.getAllContactMessages();
    return ok(res, messages);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch contact messages');
  }
}

export async function getContactMessageById(req, res) {
  try {
    const message = await contactService.getContactMessageById(req.params.id);
    if (!message) {
      return fail(res, 404, 'Contact message not found');
    }
    return ok(res, message);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch contact message');
  }
}

export async function updateContactMessage(req, res) {
  try {
    const message = await contactService.updateContactMessage(req.params.id, req.body);
    if (!message) {
      return fail(res, 404, 'Contact message not found');
    }
    return ok(res, message, 'Contact message updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update contact message');
  }
}

// Users
export async function getAllUsers(req, res) {
  try {
    const users = await adminService.getAllUsers();
    return ok(res, users);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch users');
  }
}

// Course Registrations
export async function getAllCourseRegistrations(req, res) {
  try {
    const registrations = await courseRegistrationService.getAllRegistrations();
    return ok(res, registrations);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch course registrations');
  }
}

export async function updateCourseRegistrationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'paid', 'rejected'].includes(status)) {
      return fail(res, 400, 'Valid status is required (pending, paid, or rejected)');
    }

    const registration = await courseRegistrationService.updateRegistrationStatus(
      id,
      status,
      notes || ''
    );
    return ok(res, registration, 'Registration status updated successfully');
  } catch (error) {
    if (error.message === 'Registration not found') {
      return fail(res, 404, error.message);
    }
    return fail(res, 500, error.message || 'Failed to update registration status');
  }
}

// Upload
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return fail(res, 400, 'No file uploaded');
    }

    const file = req.file;
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    
    const fileUrl = `/uploads/${file.filename}`;
    
    const responseData = {
      url: fileUrl,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      kind: isImage ? 'image' : isVideo ? 'video' : 'unknown',
    };

    return ok(res, responseData, 'File uploaded successfully');
  } catch (error) {
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return fail(res, 400, 'File too large. Maximum size: 200MB for videos, 10MB for images.');
    }
    if (error.message && error.message.includes('Invalid file type')) {
      return fail(res, 400, error.message);
    }
    return fail(res, 500, error.message || 'Failed to upload file');
  }
}
