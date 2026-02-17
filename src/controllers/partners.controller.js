import { ok, fail } from '../utils/response.js';
import { toAbsoluteUrl } from '../utils/url.js';
import config from '../config/env.js';
import * as partnersService from '../services/partners.service.js';

const BASE_URL = config.baseUrl || '';

/**
 * Build media object from partner logoUrl. Omit if no logoUrl.
 */
function buildPartnerMedia(logoUrl, name) {
  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.trim()) return undefined;
  const url = toAbsoluteUrl(logoUrl.trim(), BASE_URL);
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: (name != null && String(name).trim()) || 'Partner',
    width: null,
    height: null,
  };
}

/**
 * Build linkMeta from partner link.
 */
function buildLinkMeta(link) {
  const url = (link != null && String(link).trim()) || null;
  let type = 'none';
  let target = 'same_tab';
  if (url) {
    type = /^https?:\/\//i.test(url) ? 'external' : 'internal';
    target = type === 'external' ? 'new_tab' : 'same_tab';
  }
  return { url, type, target };
}

/**
 * Build ui object (order from sortOrder).
 */
function buildPartnerUi(sortOrder) {
  return { order: sortOrder ?? 0 };
}

/**
 * Build actions array for a partner.
 */
function buildPartnerActions(link) {
  const url = (link != null && String(link).trim()) || null;
  return [{ type: 'open', label: 'Visit', url, enabled: Boolean(url) }];
}

/**
 * Get partners (public)
 * Returns array of active partners; keeps all existing fields and adds optional mobile-friendly fields (media, linkMeta, ui, actions).
 */
export async function getPartners(req, res) {
  try {
    const partners = await partnersService.getPartners();
    const list = partners.map((p) => {
      const out = { ...p };
      if (p.logoUrl && String(p.logoUrl).trim()) {
        out.media = buildPartnerMedia(p.logoUrl, p.name);
      }
      out.linkMeta = buildLinkMeta(p.link);
      out.ui = buildPartnerUi(p.sortOrder);
      out.actions = buildPartnerActions(p.link);
      return out;
    });
    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch partners');
  }
}
