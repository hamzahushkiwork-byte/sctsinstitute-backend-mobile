import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
    },
    contentJson: {
      type: mongoose.Schema.Types.Mixed,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pageContentSchema.index({ key: 1 }, { unique: true });

export default mongoose.model('PageContent', pageContentSchema);



