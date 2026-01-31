import { ok, fail } from '../utils/response.js';
import * as servicesService from '../services/services.service.js';

export async function getServices(req, res) {
  try {
    const services = await servicesService.getServices();
    return ok(res, services);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch services');
  }
}

export async function getServiceBySlug(req, res) {
  try {
    const { slug } = req.params;
    const service = await servicesService.getServiceBySlug(slug);
    if (!service) {
      return fail(res, 404, 'Service not found');
    }
    return ok(res, service);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch service');
  }
}
