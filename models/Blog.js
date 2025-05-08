import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDesc: { type: String },
  url: { type: String, required: true },
  date: { type: Date, required: true },
  nameCode: { type: String }, // for Type Name Code
  role: { type: String }, // for Select Role
  image: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
