const mongoose = require('mongoose');

const ProductCouponsSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  coupons: {
    couponCode: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    percent: { type: Number },
    amount: { type: Number }
  }, // Array of coupon objects
}, { timestamps: true });

module.exports = mongoose.models.ProductCoupons || mongoose.model('ProductCoupons', ProductCouponsSchema);
