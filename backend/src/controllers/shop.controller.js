const Shop = require('../models/Shop');

// GET ALL SHOPS
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();

    res.status(200).json({
      message: 'Shops fetched successfully',
      shops,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADD NEW SHOP (DUMMY / ADMIN USE)
exports.addShop = async (req, res) => {
  try {
    const shop = await Shop.create(req.body);

    res.status(201).json({
      message: 'Shop added successfully',
      shop,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
