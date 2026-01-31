import { ok, fail } from '../utils/response.js';
import * as partnersService from '../services/partners.service.js';

export async function getPartners(req, res) {
  try {
    const partners = await partnersService.getPartners();
    return ok(res, partners);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch partners');
  }
}
