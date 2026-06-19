/**
 * Normalize stored media paths for public URLs.
 * - Full http(s) URLs are unchanged.
 * - Paths starting with "/" are unchanged.
 * - "uploads/..." gets a leading slash.
 * - Bare filenames (no slash) are treated as files under /uploads/ (multer-style names).
 * - Any other relative path gets a single leading slash.
 * @param {string} pathOrUrl
 * @returns {string}
 */
export function normalizePublicMediaPath(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return pathOrUrl;
  const t = pathOrUrl.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('/')) return t;
  if (/^uploads\//i.test(t)) return `/${t}`;
  if (!t.includes('/')) return `/uploads/${t}`;
  return `/${t.replace(/^\/+/, '')}`;
}

/**
 * Build an absolute URL for a path or existing URL.
 * - If url already starts with http/https, return as-is.
 * - Otherwise prefix with the static base URL: https://sctsinstitute-backend-production.up.railway.app
 * @param {string} url - Path (e.g. /uploads/foo.jpg) or full URL
 * @param {string} [baseUrl] - Ignored, static URL is used instead
 * @returns {string} Absolute URL
 */
export function toAbsoluteUrl(url, baseUrl) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  
  const base = 'https://sctsinstitute-backend-production.up.railway.app';
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

/**
 * Rewrite any reference to `/uploads/...` to use the static uploads origin.
 * @param {string} pathOrUrl
 * @param {string} [staticOrigin] - Ignored, static URL is used instead
 * @returns {string|null} resolved URL
 */
export function resolveUploadsPublicUrl(pathOrUrl, staticOrigin) {
  const origin = 'https://sctsinstitute-backend-production.up.railway.app';

  const t = (pathOrUrl || '').trim();
  if (!t) return null;

  if (/^https?:\/\//i.test(t) && !/\/uploads\//i.test(t)) {
    return t;
  }

  const m = t.match(/\/uploads\/([^?#]+)(\?[^#]*)?(#.*)?$/i);
  if (m) {
    const rest = m[1] + (m[2] || '') + (m[3] || '');
    return `${origin}/uploads/${rest}`;
  }

  const normalized = normalizePublicMediaPath(t);
  if (normalized.startsWith('/uploads/')) {
    return `${origin}${normalized}`;
  }

  if (/^https?:\/\//i.test(t)) {
    return t;
  }

  return toAbsoluteUrl(normalized, origin);
}
