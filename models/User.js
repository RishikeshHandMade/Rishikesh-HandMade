import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        dateOfBirth: { type: Date },
        postalCode: { type: Number },
        image: { type: String },
        provider: { type: String, required: true },
        reviews: { type: [Schema.Types.ObjectId], ref: "Review" },
        packages: { type: [Schema.Types.ObjectId], ref: "Package" },
        orders: { type: [Schema.Types.ObjectId], ref: "Order" },
        isVerified: { type: Boolean, default: false },
        otp: { type: Number },
        isOtpVerified: { type: Boolean, default: false },
        resetPasswordOtp: { type: Number },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

export default models.User || model("User", UserSchema);
