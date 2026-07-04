const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany();
    await Product.insertMany([
      { name: 'Laptop', price: 999, stock: 10, category: 'electronics' },
      { name: 'Mouse', price: 25, stock: 50, category: 'accessories' }
    ]);
    console.log('Database seeded');
    process.exit();
  });