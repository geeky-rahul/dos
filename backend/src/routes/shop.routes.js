const express = require('express');
const router = express.Router();

const {
  getAllShops,
  addShop,
} = require('../controllers/shop.controller');

router.get('/', getAllShops);
router.post('/add', addShop);

module.exports = router;
