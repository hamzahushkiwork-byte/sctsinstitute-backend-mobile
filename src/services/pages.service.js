import PageContent from '../models/PageContent.model.js';

export async function getPageContent(key) {
  return await PageContent.findOne({ key, isActive: true }).lean();
}

export async function getAllPageContent() {
  return await PageContent.find().sort({ key: 1 }).lean();
}

export async function getPageContentByKey(key) {
  return await PageContent.findOne({ key }).lean();
}

export async function createPageContent(data) {
  const pageContent = new PageContent(data);
  return await pageContent.save();
}

export async function updatePageContent(key, data) {
  return await PageContent.findOneAndUpdate({ key }, data, { new: true, runValidators: true }).lean();
}

export async function deletePageContent(key) {
  return await PageContent.findOneAndDelete({ key }).lean();
}
