const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET cart
router.get('/', async (req, res, next) => {
  try {
    let cart = await Cart.findOne().populate('items.product');
    if (!cart) {
      cart = await Cart.create({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// ADD item to cart
router.post('/add', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [] });
    }

    const existingItem = cart.items.find(item =>
      item.product && item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (err) {
    next(err);
  }
});

// REMOVE item from cart
router.delete('/remove/:productId', async (req, res, next) => {
  try {
    let cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = cart.items.filter(item =>
      item.product && item.product.toString() !== req.params.productId
    );
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// CLEAR entire cart
router.delete('/clear', async (req, res, next) => {
  try {
    let cart = await Cart.findOne();
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

// CHECKOUT – reduce stock and clear cart
router.post('/checkout', async (req, res, next) => {
  try {
    let cart = await Cart.findOne().populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability
    for (let item of cart.items) {
      const product = item.product;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Reduce stock for each product
    for (let item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear cart after successful checkout
    cart.items = [];
    await cart.save();

    res.json({ message: 'Checkout successful! Stock updated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;