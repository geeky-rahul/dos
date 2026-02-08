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
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
