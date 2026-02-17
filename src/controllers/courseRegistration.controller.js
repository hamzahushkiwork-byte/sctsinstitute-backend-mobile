import { ok, fail } from '../utils/response.js';
import * as courseRegistrationService from '../services/courseRegistration.service.js';

/**
 * Build mobile-friendly optional fields for register response (data remains the created registration object).
 */
function buildRegisterData(registration) {
  if (!registration || typeof registration !== 'object') return registration;

  const status = (registration.status || '').toLowerCase();
  const createdAt =
    registration.createdAt != null
      ? (registration.createdAt instanceof Date
          ? registration.createdAt
          : new Date(registration.createdAt)
        ).toISOString()
      : registration.registeredAt != null
        ? (registration.registeredAt instanceof Date
            ? registration.registeredAt
            : new Date(registration.registeredAt)
          ).toISOString()
        : new Date().toISOString();

  const registrationMeta = {
    registeredAt: createdAt,
    statusLabel:
      status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : status,
    isPending: status === 'pending',
    isApproved: status === 'paid' || status === 'approved',
    isRejected: status === 'rejected',
  };

  const courseSlug =
    registration.courseId && typeof registration.courseId === 'object' && registration.courseId.slug
      ? registration.courseId.slug
      : null;

  const actions = [];
  if (courseSlug) {
    actions.push({
      type: 'view_course',
      label: 'View Course',
      url: `/courses/${courseSlug}`,
      enabled: true,
    });
  }
  actions.push({
    type: 'view_my_registrations',
    label: 'My Registrations',
    url: '/course-registrations/my-registrations',
    enabled: true,
  });

  return { ...registration, registrationMeta, actions };
}

/**
 * Build mobile-friendly optional fields for my-registrations list. Keeps data as array.
 * Does not add courseSnapshot when course details are already embedded (courseId populated).
 */
function buildMyRegistrationsData(registrations) {
  if (!Array.isArray(registrations)) return registrations;

  return registrations.map((reg) => {
    if (!reg || typeof reg !== 'object') return reg;

    const status = (reg.status ?? '').toLowerCase();
    const registrationMeta = {
      statusLabel:
        status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : '',
      isPending: status === 'pending',
      isApproved: status === 'paid' || status === 'approved',
      isRejected: status === 'rejected',
    };

    const registrationId = reg._id != null ? String(reg._id) : null;
    const courseSlug =
      reg.courseId && typeof reg.courseId === 'object' && reg.courseId.slug != null
        ? reg.courseId.slug
        : null;

    const actions = [
      {
        type: 'open_registration',
        label: 'Open',
        url: registrationId ? `/course-registrations/${registrationId}` : null,
        enabled: true,
      },
      {
        type: 'open_course',
        label: 'Course',
        url: courseSlug ? `/courses/${courseSlug}` : null,
        enabled: Boolean(courseSlug),
      },
    ];

    return { ...reg, registrationMeta, actions };
  });
}

/**
 * Build mobile-friendly optional fields for admin registrations list. Keeps data as array.
 * Snapshots only when user/course are already populated (no extra DB calls).
 */
