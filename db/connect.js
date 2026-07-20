const mongoose = require('mongoose');

const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGO_URI;
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
};

module.exports = connectDB;