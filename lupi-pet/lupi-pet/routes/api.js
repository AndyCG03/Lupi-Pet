const express = require('express');
const router = express.Router();
const { products } = require('../data/products');

// GET product by id
router.get('/product/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

// GET all products (for search)
router.get('/products', (req, res) => {
  res.json(products);
});

// POST generate WhatsApp checkout URL
router.post('/checkout', (req, res) => {
  const { cart, customerName, phone } = req.body;

  // Replace with your actual WhatsApp number (521 + number for Mexico)
  const WA_NUMBER = '5215512345678';

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Carrito vacío' });
  }

  // Build order message
  let message = `🐾 *Pedido Lupi Pet*\n`;
  message += `━━━━━━━━━━━━━━━\n`;
  if (customerName) message += `👤 Cliente: ${customerName}\n\n`;

  let total = 0;
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      const subtotal = product.price * item.qty;
      total += subtotal;
      message += `${product.emoji} *${product.name}*\n`;
      message += `   Cantidad: ${item.qty} × $${product.price} MXN\n`;
      message += `   Subtotal: $${subtotal.toFixed(2)} MXN\n\n`;
    }
  });

  message += `━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: $${total.toFixed(2)} MXN*\n\n`;
  message += `📦 Por favor confírmame disponibilidad y forma de pago. ¡Gracias! 🐾`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedMsg}`;

  res.json({ url: waUrl, total: total.toFixed(2) });
});

module.exports = router;
