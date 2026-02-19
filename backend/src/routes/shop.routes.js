import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import {
  createShop,
  getMyShops,
  getAllShops,
  seedShops,
  getNearbyShops,
  getShopById,
  updateMyShop,
  updateMyShopTimings,
  toggleMyShopOpen,
} from "../controllers/shop.controller.js";

const router = express.Router();

router.get("/", getAllShops);
router.get("/nearby", getNearbyShops);
router.get("/seed", seedShops);

router.post("/", firebaseAuth, createShop);
router.get("/my", firebaseAuth, getMyShops);
router.put("/update", firebaseAuth, updateMyShop);
router.put("/timings", firebaseAuth, updateMyShopTimings);
router.put("/toggle-open", firebaseAuth, toggleMyShopOpen);

router.get("/:shopId", getShopById);

export default router;
