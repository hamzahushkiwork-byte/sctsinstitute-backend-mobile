import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  sessionDateKey: {
    type: String,
    trim: true,
    default: '',
  },
}, { _id: false });

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Cart) {
  delete mongoose.models.Cart;
}

export default mongoose.model('Cart', cartSchema);
