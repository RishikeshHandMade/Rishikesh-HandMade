import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OrderSchema = new Schema({
    // Cart and products
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
    // Checkout summary fields
    cartTotal: { type: Number },
    subTotal: { type: Number },
    totalDiscount: { type: Number },
    totalTax: { type: Number },
    shippingCost: { type: Number },
    promoCode: { type: String },
    promoDiscount: { type: Number },
    // Billing/shipping info
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    altPhone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    address: { type: String },
    // Payment/order info
    orderId: { type: String }, // Razorpay or internal order id
    razorpayOrderId: { type: String }, // Razorpay order id 
    transactionId: { type: String, default: '' },
    payment: { type: String }, // 'cod' or 'online'
    status: { type: String, default: "Pending" },
    paymentMethod: { type: String },
    datePurchased: { type: Date, default: Date.now },
    agree: { type: Boolean },
    // Add any additional checkout fields as needed
}, { timestamps: true });

export default mongoose.models.Order || model("Order", OrderSchema);