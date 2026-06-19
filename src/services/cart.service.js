import Cart from '../models/Cart.model.js';
import Course from '../models/Course.model.js';
import CourseRegistration from '../models/CourseRegistration.model.js';
import * as courseRegistrationService from './courseRegistration.service.js';

export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

export async function getCartWithCourses(userId) {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: 'items.courseId',
    select: 'title slug cardBody imageUrl isAvailable price availableDates sessionTime location',
    model: 'Course'
  });
  return cart;
}

export async function addToCart(userId, courseId, sessionDateKey = '') {
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    throw new Error('Course not found or inactive');
  }

  const cart = await getOrCreateCart(userId);
  const existingItemIndex = cart.items.findIndex(item => item.courseId.toString() === courseId.toString());

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].sessionDateKey = sessionDateKey;
  } else {
    cart.items.push({ courseId, sessionDateKey });
  }

  await cart.save();
  return getCartWithCourses(userId);
}

export async function removeFromCart(userId, courseId) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter(item => item.courseId.toString() !== courseId.toString());
  await cart.save();
  return getCartWithCourses(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
}

export async function checkoutCart(userId) {
  const cart = await getOrCreateCart(userId);
  if (!cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Pre-validate registrations to prevent partial registration errors
  for (const item of cart.items) {
    const existingRegistration = await CourseRegistration.findOne({
      courseId: item.courseId,
      userId,
      status: { $in: ['pending', 'paid'] }
    });

    if (existingRegistration) {
      const course = await Course.findById(item.courseId).select('title').lean();
      throw new Error(`You are already registered for course: ${course ? course.title : 'Selected course'}`);
    }
  }

  // Register for all courses in cart
  const registrations = [];
  for (const item of cart.items) {
    const registration = await courseRegistrationService.registerForCourse(
      item.courseId,
      userId,
      item.sessionDateKey
    );
    registrations.push(registration);
  }

  // Clear the cart
  cart.items = [];
  await cart.save();

  return registrations;
}
