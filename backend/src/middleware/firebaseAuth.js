import admin from "../config/firebase.js";
import User from "../models/user.js";

const firebaseAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      user = await User.create({
        uid: decoded.uid,
        email: decoded.email || `${decoded.uid}@noemail.local`,
        name: decoded.name || decoded.email || "User",
      });
    }

    req.user = {
      ...decoded,
      _id: user._id,
      uid: user.uid || decoded.uid,
      email: user.email || decoded.email,
      name: user.name || decoded.name,
      role: user.role,
      shopProfileComplete: user.shopProfileComplete,
    };
    next();
  } catch (err) {
    console.error("firebaseAuth error:", err);
    const message =
      process.env.NODE_ENV === "production"
        ? "Invalid token"
        : `Invalid token: ${err.message}`;
    res.status(401).json({ message });
  }
};

export default firebaseAuth;
