import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v || typeof v !== 'string') return false;
          const trimmed = v.trim();
          if (!trimmed) return false;
          // Basic URL validation - allow http://, https://, or just domain
          try {
            // If it doesn't start with http:// or https://, add https://
            const urlToValidate = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
              ? trimmed 
              : `https://${trimmed}`;
            new URL(urlToValidate);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Link must be a valid URL (e.g., https://example.com or example.com)'
      }
    },
    logoUrl: {
      type: String,
      required: true,
      trim: true,
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
    strict: true, // Only save fields defined in schema
    strictQuery: true, // Only query fields defined in schema
  }
);

// Force delete existing model to ensure fresh schema
// This prevents Mongoose from using cached models with old schemas
if (mongoose.models.Partner) {
  delete mongoose.models.Partner;
}
if (mongoose.modelSchemas && mongoose.modelSchemas.Partner) {
  delete mongoose.modelSchemas.Partner;
}

// Create model - Mongoose will use the new schema
const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
