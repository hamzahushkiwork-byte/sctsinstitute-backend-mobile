/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to slugify
 * @returns {string} - Slugified string
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param {string} baseSlug - Base slug to make unique
 * @param {Function} checkExists - Async function that checks if slug exists: (slug) => Promise<boolean>
 * @param {string} excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists, excludeId = null) {
  if (!baseSlug) {
    throw new Error('Base slug is required');
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists (excluding current document if updating)
  const exists = await checkExists(slug, excludeId);
  
  if (!exists) {
    return slug;
  }
  
  // Append -1, -2, etc. until we find a unique slug
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;
    const candidateExists = await checkExists(candidateSlug, excludeId);
    
    if (!candidateExists) {
      return candidateSlug;
    }
    
    counter++;
    
    // Safety limit to prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
}
