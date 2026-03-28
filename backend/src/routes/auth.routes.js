import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import { syncUser, getUserDebug, updateProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/me", firebaseAuth, syncUser);
router.put("/profile", firebaseAuth, updateProfile);

// Debug endpoint - DEV ONLY - Check user data in database
router.get("/debug/user", firebaseAuth, getUserDebug);

export default router;
