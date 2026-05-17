import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Form || mongoose.model('Form', FormSchema);
