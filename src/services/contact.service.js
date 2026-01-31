import ContactMessage from '../models/ContactMessage.model.js';

export async function submitContact(data) {
  const contactMessage = new ContactMessage(data);
  return await contactMessage.save();
}

export async function getAllContactMessages() {
  return await ContactMessage.find().sort({ createdAt: -1 }).lean();
}

export async function getContactMessageById(id) {
  return await ContactMessage.findById(id).lean();
}

export async function updateContactMessage(id, data) {
  return await ContactMessage.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}
