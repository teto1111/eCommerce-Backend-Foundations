const Product = require('../models/Product');

const getAllProducts = async () => await Product.find();

const getProductById = async (id) => await Product.findById(id);

const createProduct = async (data) => await Product.create(data);

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return product;
};

const deleteProduct = async (id) => await Product.findByIdAndDelete(id);

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };