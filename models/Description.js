import mongoose from 'mongoose';

const DescriptionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  titleTag: String,
  description: String,
}, { timestamps: true });

export default mongoose.models.Description || mongoose.model('Description', DescriptionSchema);
