import { ok, fail } from '../utils/response.js';
import * as pagesService from '../services/pages.service.js';

export async function getPageContent(req, res) {
  try {
    const { key } = req.params;
    const content = await pagesService.getPageContent(key);
    if (!content) {
      return fail(res, 404, 'Page content not found');
    }
    return ok(res, content);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch page content');
  }
}
