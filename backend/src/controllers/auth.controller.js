import admin from "../config/firebase.js";
import User from "../models/user.js";

const normalizeRole = (role) => {
  if (role === 'shopkeeper') {
    return 'owner';
  }
  return role === 'owner' ? 'owner' : 'user';
};

export const syncUser = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const requestedRole = normalizeRole(req.body?.role);

    // Find user by Firebase UID
    let user = await User.findOne({ uid }).select('+role');

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        uid,
        email,
        name,
        photo: picture,
        role: requestedRole || 'user',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log('New user created with role:', requestedRole || 'user');
    } else if (requestedRole && requestedRole !== normalizeRole(user.role)) {
      // Update role if provided and different
      user.role = requestedRole;
      await user.save();
      console.log('User role updated to:', requestedRole);
    }

    // Return user data with token info
    const userResponse = user.toObject();
    
    res.status(200).json({
      _id: userResponse._id,
      uid: userResponse.uid,
      email: userResponse.email,
      name: userResponse.name,
      phone: userResponse.phone || '',
      role: normalizeRole(userResponse.role),
      photo: userResponse.photo,
      shopProfileComplete: userResponse.shopProfileComplete || false,
    });
  } catch (error) {
    console.error("syncUser error:", error);
    res.status(500).json({ message: "User sync failed", error: error.message });
  }
};

// Debug endpoint - DEV ONLY
export const getUserDebug = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ message: "User not found in database", uid });
    }

    res.status(200).json({
      found: true,
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: normalizeRole(user.role),
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("getUserDebug error:", error);
    res.status(500).json({ message: "Debug check failed", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, email, phone } = req.body;

    // Only update provided fields
    const updateData = {};
    if (typeof name === 'string') updateData.name = name.trim();
    if (typeof email === 'string') updateData.email = email.trim();
    if (typeof phone === 'string') updateData.phone = phone.trim();

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If email is being updated, update Firebase Auth user as well
    if (typeof email === 'string' && email.trim() && email.trim() !== user.email) {
      try {
        await admin.auth().updateUser(uid, { email: email.trim() });
      } catch (firebaseErr) {
        console.warn('Failed to update Firebase Auth email:', firebaseErr.message);
      }
    }

    // Update Mongo DB fields
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: normalizeRole(user.role),
      photo: user.photo,
      shopProfileComplete: user.shopProfileComplete,
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};
