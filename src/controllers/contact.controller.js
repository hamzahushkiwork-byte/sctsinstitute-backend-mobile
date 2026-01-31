import { ok, fail } from '../utils/response.js';
import * as contactService from '../services/contact.service.js';

export async function submitContact(req, res) {
  try {
    const result = await contactService.submitContact(req.body);
    return ok(res, result, 'Thank you for your message. We\'ll get back to you soon.');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to submit contact message');
  }
}
