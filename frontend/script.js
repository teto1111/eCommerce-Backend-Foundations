const API_URL = 'http://localhost:5000/api';

// ===== NAVIGATION =====
const navButtons = document.querySelectorAll('.nav-btn[data-section]');
const sections = {
  products: document.getElementById('products-section'),
  cart: document.getElementById('cart-section'),
  add: document.getElementById('add-section')
};

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[section].classList.add('active');
    if (section === 'products') fetchProducts();
    if (section === 'cart') fetchCart();
  });
});

// ===== TOAST =====
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.background = isError ? '#ef4444' : '#1a1a2e';
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== PRODUCTS =====
async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error(err);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!products.length) {
    grid.innerHTML = '<p class="empty-state">No products yet. Add one!</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <span class="product-category">${p.category || 'Uncategorized'}</span>
      <h3 class="product-name">${p.name}</h3>
      <p class="product-price">$${Number(p.price).toFixed(2)}</p>
      <p class="product-stock">${p.stock} in stock</p>
      <p class="product-description">${p.description || ''}</p>
      <button class="btn btn-cart" onclick="addToCart('${p._id}')">
        🛒 Add to Cart
      </button>
    </div>
  `).join('');
}

// ===== CART =====
async function fetchCart() {
  try {
    const res = await fetch(`${API_URL}/cart`);
    const cart = await res.json();
    renderCart(cart);
  } catch (err) {
    console.error(err);
  }
}

function renderCart(cart) {
  const itemsDiv = document.getElementById('cart-items');
  const summaryDiv = document.getElementById('cart-summary');
  const emptyP = document.getElementById('empty-cart');
  const countBadge = document.getElementById('cart-count');

  if (!cart.items || cart.items.length === 0) {
    itemsDiv.innerHTML = '';
    summaryDiv.classList.add('hidden');
    emptyP.classList.remove('hidden');
    countBadge.textContent = '0';
    return;
  }

  emptyP.classList.add('hidden');
  summaryDiv.classList.remove('hidden');

  let total = 0;
  let totalItems = 0;

  itemsDiv.innerHTML = cart.items.map(item => {
    const product = item.product;
    if (!product) return '';
    const subtotal = product.price * item.quantity;
    total += subtotal;
    totalItems += item.quantity;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <p>Qty: ${item.quantity}</p>
        </div>
        <span class="cart-item-price">$${subtotal.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  countBadge.textContent = totalItems;
}

async function addToCart(productId) {
  try {
    const res = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    if (res.ok) {
      showToast('✅ Added to cart!');
      fetchCart(); // update cart badge
    } else {
      const err = await res.json();
      showToast('❌ ' + err.message, true);
    }
  } catch (err) {
    showToast('❌ Network error', true);
  }
}

// ----- Clear Cart -----
document.getElementById('clear-cart').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_URL}/cart/clear`, { method: 'DELETE' });
    if (res.ok) {
      fetchCart();
      showToast('Cart cleared');
    } else {
      const err = await res.json();
      showToast('❌ ' + err.message, true);
    }
  } catch (err) {
    showToast('❌ Network error', true);
  }
});

// ----- Checkout -----
document.getElementById('checkout-btn').addEventListener('click', async () => {
  if (!confirm('Confirm purchase? This will reduce stock and clear your cart.')) return;
  try {
    const res = await fetch(`${API_URL}/cart/checkout`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('🎉 Purchase successful!');
      fetchCart();          // updates cart display (should be empty now)
      fetchProducts();      // reload products to reflect new stock counts
    } else {
      showToast('❌ ' + data.message, true);
    }
  } catch (err) {
    showToast('❌ Network error', true);
  }
});

// ===== ADD PRODUCT =====
document.getElementById('add-product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value;
  const stock = document.getElementById('stock').value;
  const category = document.getElementById('category').value.trim();
  const description = document.getElementById('description').value.trim();
  const messageEl = document.getElementById('form-message');

  if (!name || !price || !stock) {
    messageEl.textContent = 'Please fill in all required fields (*)';
    messageEl.className = 'form-message error';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: Number(price), stock: Number(stock), category, description })
    });
    const data = await res.json();
    if (res.ok) {
      messageEl.textContent = '✅ Product created!';
      messageEl.className = 'form-message success';
      this.reset();
      showToast('Product added!');
    } else {
      messageEl.textContent = '❌ ' + (data.message || 'Error');
      messageEl.className = 'form-message error';
    }
  } catch (err) {
    messageEl.textContent = '❌ Network error';
    messageEl.className = 'form-message error';
  }
});

// ===== SEARCH =====
document.getElementById('search').addEventListener('input', async function(e) {
  const query = e.target.value.toLowerCase();
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
    renderProducts(filtered);
  } catch (err) {
    console.error(err);
  }
});

// ===== INIT =====
fetchProducts();
fetchCart();