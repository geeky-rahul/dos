import User from "../models/user.js";

export const syncUser = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user;

    let user = await User.findOne({ uid });

    if (!user) {
      user = await User.create({
        uid,
        email,
        name,
        photo: picture,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "User sync failed" });
  }
};
