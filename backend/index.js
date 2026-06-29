const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI environment variable. Set it in Vercel or your local .env file.');
}
if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable. Set it in Vercel or your local .env file.');
}

const connectDB = require('./Models/db');
const AuthRouter = require('./Routes/AuthRouter');
const WarehouseRouter = require('./Routes/WarehouseRouter');

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.json({ status: 'Backend is running' });
});

const requireDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({
      message: 'Database connection failed',
      success: false,
      error: err.message
    });
  }
};

app.use('/auth', requireDB, AuthRouter);
app.use('/warehouse', requireDB, WarehouseRouter);

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
