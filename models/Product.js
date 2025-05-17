// Product.js - Mongoose Product Model for AddDirectProduct Page
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  title: String,
  description: String,
  date: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: link to user
});

const SizeSchema = new mongoose.Schema({
  label: String, // e.g., 'L', 'M', 'XL', etc.
  checked: Boolean, // for optional sizes
  chartImage: String, // URL or path to size chart image
});

const ColorSchema = new mongoose.Schema({
  name: String, // color name
  value: String, // hex code or description
});

const GalleryImageSchema = new mongoose.Schema({
  url: String, // image URL
  isMain: Boolean, // main or sub photo
});

const VideoSchema = new mongoose.Schema({
  url: String, // video URL (e.g., YouTube)
});

const QualitySchema = new mongoose.Schema({
  size: String, // e.g., 'L', 'M', etc.
  qty: Number,
  color: String,
  optional: Boolean, // true if optional size
});

const ProductSchema = new mongoose.Schema({
  // ProductProfile
  title: { type: String, required: true },
  code: { type: String, required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },

  // Section references
  size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size' },
  color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
  price: { type: mongoose.Schema.Types.ObjectId, ref: 'Price' },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  description: { type: mongoose.Schema.Types.ObjectId, ref: 'Description' },
  info: { type: mongoose.Schema.Types.ObjectId, ref: 'Info' },
  categoryTag: { type: mongoose.Schema.Types.ObjectId, ref: 'CategoryTag' },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview' },
  quality: { type: mongoose.Schema.Types.ObjectId, ref: 'Quality' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
