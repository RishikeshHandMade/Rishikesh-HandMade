import mongoose from 'mongoose';

// ProductTagLine: Associates multiple highlights with a product.
const ProductTagSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    unique: true // Ensure one document per product
  },
  highlights: {
    type: [{
      type: String,
      trim: true
    }],
    default: [],
    validate: {
      validator: function(v) {
        // Ensure at least one highlight is provided if tagLine is not set
        return v.length > 0 || this.tagLine;
      },
      message: 'At least one highlight is required if tagLine is not provided'
    }
  }
}, { 
  timestamps: true,
});

// Add a pre-save hook to ensure at least one of tagLine or highlights is provided
ProductTagSchema.pre('save', function(next) {
  if ((!this.tagLine || this.tagLine.trim() === '') && 
      (!this.highlights || this.highlights.length === 0)) {
    const error = new Error('At least one highlight or tagLine is required');
    return next(error);
  }
  next();
});

// Add a static method to find or create a product tag line
export default mongoose.models.ProductTagLine || mongoose.model('ProductTagLine', ProductTagSchema);
