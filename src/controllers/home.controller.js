import { ok, fail } from '../utils/response.js';
import { toAbsoluteUrl } from '../utils/url.js';
import config from '../config/env.js';
import * as homeService from '../services/home.service.js';

const BASE_URL = config.baseUrl || '';

/**
 * Detect media kind from URL (by extension). Returns "image" | "video" | "unknown".
 */
function getMediaKind(mediaUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string') return 'unknown';
  const lower = mediaUrl.trim().toLowerCase();
  if (/\.(mp4|mov|webm|ogg|webvtt)$/i.test(lower)) return 'video';
  if (/\.(jpg|jpeg|png|webp|gif)$/i.test(lower)) return 'image';
  return 'unknown';
}

/**
 * Build media object from hero slide mediaUrl; omit if no mediaUrl.
 */
function buildHeroMedia(mediaUrl, title) {
  if (!mediaUrl || typeof mediaUrl !== 'string' || !mediaUrl.trim()) return undefined;
  const url = toAbsoluteUrl(mediaUrl.trim(), BASE_URL);
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: (title != null && String(title).trim()) || 'Hero slide',
    kind: getMediaKind(mediaUrl),
  };
}

/**
 * Build cta object from buttonText/buttonLink.
 */
function buildCta(buttonText, buttonLink) {
  const text = (buttonText != null && String(buttonText).trim()) || null;
  const link = (buttonLink != null && String(buttonLink).trim()) || null;
  let type = 'none';
  let target = 'same_tab';
  if (link) {
    type = /^https?:\/\//i.test(link) ? 'external' : 'internal';
    target = type === 'external' ? 'new_tab' : 'same_tab';
  }
  return { text, link, type, target };
}

/**
 * Build ui hints for mobile.
 */
function buildUi(order, buttonLink) {
  return {
    priority: order ?? 0,
    isClickable: Boolean(buttonLink && String(buttonLink).trim()),
    theme: null,
  };
}

/**
 * Get hero slides (public).
 * Returns array of active slides; keeps all existing fields and adds optional mobile-friendly fields (media, cta, ui).
 */
export async function getHeroSlides(req, res) {
  try {
    const slides = await homeService.getHeroSlides();
    const list = slides.map((s) => {
      const out = { ...s };
      if (s.mediaUrl && String(s.mediaUrl).trim()) {
        out.media = buildHeroMedia(s.mediaUrl, s.title);
      }
      out.cta = buildCta(s.buttonText, s.buttonLink);
      out.ui = buildUi(s.order, s.buttonLink);
      return out;
    });
    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch hero slides');
  }
}