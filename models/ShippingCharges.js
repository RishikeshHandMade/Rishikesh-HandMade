import mongoose from 'mongoose';

const ShippingChargeSchema = new mongoose.Schema({
    state: {
      type: String,
      required: true,
      trim: true
    },
    districts: [{
      district: {
        type: String,
        required: true,
        trim: true
      },
      pincodes: [{
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
        shippingCharges: [{
          weight: {
            type: Number,
            required: true,
            min: 0,
            default: 0
          },
          shippingCharge: {
            type: Number,
            required: true,
            min: 0,
            default: 0
          }
        }]
      }]
    }],
  }, { timestamps: true });
export default mongoose.models.ShippingCharge || mongoose.model('ShippingCharge', ShippingChargeSchema);