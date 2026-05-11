import mongoose from 'mongoose';

const trendingCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      unique: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    /** Optional custom price override for trending display. null = use course price. */
    price: {
      type: Number,
      default: null,
      min: 0,
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

trendingCourseSchema.index({ order: 1, isActive: 1 });
trendingCourseSchema.index({ order: 1, createdAt: -1 });

if (mongoose.models.TrendingCourse) {
  delete mongoose.models.TrendingCourse;
}
if (mongoose.modelSchemas?.TrendingCourse) {
  delete mongoose.modelSchemas.TrendingCourse;
}

const TrendingCourse = mongoose.model('TrendingCourse', trendingCourseSchema);

export default TrendingCourse;
