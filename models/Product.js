// Product.js - Mongoose Product Model for AddDirectProduct Page
const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },
  isDirect: { type: Boolean, default: false },
  size: { type: mongoose.Schema.Types.ObjectId, ref: 'Size' },
  color: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
  price: { type: mongoose.Schema.Types.ObjectId, ref: 'Price' },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  description: { type: mongoose.Schema.Types.ObjectId, ref: 'Description' },
  info: { type: mongoose.Schema.Types.ObjectId, ref: 'Info' },
  categoryTag: { type: mongoose.Schema.Types.ObjectId, ref: 'CategoryTag' },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview' },
  quantity: { type: mongoose.Schema.Types.ObjectId, ref: 'Quantity' },
  coupons: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCoupons' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
