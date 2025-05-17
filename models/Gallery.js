import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  mainImage: { type: String, required: true },
  subImages: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
