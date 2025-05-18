import mongoose from 'mongoose';

const SizeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sizes: [{ label: String, checked: Boolean }],
  sizeChartUrl: String
}, { timestamps: true });

export default mongoose.models.Size || mongoose.model('Size', SizeSchema);
