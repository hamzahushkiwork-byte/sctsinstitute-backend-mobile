import { ok, fail } from '../utils/response.js';
import * as cartService from '../services/cart.service.js';
import { toAbsoluteUrl } from '../utils/url.js';

/**
 * Build media object from course imageUrl; omit if no imageUrl.
 */
function buildMedia(imageUrl, title) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return undefined;
  const url = toAbsoluteUrl(imageUrl.trim());
  return {
    url,
    thumbUrl: url,
    mediumUrl: url,
    alt: title != null ? String(title) : '',
    width: null,
    height: null,
  };
}

/**
 * Build a friendly pricing object: { amount, isFree, display, currency }.
 */
function buildPricing(price, currency = 'USD') {
  const num = Number.isFinite(price) ? price : Number(price);
  const amount = Number.isFinite(num) ? num : 0;
  const isFree = amount <= 0;
  return {
    amount,
    isFree,
    currency,
    display: isFree ? 'Free' : `$${amount.toFixed(2)}`,
  };
}

/**
 * Format the cart response with prefix-resolved image URLs and pricing metadata.
 */
function formatCartResponse(cart) {
  if (!cart) return null;
  const items = (cart.items || []).map(item => {
    if (!item.courseId) {
      return {
        course: null,
        sessionDateKey: item.sessionDateKey
      };
    }
    
    const courseDoc = typeof item.courseId.toObject === 'function' ? item.courseId.toObject() : item.courseId;
    const course = { ...courseDoc };
    
    // Resolve direct image URL to absolute URL
    course.imageUrl = toAbsoluteUrl(course.imageUrl);
    course.pricing = buildPricing(course.price);
    
    if (course.imageUrl) {
      course.media = buildMedia(course.imageUrl, course.title);
    }
    
    return {
      course,
      sessionDateKey: item.sessionDateKey
    };
  });
  
  return {
    _id: cart._id,
    userId: cart.userId,
    items,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
}

/**
 * Get the current authenticated user's cart
 */
export async function getCart(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, 401, 'User not authenticated');
    
    const cart = await cartService.getCartWithCourses(userId);
    return ok(res, formatCartResponse(cart));
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to fetch cart');
  }
}

/**
 * Add or update an item in the cart
 */
export async function addItem(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, 401, 'User not authenticated');
    
    const { courseId, sessionDateKey } = req.body;
    if (!courseId) return fail(res, 400, 'Course ID is required');
    
    const cart = await cartService.addToCart(userId, courseId, sessionDateKey || '');
    return ok(res, formatCartResponse(cart), 'Item added to cart successfully');
  } catch (error) {
    if (error.message.includes('Course not found')) {
      return fail(res, 404, error.message);
    }
    return fail(res, 500, error.message || 'Failed to add item to cart');
  }
}

/**
 * Remove an item from the cart
 */
export async function removeItem(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, 401, 'User not authenticated');
    
    const { courseId } = req.params;
    if (!courseId) return fail(res, 400, 'Course ID is required');
    
    const cart = await cartService.removeFromCart(userId, courseId);
    return ok(res, formatCartResponse(cart), 'Item removed from cart successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to remove item from cart');
  }
}

/**
 * Clear the cart
 */
export async function clearCart(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, 401, 'User not authenticated');
    
    const cart = await cartService.clearCart(userId);
    return ok(res, formatCartResponse(cart), 'Cart cleared successfully');
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to clear cart');
  }
}

/**
 * Checkout and register for all courses in the cart
 */
export async function checkout(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return fail(res, 401, 'User not authenticated');
    
    const registrations = await cartService.checkoutCart(userId);
    return ok(res, registrations, 'Checkout successful, registered for courses');
  } catch (error) {
    if (error.message === 'Cart is empty') {
      return fail(res, 400, error.message);
    }
    if (error.message.startsWith('You are already registered')) {
      return fail(res, 409, error.message);
    }
    return fail(res, 500, error.message || 'Checkout failed');
  }
}
