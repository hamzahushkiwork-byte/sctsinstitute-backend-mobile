import { ok, fail } from '../utils/response.js';
import {
  toAbsoluteUrl,
  normalizePublicMediaPath,
  resolveUploadsPublicUrl,
} from '../utils/url.js';
import config from '../config/env.js';
import * as homeService from '../services/home.service.js';

/**
 * Public API base: APP_URL / PUBLIC_BASE_URL, or inferred from the request (host + protocol).
 */
function getPublicBaseUrl(req) {
  const configured = (config.baseUrl || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const xfProto = (req.get('x-forwarded-proto') || '').split(',')[0].trim();
  const proto = (xfProto || req.protocol || 'http').replace(/:+$/, '');
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  if (!host) return '';
  return `${proto}://${host}`.replace(/\/$/, '');
}

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
 * Final public URL for hero slide media (static uploads host when configured).
 */
function resolveHeroSlideMediaUrl(raw, req) {
  const staticOrigin = (config.uploadsPublicOrigin || '').trim();
  if (staticOrigin) {
    const u = resolveUploadsPublicUrl(raw, staticOrigin);
    if (u) return u;
  }
  const pathOrUrl = normalizePublicMediaPath(String(raw).trim());
  return toAbsoluteUrl(pathOrUrl, getPublicBaseUrl(req));
}

/**
 * Build media object from hero slide mediaUrl; omit if no mediaUrl.
 * @param {string} mediaUrl - Raw value from DB (path, /uploads/..., or bare filename)
 * @param {string} [title]
 * @param {string} absoluteUrl - Already-resolved URL
 */
function buildHeroMedia(mediaUrl, title, absoluteUrl) {
  if (!mediaUrl || typeof mediaUrl !== 'string' || !mediaUrl.trim()) return undefined;
  return {
    url: absoluteUrl,
    thumbUrl: absoluteUrl,
    mediumUrl: absoluteUrl,
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
/**
 * GET /api/v1/home/trending-courses — public, no auth.
 * Only trending rows with isActive true and an active populated course.
 * Returns price (custom override if set, otherwise course.price).
 */
export async function getTrendingCourses(req, res) {
  try {
    const rows = await homeService.getTrendingCoursesForPublic();
    const list = rows
      .filter((t) => t.courseId && typeof t.courseId === 'object')
      .map((t) => {
        const customPrice = t.price === undefined ? null : t.price;
        const coursePrice = t.courseId?.price ?? null;
        const isCustomPrice = customPrice !== null && customPrice !== undefined;
        const displayAmount = isCustomPrice ? customPrice : coursePrice ?? 0;
        const amountNum = Number.isFinite(displayAmount)
          ? displayAmount
          : Number(displayAmount) || 0;
        const isFree = amountNum <= 0;
        return {
          _id: t._id,
          order: t.order,
          price: customPrice,
          displayPrice: amountNum,
          isCustomPrice,
          pricing: {
            amount: amountNum,
            isFree,
            currency: 'USD',
            display: isFree ? 'Free' : `$${amountNum.toFixed(2)}`,
            source: isCustomPrice ? 'custom' : 'course',
          },
          course: t.courseId,
        };
      });
    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch trending courses');
  }
}

/**
 * GET /api/v1/home/mobile-slides — public, no auth.
 * Active slides; image URL is absolutized to the canonical uploads origin.
 */
export async function getMobileSlides(req, res) {
  try {
    const rows = await homeService.getMobileSlidesForPublic();
    const list = rows.map((s) => {
      const out = { ...s };
      if (s.images && String(s.images).trim()) {
        out.imageUrl = resolveHeroSlideMediaUrl(s.images, req);
      }
      return out;
    });
    return ok(res, list);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch mobile slides');
  }
}

export async function getHeroSlides(req, res) {
  try {
    const slides = await homeService.getHeroSlides();
    const list = slides.map((s) => {
      const out = { ...s };
      if (s.mediaUrl && String(s.mediaUrl).trim()) {
        const absolute = resolveHeroSlideMediaUrl(s.mediaUrl, req);
        out.mediaUrl = absolute;
        out.media = buildHeroMedia(s.mediaUrl, s.title, absolute);
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