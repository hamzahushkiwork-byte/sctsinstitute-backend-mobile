import { ok, fail } from '../utils/response.js';
import * as testService from '../services/test.service.js';

// Public - get active tests
export async function getActiveTests(req, res) {
  try {
    const tests = await testService.getActiveTests();
    return ok(res, tests);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch tests');
  }
}

// Admin - get all tests
export async function getAllTests(req, res) {
  try {
    const tests = await testService.getAllTests();
    return ok(res, tests);
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
    return ok(res, test, 'Test created successfully', null, 201);
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
    return ok(res, test, 'Test updated successfully');
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
    return ok(res, test, 'Test deleted successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to delete test');
  }
}
