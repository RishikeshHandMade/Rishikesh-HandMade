import { Schema, models, model } from "mongoose";

const HeroBannerSchema = new Schema({
    title: { type: String},
    subTitle: { type: String},
    image: { url: { type: String }, key: { type: String } },
    link: { type: String, required: true },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.HeroBanner || model("HeroBanner", HeroBannerSchema);