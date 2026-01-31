import mongoose from 'mongoose';

const certificationServiceSchema = new mongoose.Schema(
  {
    title: {
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
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    heroSubtitle: {
      type: String,
      trim: true,
      default: '',
    },
    cardImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    heroImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    innerImageUrl: {
      type: String,
      trim: true,
      default: '',
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
if (mongoose.models.CertificationService) {
  delete mongoose.models.CertificationService;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.CertificationService) {
  delete mongoose.modelSchemas.CertificationService;
}

const CertificationService = mongoose.model('CertificationService', certificationServiceSchema);

export default CertificationService;
