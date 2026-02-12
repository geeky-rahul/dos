import User from "../models/user.js";

export const syncUser = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;
    const { role } = req.body;

    // Find user by Firebase UID
    let user = await User.findOne({ uid }).select('+role');

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        uid,
        email,
        name,
        photo: picture,
        role: role || 'user',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log('New user created with role:', role || 'user');
    } else if (role && role !== user.role) {
      // Update role if provided and different
      user.role = role;
      await user.save();
      console.log('User role updated to:', role);
    }

    // Return user data with token info
    const userResponse = user.toObject();
    
    res.status(200).json({
      _id: userResponse._id,
      uid: userResponse.uid,
      email: userResponse.email,
      name: userResponse.name,
      role: userResponse.role,
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
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("getUserDebug error:", error);
    res.status(500).json({ message: "Debug check failed", error: error.message });
  }
};
