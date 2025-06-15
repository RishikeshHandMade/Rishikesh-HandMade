const mongoose = require('mongoose');

const shippingChargeSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{6}$/.test(v);
            },
            message: props => `${props.value} is not a valid 6-digit pincode`
        }
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    shippingCharge: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes for faster querying
shippingChargeSchema.index({ pincode: 1 });
shippingChargeSchema.index({ state: 1, district: 1 });

const ShippingCharge = mongoose.model('ShippingCharge', shippingChargeSchema);

module.exports = ShippingCharge;