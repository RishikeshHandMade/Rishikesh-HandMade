import mongoose from 'mongoose';

const InfoSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  info: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Info || mongoose.model('Info', InfoSchema);
