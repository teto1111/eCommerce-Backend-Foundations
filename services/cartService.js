const Cart = require('../models/Cart');

const createCart = async () => {
  const cart = await Cart.create({ items: [] });
  return cart;
};

const getCartById = async (cartId) => {
  const cart = await Cart.findById(cartId).populate('items.product');
  return cart;
};

const addItemToCart = async (cartId, productId, quantity = 1) => {
  let cart = await Cart.findById(cartId);
  if (!cart) throw new Error('Cart not found');
  
  const existing = cart.items.find(item => item.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  return await Cart.findById(cartId).populate('items.product');
};

const clearCart = async (cartId) => {
  const cart = await Cart.findById(cartId);
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return cart;
};

const checkoutCart = async (cartId) => {
  // we won't implement checkout here; keep it in routes if needed
  return null;
};

module.exports = { createCart, getCartById, addItemToCart, clearCart, checkoutCart };