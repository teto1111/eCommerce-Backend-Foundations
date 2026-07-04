const router = require('express').Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne().populate('items.product');
    if (!cart) {
      cart = await Cart.create({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD to cart
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    console.log('Received productId:', productId); // Debug line
    
    // Check if product exists in database first
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found',
        receivedId: productId 
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [] });
    }
    
    // Check if already in cart
    const existingItem = cart.items.find(item => 
      item.product && item.product.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ 
        product: productId, 
        quantity: quantity || 1 
      });
    }
    
    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
    
  } catch (err) {
    console.error('Cart error:', err); // Debug line
    res.status(500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
});

module.exports = router;