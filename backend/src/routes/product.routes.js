import express from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";
import {
  addProduct,
  getProductsByShop,
  updateProduct,
  deleteProduct,
  toggleOffer,
  searchProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// 🔓 Public: Search products with filters
router.get("/search", searchProducts);

// 🔓 Public: Get all products of a shop
router.get("/shop/:shopId", getProductsByShop);

// 🔐 Protected: Add product to shop
router.post("/shop/:shopId", firebaseAuth, addProduct);

// 🔐 Protected: Update product
router.put("/:productId", firebaseAuth, updateProduct);

// 🔐 Protected: Delete product
router.delete("/:productId", firebaseAuth, deleteProduct);

// 🔐 Protected: Toggle offer
router.patch("/:productId/offer", firebaseAuth, toggleOffer);

export default router;
