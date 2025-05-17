import mongoose from 'mongoose';

const QualitySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qualityChecks: [{ label: String, passed: Boolean }]
}, { timestamps: true });

export default mongoose.models.Quality || mongoose.model('Quality', QualitySchema);
