const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();  // ← app must be created FIRST

// Middleware
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes (AFTER app is created and middleware is set up)
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));

// Error handler (always LAST)
app.use(require('./middleware/errorHandler'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));