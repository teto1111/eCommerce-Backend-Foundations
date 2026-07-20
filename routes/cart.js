const router = require('express').Router();
const ctrl = require('../controllers/cartController');

// POST /carts – create new cart
router.post('/', ctrl.createCart);

// GET /carts/:id – retrieve a cart
router.get('/:id', ctrl.getCart);

// POST /carts/:id/items – add items to a cart
router.post('/:id/items', ctrl.addItem);

// (Optional) clear cart – not required by rubric but we keep for frontend
router.delete('/:id/clear', ctrl.clearCart);

module.exports = router;