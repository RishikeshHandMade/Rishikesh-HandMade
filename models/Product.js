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

  // SizeManagement
  sizes: [SizeSchema],

  // ColorManagement
  colors: [ColorSchema],
  colorStyle: String, // style1, style2, etc.

  // PriceDiscount
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  priceStyle: String, // style1, style2, etc.

  // ProductGallery
  gallery: [GalleryImageSchema],

  // VideoManagement
  videos: [VideoSchema],

  // ProductDescription
  titleTag: String,
  description: String,

  // ProductInfo
  overview: String,

  // CategoryTag
  tagMenu: String, // style1, style2, etc.
  subCategory: String,

  // CreateReview
  reviews: [ReviewSchema],

  // QualityManagement
  quality: [QualitySchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
