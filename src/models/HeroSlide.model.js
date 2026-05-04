import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
    },
    buttonLink: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    test: {
      type: String,
      default: "test",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("HeroSlide", heroSlideSchema);
