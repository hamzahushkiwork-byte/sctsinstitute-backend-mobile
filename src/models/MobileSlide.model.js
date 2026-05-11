import mongoose from 'mongoose';

const mobileSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      default: '',
      trim: true,
    },
    /** Stored relative path, e.g. /uploads/mobile-slides/<filename>. */
    images: {
      type: String,
      required: true,
      trim: true,
    },
    /** Click action target: course | certificate | null (informational). */
    type: {
      type: String,
      enum: ['course', 'certificate', null],
      default: null,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificationService',
      default: null,
    },
    order: {
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

mobileSlideSchema.index({ order: 1, isActive: 1 });

if (mongoose.models.MobileSlide) {
  delete mongoose.models.MobileSlide;
}
if (mongoose.modelSchemas?.MobileSlide) {
  delete mongoose.modelSchemas.MobileSlide;
}

const MobileSlide = mongoose.model('MobileSlide', mobileSlideSchema);

export default MobileSlide;
