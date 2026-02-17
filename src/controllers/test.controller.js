import { ok, fail } from '../utils/response.js';
import * as testService from '../services/test.service.js';

/**
 * Build mobile-friendly optional fields for public active tests list. Keeps data as array.
 */
function buildActiveTestsData(tests) {
  if (!Array.isArray(tests)) return tests;

  return tests.map((t) => {
    if (!t || typeof t !== 'object') return t;

    const id = t._id != null ? String(t._id) : t.id != null ? String(t.id) : null;
    const hasDetailsEndpoint = false; // No public GET /tests/:id in current routes

    const ui = {
      displayTitle: t.title != null ? t.title : t.name ?? null,
      order: t.sortOrder != null ? t.sortOrder : t.order ?? null,
    };

    const actions = [
      {
        type: 'start',
        label: 'Start',
        url: hasDetailsEndpoint && id ? `/tests/${id}` : null,
        enabled: hasDetailsEndpoint && !!id,
      },
    ];

    const lastUpdatedAt =
      t.updatedAt != null
        ? t.updatedAt instanceof Date
          ? t.updatedAt.toISOString()
          : t.updatedAt
        : null;
    const meta = {
      isActive: t.isActive !== undefined ? Boolean(t.isActive) : true,
      lastUpdatedAt,
    };

    return { ...t, ui, actions, meta };
  });
}

/**
 * Build admin/mobile-friendly optional fields for admin tests list. Keeps data as array.
 */
function buildAdminTestsData(tests) {
  if (!Array.isArray(tests)) return tests;

  return tests.map((t) => {
    if (!t || typeof t !== 'object') return t;

    const id = t._id != null ? String(t._id) : t.id != null ? String(t.id) : null;
    const hasId = !!id;
    const baseUrl = hasId ? `/admin/tests/${id}` : null;

    const adminUi = {
      canEdit: true,
      canDelete: true,
    };

    const actions = [
      { type: 'view', label: 'View', url: baseUrl, enabled: hasId },
      { type: 'edit', label: 'Edit', url: baseUrl, enabled: hasId },
      { type: 'delete', label: 'Delete', url: baseUrl, enabled: hasId },
    ];

    const toIso = (v) =>
      v == null ? null : v instanceof Date ? v.toISOString() : v;
    const meta = {
      lastUpdatedAt: toIso(t.updatedAt),
      createdAt: toIso(t.createdAt),
    };

    return { ...t, adminUi, actions, meta };
  });
}

/**
 * Build admin/mobile-friendly optional fields for created test response (data remains the created test object).
 */
function buildCreateTestData(test) {
  if (!test || typeof test !== 'object') return test;

  const plain =
    typeof test.toObject === 'function' ? test.toObject() : { ...test };
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;

  const adminUi = {
    canEdit: true,
    canDelete: true,
  };

  const actions = [
    { type: 'view', label: 'View', url: hasId ? `/admin/tests/${id}` : null, enabled: hasId },
    { type: 'edit', label: 'Edit', url: hasId ? `/admin/tests/${id}` : null, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/tests', enabled: true },
  ];

  const createdAt =
    plain.createdAt != null
      ? plain.createdAt instanceof Date
        ? plain.createdAt.toISOString()
        : plain.createdAt
      : new Date().toISOString();
  const meta = plain.createdAt != null ? { createdAt } : null;

  return meta != null ? { ...plain, adminUi, actions, meta } : { ...plain, adminUi, actions };
}

/**
 * Build admin/mobile-friendly optional fields for updated test response (data remains the updated test object).
 */
function buildUpdateTestData(test) {
  if (!test || typeof test !== 'object') return test;

  const plain =
    typeof test.toObject === 'function' ? test.toObject() : { ...test };
  const id = plain._id != null ? String(plain._id) : plain.id != null ? String(plain.id) : null;
  const hasId = !!id;

  const adminUi = {
    canEdit: true,
    canDelete: true,
  };

  const actions = [
    { type: 'view', label: 'View', url: hasId ? `/admin/tests/${id}` : null, enabled: hasId },
    { type: 'back_to_list', label: 'Back', url: '/admin/tests', enabled: true },
  ];

  const updatedAt =
    plain.updatedAt != null
      ? plain.updatedAt instanceof Date
        ? plain.updatedAt.toISOString()
        : plain.updatedAt
      : new Date().toISOString();
  const meta = plain.updatedAt != null ? { updatedAt } : null;

  return meta != null ? { ...plain, adminUi, actions, meta } : { ...plain, adminUi, actions };
}

/**
 * Build admin/mobile-friendly optional fields for deleted test response.
 * Only adds fields when data is an object; if data is null, returns null.
 */
function buildDeleteTestData(deleted) {
  if (deleted == null || typeof deleted !== 'object') return deleted;

  const deletionMeta = {
    deletedAt: new Date().toISOString(),
    softDelete: null,
  };

  const actions = [
    { type: 'back_to_list', label: 'Back', url: '/admin/tests', enabled: true },
  ];

  return { ...deleted, deletionMeta, actions };
}

// Public - get active tests
export async function getActiveTests(req, res) {
  try {
    const tests = await testService.getActiveTests();
    const data = buildActiveTestsData(tests);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch tests');
  }
}

// Admin - get all tests
export async function getAllTests(req, res) {
  try {
    const tests = await testService.getAllTests();
    const data = buildAdminTestsData(tests);
    return ok(res, data);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch tests');
  }
}

// Admin - get test by id
export async function getTestById(req, res) {
  try {
    const test = await testService.getTestById(req.params.id);
    if (!test) {
      return fail(res, 404, 'Test not found');
    }
    return ok(res, test);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch test');
  }
}

// Admin - create test
export async function createTest(req, res) {
  try {
    const test = await testService.createTest(req.body);
    const data = buildCreateTestData(test);
    return ok(res, data, 'Test created successfully', null, 201);
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to create test');
  }
}

// Admin - update test
export async function updateTest(req, res) {
  try {
    const test = await testService.updateTest(req.params.id, req.body);
    if (!test) {
      return fail(res, 404, 'Test not found');
    }
    const data = buildUpdateTestData(test);
    return ok(res, data, 'Test updated successfully');
  } catch (error) {
    return fail(res, 400, error.message || 'Failed to update test');
  }
}

// Admin - delete test
export async function deleteTest(req, res) {
  try {
    const test = await testService.deleteTest(req.params.id);
    if (!test) {
      return fail(res, 404, 'Test not found');
    }
    const data = buildDeleteTestData(test);
    return ok(res, data, 'Test deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete test');
  }
}
