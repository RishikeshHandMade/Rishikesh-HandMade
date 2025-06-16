import mongoose from 'mongoose';

const DistrictStatusSchema = new mongoose.Schema({
  district: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { _id: false });

const ZipCodeSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  districts: [DistrictStatusSchema],
}, { timestamps: true });

export default mongoose.models.ZipCode || mongoose.model('ZipCode', ZipCodeSchema);
