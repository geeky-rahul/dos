import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import User from "../models/user.js";

// Add Product to Shop
export const addProduct = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, price, offerPrice, description, category } = req.body;

    // Verify shop exists and belongs to user
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Check if user owns this shop
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check subscription
    const user = await User.findById(req.user._id);
    if (new Date(user.subscriptionExpiry) < new Date()) {
      return res.status(403).json({ message: "Subscription expired. Please renew." });
    }

    // Create product
    const product = await Product.create({
      shopId,
      name,
      price,
      offerPrice,
      description,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// Get all products of a shop
export const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const products = await Product.find({ shopId }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("getProductsByShop error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, offerPrice, isOnOffer, description, category, inStock } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify ownership
    const shop = await Shop.findById(product.shopId);
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (typeof name !== "undefined") product.name = name;
    if (typeof price !== "undefined") product.price = price;
    if (typeof offerPrice !== "undefined") product.offerPrice = offerPrice;
    if (typeof isOnOffer !== 'undefined') product.isOnOffer = isOnOffer;
    if (typeof description !== "undefined") product.description = description;
    if (typeof category !== "undefined") product.category = category;
    if (typeof inStock !== 'undefined') product.inStock = inStock;

    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify ownership
    const shop = await Shop.findById(product.shopId);
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Toggle Offer ON/OFF
export const toggleOffer = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isOnOffer } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verify ownership
    const shop = await Shop.findById(product.shopId);
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    product.isOnOffer = isOnOffer;
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error("toggleOffer error:", error);
    res.status(500).json({ message: "Failed to toggle offer" });
  }
};

// Search products (case-insensitive)
export const searchProducts = async (req, res) => {
  try {
    const { q, shopId, offerOnly } = req.query;

    const filter = {};
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }
    if (shopId) {
      filter.shopId = shopId;
    }
    if (offerOnly === 'true') {
      filter.isOnOffer = true;
    }

    const products = await Product.find(filter).limit(100);

    res.status(200).json(products);
  } catch (error) {
    console.error("searchProducts error:", error);
    res.status(500).json({ message: "Failed to search products" });
  }
};
