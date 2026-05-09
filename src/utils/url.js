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

/**
 * Rewrite any reference to `/uploads/...` to use `staticOrigin` (canonical file host).
 * - Full URLs like https://other-host/uploads/file.mp4 → https://staticOrigin/uploads/file.mp4
 * - Paths /uploads/... or bare filenames → same under staticOrigin
 * - Full URLs with no /uploads/ path are returned unchanged (external CDN).
 * @param {string} pathOrUrl
 * @param {string} staticOrigin - e.g. https://sctsinstitute-backend-production.up.railway.app
 * @returns {string|null} null if staticOrigin is empty
 */
export function resolveUploadsPublicUrl(pathOrUrl, staticOrigin) {
  const origin = (staticOrigin || '').trim().replace(/\/$/, '').replace(/\/uploads$/i, '');
  if (!origin) return null;

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
