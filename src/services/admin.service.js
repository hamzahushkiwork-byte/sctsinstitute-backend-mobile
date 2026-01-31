import HeroSlide from '../models/HeroSlide.model.js';
import User from '../models/User.model.js';
import * as servicesService from './services.service.js';
import * as coursesService from './courses.service.js';
import * as partnersService from './partners.service.js';
import * as pagesService from './pages.service.js';

// Hero Slides
export async function getAllHeroSlides() {
  return await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean();
}

export async function getHeroSlideById(id) {
  return await HeroSlide.findById(id).lean();
}

export async function createHeroSlide(data) {
  const heroSlide = new HeroSlide(data);
  return await heroSlide.save();
}

export async function updateHeroSlide(id, data) {
  return await HeroSlide.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function deleteHeroSlide(id) {
  return await HeroSlide.findByIdAndDelete(id).lean();
}

// Services
export const getAllServices = servicesService.getAllServices;
export const getServiceById = servicesService.getServiceById;
export const createService = servicesService.createService;
export const updateService = servicesService.updateService;
export const deleteService = servicesService.deleteService;

// Courses
export const getAllCourses = coursesService.getAllCourses;
export const getCourseById = coursesService.getCourseById;
export const createCourse = coursesService.createCourse;
export const updateCourse = coursesService.updateCourse;
export const deleteCourse = coursesService.deleteCourse;

// Partners
export const getAllPartners = partnersService.getAllPartners;
export const getPartnerById = partnersService.getPartnerById;
export const createPartner = partnersService.createPartner;
export const updatePartner = partnersService.updatePartner;
export const deletePartner = partnersService.deletePartner;

// Page Content
export const getAllPageContent = pagesService.getAllPageContent;
export const getPageContentByKey = pagesService.getPageContentByKey;
export const createPageContent = pagesService.createPageContent;
export const updatePageContent = pagesService.updatePageContent;
export const deletePageContent = pagesService.deletePageContent;

// Users
export async function getAllUsers() {
  return await User.find()
    .select('-passwordHash') // Exclude password hash
    .sort({ createdAt: -1 })
    .lean();
}
