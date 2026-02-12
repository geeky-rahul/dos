import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
    },

    isOnOffer: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    category: {
      type: String,
      default: 'General',
    },

    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
