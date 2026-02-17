import crypto from 'crypto';
import { ok, fail } from '../utils/response.js';
import * as contactService from '../services/contact.service.js';

const SUCCESS_MESSAGE = "Thank you for your message. We'll get back to you soon.";

const NEXT_STEPS = [
  'We received your message',
  'Our team will review it',
  'We will contact you soon',
];

/**
 * Generate a short reference id for tracking (e.g. CM-xxxxxxxx).
 */
function generateReferenceId() {
  const chars = crypto.randomBytes(4).toString('hex');
  return `CM-${chars}`;
}

/**
 * Build success data: existing result plus optional mobile-friendly fields.
 */
function buildContactSuccessData(result) {
  const data = result && typeof result.toObject === 'function' ? result.toObject() : { ...(result || {}) };
  data.referenceId = generateReferenceId();
  data.receivedAt = new Date().toISOString();
  data.nextSteps = [...NEXT_STEPS];
  return data;
}

/**
 * POST /contact - Submit contact form (public)
 * Success: same envelope and message; data includes existing fields plus optional referenceId, receivedAt, nextSteps.
 */
export async function submitContact(req, res) {
  try {
    const result = await contactService.submitContact(req.body);
    const data = buildContactSuccessData(result);
    return ok(res, data, SUCCESS_MESSAGE);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to submit contact message');
  }
}
