import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OrderSchema = new Schema({
    // For product orders only
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: "Product" },
            name: { type: String },
            qty: { type: Number },
            price: { type: Number },
            image: { url: String, key: String },
            color: { type: String },
            size: { type: String }
        }
    ],
    orderId: { type: String, required: true }, // Razorpay order id
    transactionId: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: Number },
    address: { type: String },
    amount: { type: Number },
    status: { type: String, default: "Pending" },
    paymentMethod: { type: String },
    bank: { type: String },
    cardType: { type: String }
}, { timestamps: true });

export default mongoose.models.Order || model("Order", OrderSchema);