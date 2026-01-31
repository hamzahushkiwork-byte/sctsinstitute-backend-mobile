import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    innerImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
  }
);

// Force delete existing model to ensure fresh schema
if (mongoose.models.Service) {
  delete mongoose.models.Service;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Service) {
  delete mongoose.modelSchemas.Service;
}

const Service = mongoose.model('Service', serviceSchema);

export default Service;
