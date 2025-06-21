import mongoose from 'mongoose';

const ProductTagSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  tagLine: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.ProductTagLine || mongoose.model('ProductTagLine', ProductTagSchema);
