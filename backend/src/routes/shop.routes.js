import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import {
  createShop,
  getMyShops,
  getAllShops,
  seedShops,
  getNearbyShops,
  getShopById,
} from "../controllers/shop.controller.js";

const router = express.Router();

// 🔓 Public: list all shops (supports ?category= & ?q=search)
router.get("/", getAllShops);

// 🔓 Public: nearby shops (2dsphere)
router.get("/nearby", getNearbyShops);

// 🔓 Public: get single shop by ID
router.get("/:shopId", getShopById);

// 🛠 Dev-only: seed shops
router.get("/seed", seedShops);

// 🔐 Protected: create a shop
router.post("/", firebaseAuth, createShop);

// 🔐 Protected: get shops owned by logged-in user
router.get("/my", firebaseAuth, getMyShops);

export default router;
