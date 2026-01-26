const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const shopRoutes = require('./routes/shop.routes');


const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);


app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

module.exports = app;
