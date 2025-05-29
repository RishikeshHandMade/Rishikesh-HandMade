import { Schema, models, model } from "mongoose";

const PromotinalBannerSchema = new Schema({
    title: { type: String},
    coupon: { type: String},
    buttonLink: { type: String},
    image: { url: { type: String }, key: { type: String } },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.PromotinalBanner || model("PromotinalBanner", PromotinalBannerSchema);