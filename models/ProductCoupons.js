const mongoose = require('mongoose');

const ProductCouponsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  coupons: [{ type: String, required: true }], // Array of coupon codes
}, { timestamps: true });

module.exports = mongoose.models.ProductCoupons || mongoose.model('ProductCoupons', ProductCouponsSchema);
