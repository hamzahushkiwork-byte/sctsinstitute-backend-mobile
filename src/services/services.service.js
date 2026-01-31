import Service from '../models/Service.model.js';

export async function getServices() {
  return await Service.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .select('title slug shortDescription cardImage order')
    .lean();
}

export async function getServiceBySlug(slug) {
  return await Service.findOne({ slug, isActive: true }).lean();
}

export async function getAllServices() {
  return await Service.find().sort({ order: 1, createdAt: -1 }).lean();
}

export async function getServiceById(id) {
  return await Service.findById(id).lean();
}

export async function createService(data) {
  const service = new Service(data);
  return await service.save();
}

export async function updateService(id, data) {
  return await Service.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function deleteService(id) {
  return await Service.findByIdAndDelete(id).lean();
}
