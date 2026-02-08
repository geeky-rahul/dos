import Shop from "../models/Shop.js";

export const createShop = async (req, res) => {
  const shop = await Shop.create({
    ...req.body,
    owner: req.user.uid,
  });

  res.status(201).json(shop);
};

export const getMyShops = async (req, res) => {
  const shops = await Shop.find({ owner: req.user.uid });
  res.json(shops);
};

export const getAllShops = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { area: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
      { 'products.name': { $regex: q, $options: 'i' } },
    ];

    const shops = await Shop.find(filter).limit(200);
    return res.json({ shops });
  } catch (err) {
    console.error('getAllShops error', err);
    return res.status(500).json({ message: 'Failed to fetch shops' });
  }
};

// Dev helper: seed example shops (only in non-production)
export const seedShops = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }

  try {
    const count = await Shop.countDocuments();
    if (count > 0) {
      const shops = await Shop.find().limit(10);
      return res.json({ shops });
    }

    const sample = [
      {
        name: 'Corner Grocery',
        area: 'Sector 15',
        city: 'Faridabad',
        category: 'Food',
        offer: 10,
        rating: '4.6',
        isOpen: true,
        mapUrl: 'https://maps.google.com',
        products: [
          { name: 'Milk', price: 40 },
          { name: 'Bread', price: 30 },
        ],
      },
      {
        name: 'Stationery Hub',
        area: 'Old Faridabad',
        city: 'Faridabad',
        category: 'Books',
        offer: 0,
        rating: '4.2',
        isOpen: true,
        products: [
          { name: 'Notebook', price: 80 },
          { name: 'Pen', price: 10 },
        ],
      },
    ];

    const created = await Shop.insertMany(sample);
    return res.json({ shops: created });
  } catch (err) {
    console.error('seedShops error', err);
    return res.status(500).json({ message: 'Seed failed' });
  }
};
