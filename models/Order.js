import mongoose from "mongoose";
const { Schema, model } = mongoose;

const OrderSchema = new Schema({
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    transactionId: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    extraAddressInfo: { type: String },
    totalPerson: { type: Number, required: true },
    instructions: { type: String },
    departureLocation: { type: String, required: true },
    travelDate: { type: Date, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    chatStatus: { type: String, default: "Pending" },
    paymentMethod: { type: String },
    bank: { type: String },
    cardType: { type: String },
    heliFormData: {
        numPassengers: { type: Number },
        numAdults: { type: Number },
        numChildren: { type: Number },
        numInfants: { type: Number },
        adults: [{
            fullName: { type: String },
            age: { type: Number },
            weight: { type: Number },
            idProof: {
                url: { type: String },
                key: { type: String }
            }
        }],
        children: [{
            fullName: { type: String },
            age: { type: Number },
            weight: { type: Number },
            idProof: {
                url: { type: String },
                key: { type: String }
            }
        }],
        infants: [{
            fullName: { type: String },
            age: { type: Number },
            weight: { type: Number },
            idProof: {
                url: { type: String },
                key: { type: String }
            }
        }],
        pickupLocation: { type: String },
        dropoffLocation: { type: String },
        medicalRequirements: { type: String },
        specialRequirements: { type: String },
    }
}, { timestamps: true });

export default mongoose.models.Order || model("Order", OrderSchema);