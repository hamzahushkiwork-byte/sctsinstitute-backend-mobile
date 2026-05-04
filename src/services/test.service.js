import Test from '../models/Test.model.js';

export async function getActiveTests() {
  return await Test.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
}

export async function getAllTests() {
  return await Test.find().sort({ order: 1, createdAt: -1 }).lean();
}

export async function getTestById(id) {
  return await Test.findById(id).lean();
}

export async function createTest(data) {
  const test = new Test(data);
  return await test.save();
}

export async function updateTest(id, data) {
  return await Test.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
}

export async function deleteTest(id) {
  return await Test.findByIdAndDelete(id).lean();
}
