import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import User from "../models/user.js";

const attachProductsToShops = async (shops) => {
  if (!Array.isArray(shops) || shops.length === 0) {
    return shops || [];
  }

  const shopIds = shops.map((shop) => shop._id);
  const products = await Product.find({ shopId: { $in: shopIds } })
    .sort({ createdAt: -1 })
    .lean();

  const productsByShop = new Map();
  for (const product of products) {
    const key = String(product.shopId);
    if (!productsByShop.has(key)) {
      productsByShop.set(key, []);
    }
    productsByShop.get(key).push(product);
  }

  return shops.map((shop) => ({
    ...shop,
    products:
      productsByShop.get(String(shop._id)) ||
      (Array.isArray(shop.products) ? shop.products : []),
  }));
};

/**
 * CREATE SHOP (Owner only)
 */
export const createShop = async (req, res) => {
  try {
    // Check if user already has a shop
    const existingShop = await Shop.findOne({ ownerId: req.user._id });
    if (existingShop) {
      return res.status(400).json({ message: "You can only create one shop" });
    }

    // Check subscription
    const user = await User.findById(req.user._id);
    if (new Date(user.subscriptionExpiry) < new Date()) {
      return res.status(403).json({ message: "Subscription expired. Please renew." });
    }

    const rawAddress =
      req.body?.contact?.address || req.body?.address || "";
    const addressParts = String(rawAddress)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const normalizedArea =
      (req.body?.area || "").trim() ||
      (addressParts.length >= 3
        ? addressParts[addressParts.length - 3]
        : addressParts[0] || "General");

    const normalizedCity =
      (req.body?.city || "").trim() ||
      (addressParts.length >= 2
        ? addressParts[addressParts.length - 2]
        : addressParts[addressParts.length - 1] || "Unknown");

    const normalizedName = (req.body?.name || "").trim();
    if (!normalizedName) {
      return res.status(400).json({ message: "Shop name is required" });
    }

    const normalizedMapUrl =
      typeof req.body?.mapUrl === "string" ? req.body.mapUrl.trim() : "";
    const parsedOffer = parseInt(req.body?.offer, 10);
    const normalizedOffer =
      !isNaN(parsedOffer) && parsedOffer >= 0 && parsedOffer <= 100
        ? parsedOffer
        : 0;
    const parsedRating = parseFloat(req.body?.rating);
    const normalizedRating =
      !isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5
        ? parsedRating.toFixed(1)
        : "4.0";

    const shopData = {
      ownerId: req.user._id,
      ...req.body,
      name: normalizedName,
      area: normalizedArea,
      city: normalizedCity,
      rating: normalizedRating,
      offer: normalizedOffer,
      mapUrl: normalizedMapUrl || undefined,
      notice: typeof req.body?.notice === "string" ? req.body.notice.trim() : "",
      openTime: req.body?.openTime || "09:00",
      closeTime: req.body?.closeTime || "21:00",
      isOpen: typeof req.body?.isOpen === "boolean" ? req.body.isOpen : true,
    };

    // Optional: if frontend sends lat/lng
    if (req.body.lat && req.body.lng) {
      shopData.location = {
        type: "Point",
        coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
      };
    }

    const shop = await Shop.create(shopData);
    // Mark owner user as having completed shop profile
    try {
      await User.findByIdAndUpdate(req.user._id, { shopProfileComplete: true });
    } catch (e) {
      console.warn('Failed to update user shopProfileComplete', e.message);
    }

    res.status(201).json(shop);
  } catch (err) {
    console.error("createShop error", err);
    if (err?.name === "ValidationError") {
      const details = Object.values(err.errors || {})
        .map((e) => e.message)
        .filter(Boolean)
        .join(", ");
      return res.status(400).json({
        message: details || "Invalid shop details",
      });
    }
    res.status(500).json({ message: "Failed to create shop" });
  }
};

/**
 * UPDATE LOGGED-IN OWNER SHOP DETAILS
 */
