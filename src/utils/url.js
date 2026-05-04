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
 * - Otherwise prefix with baseUrl (no double slashes).
 * @param {string} url - Path (e.g. /uploads/foo.jpg) or full URL
 * @param {string} baseUrl - Base URL with no trailing slash (e.g. https://api.example.com)
 * @returns {string} Absolute URL
 */
export function toAbsoluteUrl(url, baseUrl) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (!baseUrl || typeof baseUrl !== 'string') return trimmed;
  const base = baseUrl.replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
