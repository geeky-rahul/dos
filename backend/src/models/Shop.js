import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    rating: {
      type: String,
      default: '4.0',
    },

    area: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    mapUrl: {
      type: String,
    },

    owner: {
      type: String,
    },

    category: {
      type: String,
      default: 'General',
    },

    offer: {
      type: Number,
      default: 0,
    },

    notice: {
      type: String,
    },

    offers: [String],

    products: [
      {
        name: { type: String },
        price: { type: Number },
        originalPrice: { type: Number },
        description: { type: String },
        inStock: { type: Boolean, default: true },
        tags: [String],
        category: { type: String },
      },
    ],

    contact: {
      phone: String,
      address: String,
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

shopSchema.index({ location: '2dsphere' });

export default mongoose.model('Shop', shopSchema);