export const updateMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const updates = {};
    if (typeof req.body.shopName === "string" || typeof req.body.name === "string") {
      updates.name = (req.body.shopName || req.body.name || "").trim();
    }
    if (typeof req.body.category === "string") {
      updates.category = req.body.category.trim() || "General";
    }
    if (typeof req.body.area === "string") {
      updates.area = req.body.area.trim() || shop.area;
    }
    if (typeof req.body.city === "string") {
      updates.city = req.body.city.trim() || shop.city;
    }
    if (typeof req.body.phone === "string") {
      updates.contact = {
        ...(shop.contact || {}),
        phone: req.body.phone.trim(),
      };
    }
    if (typeof req.body.address === "string") {
      updates.contact = {
        ...(updates.contact || shop.contact || {}),
        address: req.body.address.trim(),
      };
    }
    if (typeof req.body.rating === "string") {
      const rating = parseFloat(req.body.rating);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        updates.rating = req.body.rating;
      }
    }
    if (typeof req.body.offer === "string" || typeof req.body.offer === "number") {
      const offer = parseInt(req.body.offer);
      if (!isNaN(offer) && offer >= 0 && offer <= 100) {
        updates.offer = offer;
      }
    }
    if (typeof req.body.mapUrl === "string") {
      updates.mapUrl = req.body.mapUrl.trim() || null;
    }
    if (typeof req.body.notice === "string") {
      updates.notice = req.body.notice.trim();
    }

    if (!updates.name) {
      updates.name = shop.name;
    }

    await Shop.findByIdAndUpdate(shop._id, updates, { runValidators: true });
    const updated = await Shop.findById(shop._id);
    return res.json(updated);
  } catch (err) {
    console.error("updateMyShop error", err);
    if (err?.name === "ValidationError") {
      const details = Object.values(err.errors || {})
        .map((e) => e.message)
        .filter(Boolean)
        .join(", ");
      return res.status(400).json({ message: details || "Invalid shop details" });
    }
    return res.status(500).json({ message: "Failed to update shop" });
  }
};

/**
 * UPDATE SHOP TIMINGS (OWNER)
 */
export const updateMyShopTimings = async (req, res) => {
  try {
    const { openTime, closeTime } = req.body;
    if (!openTime || !closeTime) {
      return res.status(400).json({ message: "openTime and closeTime are required" });
    }

    const shop = await Shop.findOneAndUpdate(
      { ownerId: req.user._id },
      { openTime, closeTime },
      { new: true, runValidators: true },
    );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.json(shop);
  } catch (err) {
    console.error("updateMyShopTimings error", err);
    return res.status(500).json({ message: "Failed to update timings" });
  }
};

/**
 * TOGGLE SHOP OPEN/CLOSED (OWNER)
 */
export const toggleMyShopOpen = async (req, res) => {
  try {
    if (typeof req.body?.isOpen !== "boolean") {
      return res.status(400).json({ message: "isOpen must be boolean" });
    }

    const shop = await Shop.findOneAndUpdate(
      { ownerId: req.user._id },
      { isOpen: req.body.isOpen },
      { new: true },
    );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.json(shop);
  } catch (err) {
    console.error("toggleMyShopOpen error", err);
    return res.status(500).json({ message: "Failed to update shop status" });
  }
};

/**
 * GET SHOPS CREATED BY LOGGED-IN USER
 */
export const getMyShops = async (req, res) => {
  try {
    const shops = await Shop.find({ ownerId: req.user._id }).lean();
    const shopsWithProducts = await attachProductsToShops(shops);
    res.json(shopsWithProducts);
  } catch (err) {
    console.error("getMyShops error", err);
    res.status(500).json({ message: "Failed to fetch your shops" });
  }
};

/**
 * GET ALL SHOPS (SEARCH + CATEGORY)
 */
export const getAllShops = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (q)
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { area: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ];

    const shops = await Shop.find(filter).limit(200).lean();
    const shopsWithProducts = await attachProductsToShops(shops);
    return res.json({ shops: shopsWithProducts });
  } catch (err) {
    console.error("getAllShops error", err);
    return res.status(500).json({ message: "Failed to fetch shops" });
  }
};

/**
 * GET NEARBY SHOPS (2dsphere query)
 */
export const getNearbyShops = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng required" });
    }

    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000, // 5 KM
        },
      },
    });

    res.json({ shops });
  } catch (err) {
    console.error("getNearbyShops error", err);
    res.status(500).json({ message: "Failed to fetch nearby shops" });
  }
};

/**
 * GET SINGLE SHOP BY ID
 */
export const getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId).lean();
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const [shopWithProducts] = await attachProductsToShops([shop]);
    res.json(shopWithProducts);
  } catch (err) {
    console.error("getShopById error", err);
    res.status(500).json({ message: "Failed to fetch shop" });
  }
};
