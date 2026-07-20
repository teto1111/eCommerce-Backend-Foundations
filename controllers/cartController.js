const cartService = require('../services/cartService');

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
    const cart = await cartService.addItemToCart(req.params.id, productId, quantity || 1);
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