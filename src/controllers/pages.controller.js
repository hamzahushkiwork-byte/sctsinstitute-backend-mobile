import { ok, fail } from '../utils/response.js';
import * as pagesService from '../services/pages.service.js';

/**
 * Detect contentType from raw content string.
 */
function getContentType(content) {
  if (content == null || typeof content !== 'string') return 'unknown';
  const s = content.trim();
  if (s.includes('<') && s.includes('>')) return 'html';
  if (/#\s|^\s*[-*]\s|(\*\*|__).+\1/m.test(s)) return 'markdown';
  return 'text';
}

/**
 * Estimate read time in minutes (200 wpm), round up, min 1. Returns null if content not a string.
 */
function getEstimatedReadTimeMinutes(content) {
  if (content == null || typeof content !== 'string') return null;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return null;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Build contentMeta from page content.
 */
function buildContentMeta(content) {
  const contentType = getContentType(content);
  const estimatedReadTimeMinutes = getEstimatedReadTimeMinutes(content);
  return { contentType, estimatedReadTimeMinutes };
}

/**
 * Build sections array when content is a string (additive; do not alter content field).
 */
function buildSections(content, title, key) {
  if (content == null || typeof content !== 'string') return undefined;
  return [{ key: 'main', title: (title != null && String(title).trim()) || key || 'Page', body: content }];
}

/**
 * Build ui object for mobile.
 */
function buildPageUi(title) {
  return {
    showTitle: Boolean(title != null && String(title).trim()),
    layout: 'page',
  };
}

/**
 * Build actions array when key exists.
 */
function buildPageActions(key) {
  if (key == null || String(key).trim() === '') return undefined;
  return [{ type: 'share', label: 'Share', url: `/pages/${key}`, enabled: true }];
}

/**
 * Get page content by key (public)
 * Returns single page object; keeps all existing fields and adds optional mobile-friendly fields (contentMeta, sections, ui, actions).
 */
export async function getPageContent(req, res) {
  try {
    const { key } = req.params;
    const page = await pagesService.getPageContent(key);
    if (!page) {
      return fail(res, 404, 'Page content not found');
    }

    const contentSource = page.content ?? page.contentJson;
    const out = { ...page };
    out.contentMeta = buildContentMeta(contentSource);
    const sections = buildSections(contentSource, page.title, page.key);
    if (sections) out.sections = sections;
    out.ui = buildPageUi(page.title);
    if (page.key != null && String(page.key).trim() !== '') {
      out.actions = buildPageActions(page.key);
    }

    return ok(res, out);
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch page content');
  }
}
