const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
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

    notice: {
      type: String,
    },

    offers: [
      {
        type: String,
      },
    ],

    products: [
      {
        name: String,
        price: String,
      },
    ],

    contact: {
      phone: String,
      address: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
