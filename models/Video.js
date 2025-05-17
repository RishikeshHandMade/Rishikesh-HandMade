import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  videos: [String]
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
