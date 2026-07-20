const API = 'http://localhost:5000/api';
let cartId = localStorage.getItem('cartId');

// ===== HELPERS =====
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(name + '-section');
  if (target) target.classList.add('active');
  
  document.querySelectorAll('.nav-btn[data-section]').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-btn[data-section="${name}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = isError ? '#ef4444' : '#1a1a2e';
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ===== CART HELPERS =====
async function ensureCart() {
  if (!cartId) {
    try {
      const res = await fetch(`${API}/carts`, { method: 'POST' });
      const cart = await res.json();
      cartId = cart._id;
      localStorage.setItem('cartId', cartId);
    } catch (err) { console.error(err); }
  }
  return cartId;
}

async function updateCartCount() {
  await ensureCart();
  const id = localStorage.getItem('cartId');
  if (!id) return;
  try {
    const res = await fetch(`${API}/carts/${id}`);
    const cart = await res.json();
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById('cart-count').textContent = count;
  } catch (e) {}
}

// ===== PRODUCTS =====
async function fetchProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    renderProducts(products);
  } catch (err) { console.error(err); }
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
      <button class="btn btn-cart" onclick="addToCart('${p._id}')">🛒 Add to Cart</button>
    </div>
  `).join('');
}

// ===== CART =====
async function fetchCart() {
  await ensureCart();
  const id = localStorage.getItem('cartId');
  if (!id) return;
  try {
    const res = await fetch(`${API}/carts/${id}`);
    const cart = await res.json();
    renderCart(cart);
  } catch (err) { console.error(err); }
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
  await ensureCart();
  const id = localStorage.getItem('cartId');
  try {
    const res = await fetch(`${API}/carts/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    if (res.ok) {
      showToast('✅ Added to cart!');
      fetchCart();
    } else {
      const err = await res.json();
      showToast('❌ ' + err.message, true);
    }
  } catch (err) { showToast('❌ Network error', true); }
}

async function clearCart() {
  const id = localStorage.getItem('cartId');
  if (!id) return;
  try {
    const res = await fetch(`${API}/carts/${id}/clear`, { method: 'DELETE' });
    if (res.ok) {
      fetchCart();
      showToast('Cart cleared');
    }
  } catch (err) { console.error(err); }
}

async function checkout() {
  const id = localStorage.getItem('cartId');
  if (!id) return showToast('Cart is empty', true);
  try {
    const res = await fetch(`${API}/carts/${id}/checkout`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('🎉 Purchase successful!');
      fetchCart();
      fetchProducts();
    } else {
      showToast('❌ ' + data.message, true);
    }
  } catch (err) { showToast('❌ Network error', true); }
}

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

  messageEl.textContent = 'Creating product...';
  messageEl.className = 'form-message';

  try {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        price: Number(price), 
        stock: Number(stock), 
        category: category || undefined, 
        description: description || undefined 
      })
    });
    
    const data = await res.json();

    if (res.ok) {
      messageEl.textContent = '✅ Product created!';
      messageEl.className = 'form-message success';
      this.reset();
      
      // Refresh products and switch to products view
      await fetchProducts();
      showSection('products');
      
      showToast('Product added! 🎉');
    } else {
      messageEl.textContent = '❌ ' + (data.message || 'Error');
      messageEl.className = 'form-message error';
    }
  } catch (err) {
    console.error(err);
    messageEl.textContent = '❌ Network error';
    messageEl.className = 'form-message error';
  }
});

// ===== SEARCH =====
document.getElementById('search').addEventListener('input', async function(e) {
  const query = e.target.value.toLowerCase();
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
    renderProducts(filtered);
  } catch (err) { console.error(err); }
});

// ===== NAVIGATION =====
document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    showSection(section);
    if (section === 'products') fetchProducts();
    if (section === 'cart') fetchCart();
  });
});

document.getElementById('clear-cart').addEventListener('click', clearCart);
document.getElementById('checkout-btn').addEventListener('click', checkout);

// ===== INITIAL LOAD =====
async function init() {
  await ensureCart();
  fetchProducts();
  updateCartCount();
}
init();