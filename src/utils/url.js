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
