import { Schema, models, model } from "mongoose";

const ConsultancyBannerSchema = new Schema({
    title: { type: String },
    buttonLink: { type: String },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    shortDescription: { type: String },
    image: { url: { type: String }, key: { type: String } },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.ConsultancyBanner || model("ConsultancyBanner", ConsultancyBannerSchema);