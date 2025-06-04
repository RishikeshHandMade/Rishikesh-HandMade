import { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  thumb: {
    url: { type: String },
    key: { type: String }
  },
  rating: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default models.Review || model("Review", ReviewSchema);