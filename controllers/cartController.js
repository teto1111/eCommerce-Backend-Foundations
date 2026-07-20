const cartService = require('../services/cartService');
const Product = require('../models/Product');

exports.createCart = async (req, res, next) => {
  try {
    const cart = await cartService.createCart();
    res.status(201).json(cart);
  } catch (err) { next(err); }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });
    const cart = await cartService.addItem(req.params.id, productId, quantity || 1);
    res.json(cart);
  } catch (err) {
    if (err.message === 'Cart not found') return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};

exports.checkout = async (req, res, next) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Check stock
    for (let item of cart.items) {
      const product = item.product;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Reduce stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({ message: 'Checkout successful! Stock updated.' });
  } catch (err) { next(err); }
};