function buildAdminRegistrationsData(registrations) {
  if (!Array.isArray(registrations)) return registrations;

  const allowedStatuses = ['pending', 'paid', 'rejected'];

  return registrations.map((reg) => {
    if (!reg || typeof reg !== 'object') return reg;

    const status = (reg.status ?? '').toLowerCase();
    const registrationMeta = {
      statusLabel:
        status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : '',
      isPending: status === 'pending',
      isApproved: status === 'paid' || status === 'approved',
      isRejected: status === 'rejected',
    };

    const adminUi = {
      canUpdateStatus: true,
      allowedStatuses: [...allowedStatuses],
    };

    const registrationId = reg._id != null ? String(reg._id) : null;
    const actions = [
      {
        type: 'update_status',
        label: 'Update Status',
        url:
          registrationId != null
            ? `/course-registrations/admin/${registrationId}/status`
            : null,
        enabled: true,
      },
    ];

    const out = { ...reg, registrationMeta, adminUi, actions };

    const u = reg.userId;
    if (u && typeof u === 'object' && (u.email != null || u._id != null)) {
      const name =
        u.name != null && u.name !== ''
          ? u.name
          : [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || null;
      out.userSnapshot = {
        id: u._id != null ? String(u._id) : null,
        name: name ?? null,
        email: u.email ?? null,
      };
    }

    const c = reg.courseId;
    if (c && typeof c === 'object' && (c.title != null || c._id != null)) {
      out.courseSnapshot = {
        id: c._id != null ? String(c._id) : null,
        title: c.title ?? null,
        slug: c.slug ?? null,
      };
    }

    return out;
  });
}

/**
 * Build mobile-friendly optional fields for update-status response (data remains the updated registration object).
 */
function buildUpdateStatusData(registration) {
  if (!registration || typeof registration !== 'object') return registration;

  const plain =
    typeof registration.toObject === 'function' ? registration.toObject() : { ...registration };

  const status = (plain.status ?? '').toLowerCase();
  const updatedStatusAt =
    plain.updatedAt != null
      ? (plain.updatedAt instanceof Date
          ? plain.updatedAt
          : new Date(plain.updatedAt)
        ).toISOString()
      : new Date().toISOString();

  const registrationMeta = {
    statusLabel:
      status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : '',
    isPending: status === 'pending',
    isApproved: status === 'paid' || status === 'approved',
    isRejected: status === 'rejected',
    updatedStatusAt,
  };

  const adminUi = {
    allowedStatuses: ['pending', 'paid', 'rejected'],
  };

  const actions = [
    {
      type: 'view_registration',
      label: 'View',
      url: '/course-registrations/admin',
      enabled: true,
    },
  ];

  return { ...plain, registrationMeta, adminUi, actions };
}

/**
 * Register user for a course
 */
export async function registerForCourse(req, res) {
  try {
    const { courseId } = req.body;
    const userId = req.user?.userId; // From auth middleware

    if (!userId) {
      return fail(res, 401, 'User not authenticated');
    }

    if (!courseId) {
      return fail(res, 400, 'Course ID is required');
    }

    const registration = await courseRegistrationService.registerForCourse(courseId, userId);
    const data = buildRegisterData(registration);
    return ok(res, data, 'Successfully registered for course', null, 201);
  } catch (error) {
    if (error.message === 'Course not found' || error.message === 'User not found') {
      return fail(res, 404, error.message);
    }
    if (error.message === 'User is already registered for this course') {
      return fail(res, 409, error.message);
    }
    return fail(res, 500, error.message || 'Failed to register for course');
  }
}

/**
 * Get all registrations (admin only)
 */
export async function getAllRegistrations(req, res) {
  try {
    const registrations = await courseRegistrationService.getAllRegistrations();
    const data = buildAdminRegistrationsData(registrations);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch registrations');
  }
}

/**
 * Get registrations for a specific course (admin)
 */
export async function getRegistrationsByCourse(req, res) {
  try {
    const { courseId } = req.params;
    const registrations = await courseRegistrationService.getRegistrationsByCourse(courseId);
    const data = buildAdminRegistrationsData(registrations);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch registrations');
  }
}

/**
 * Get user's registrations
 */
export async function getUserRegistrations(req, res) {
  try {
    const userId = req.user?.userId; // From auth middleware

    if (!userId) {
      return fail(res, 401, 'User not authenticated');
    }

    const registrations = await courseRegistrationService.getRegistrationsByUser(userId);
    const data = buildMyRegistrationsData(registrations);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch registrations');
  }
}

/**
 * Get user's registration for a specific course
 */
export async function getUserCourseRegistration(req, res) {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId; // From auth middleware

    if (!userId) {
      return fail(res, 401, 'User not authenticated');
    }

    const registration = await courseRegistrationService.getUserCourseRegistration(courseId, userId);
    
    if (!registration) {
      return ok(res, null, 'User not registered for this course');
    }

    return ok(res, registration);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch registration');
  }
}

/**
 * Update registration status (admin only)
 */
export async function updateRegistrationStatus(req, res) {
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
    const data = buildUpdateStatusData(registration);
    return ok(res, data, 'Registration status updated successfully');
  } catch (error) {
    if (error.message === 'Registration not found') {
      return fail(res, 404, error.message);
    }
    return fail(res, 500, error.message || 'Failed to update registration status');
  }
}
