import mongoose, { Schema, models } from 'mongoose';

const productSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  
  // Storing categories as arrays of strings
  categories: { type: [String], default: [] },
  subcategories: { type: [String], default: [] },
  
  description: { type: String },
  long_description: { type: String },
  
  price: { type: Number, required: true },
  original_price: { type: Number },
  currency: { type: String, default: 'GBP' },
  
  rating: { type: Number, default: 5 },
  
  gallery: { type: [String], default: [] },
  
  is_new_arrival: { type: Boolean, default: false },
  is_best_seller: { type: Boolean, default: false },
  
  actions: { type: [String], default: ["heart", "eye", "repeat", "bag"] },
  badges: { type: [Object], default: [] } // For flexible badge objects
}, {
  timestamps: true 
});

// Prevent model overwrite error in Next.js hot reloading
const Product = models.Product || mongoose.model('Product', productSchema);

export default Product;