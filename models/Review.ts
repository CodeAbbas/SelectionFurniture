import mongoose, { Schema, models } from 'mongoose';

const reviewSchema = new Schema({
  productId: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Review = models.Review || mongoose.model('Review', reviewSchema);
export default Review;