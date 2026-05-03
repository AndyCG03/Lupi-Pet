// LUPI PET -- Cart Manager

let cart = JSON.parse(localStorage.getItem('lupipet_cart') || '[]');

function saveCart() {
  localStorage.setItem('lupipet_cart', JSON.stringify(cart));
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  saveCart();
  renderCart();
  updateBadge();
  showToast(`${name} agregado al carrito`);
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('cart-added');
  void badge.offsetWidth;
  badge.classList.add('cart-added');
  setTimeout(() => badge.classList.remove('cart-added'), 300);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  updateBadge();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  renderCart();
  updateBadge();
}

function updateBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const totalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito esta vacio</p>
        <small>Agrega productos para tu mascota</small>
      </div>`;
    footer.style.display = 'none';
    return;
  }

  let html = '';
  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${subtotal.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          <button class="cart-item-del" onclick="removeFromCart(${item.id})" title="Eliminar">X</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;
  totalEl.textContent = `$${total.toFixed(2)} MXN`;
  footer.style.display = 'block';
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function checkoutWhatsApp() {
  if (cart.length === 0) return;
  const customerName = document.getElementById('customerName').value.trim();

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, customerName })
    });
    const data = await response.json();
    if (data.url) {
      window.open(data.url, '_blank');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Error al procesar el pedido. Intenta de nuevo.');
  }
}

function showToast(msg) {
  let toast = document.getElementById('lupipet-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lupipet-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateBadge();
});