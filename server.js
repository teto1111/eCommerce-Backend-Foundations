const express = require('express');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose'); // no longer used directly for connect, but needed
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db/connect');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/carts', require('./routes/cart'));   // note: now /api/carts

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));