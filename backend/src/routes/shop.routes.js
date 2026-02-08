import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import {
  createShop,
  getMyShops,
  getAllShops,
} from "../controllers/shop.controller.js";

const router = express.Router();

// Public: list shops (supports ?category= & ?q=search)
router.get("/", getAllShops);

// Dev-only seed endpoint
router.get('/seed', seedShops);

// Protected: create a shop (owner must be authenticated)
router.post("/", firebaseAuth, createShop);

// Protected: get shops owned by authenticated user
router.get("/my", firebaseAuth, getMyShops);

export default router;
