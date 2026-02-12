import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'shopkeeper'],
      default: 'user',
    },
    // Subscription fields for shopkeepers
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    phone: {
      type: String,
    },
    // Whether shop owner completed their shop profile
    shopProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
