import mongoose from 'mongoose';

const QualitySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // Optionally associate quality checks with specific size/color variants
  variants: [
    {
      size: String,
      color: String,
      qualityChecks: [{ label: String, passed: Boolean }]
    }
  ],
  // Fallback for general (non-variant) product-level checks
  qualityChecks: [{ label: String, passed: Boolean }]
}, { timestamps: true });

export default mongoose.models.Quality || mongoose.model('Quality', QualitySchema);
