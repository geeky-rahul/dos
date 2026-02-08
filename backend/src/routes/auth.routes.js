import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import { syncUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/me", firebaseAuth, syncUser);

export default router;
