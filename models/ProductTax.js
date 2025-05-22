const mongoose = require('mongoose');

const ProductTaxSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  taxes: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.models.ProductTax || mongoose.model('ProductTax', ProductTaxSchema);
