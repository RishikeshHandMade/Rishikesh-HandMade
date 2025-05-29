import { Schema, models, model } from "mongoose";

const HeroBannerSchema = new Schema({
    title: { type: String},
    price: { type: String},
    coupon: { type: String},
    addtoCartLink: { type: String},
    viewDetailLink: { type: String},
    subtitle: { type: String},
    subDescription: { type: String},
    image: { url: { type: String }, key: { type: String } },
    order: { type: Number, required: true },
}, { timestamps: true });

export default models.HeroBanner || model("HeroBanner", HeroBannerSchema);