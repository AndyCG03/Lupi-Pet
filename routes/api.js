const express = require('express');
const router = express.Router();

router.get('/product/:id', (req, res) => {
  const db = req.db.getDb();
  const result = db.exec('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ' + parseInt(req.params.id));
  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  const product = {};
  result[0].columns.forEach((col, i) => product[col] = result[0].values[0][i]);
  res.json(product);
});

router.get('/products', (req, res) => {
  const db = req.db.getDb();
  const result = db.exec('SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id');
  const products = result.length > 0 ? result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  }) : [];
  res.json(products);
});

router.post('/checkout', (req, res) => {
  const { cart, customerName, phone } = req.body;
  const WA_NUMBER = '5215512345678';

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Carrito vacio' });
  }

  const db = req.db.getDb();
  
  let message = `Pedido Lupi Pet\n`;
  message += `===============\n`;
  if (customerName) message += `Cliente: ${customerName}\n\n`;

  let total = 0;
  cart.forEach(item => {
    const result = db.exec('SELECT * FROM products WHERE id = ' + parseInt(item.id));
    if (result.length > 0 && result[0].values.length > 0) {
      const product = {};
      result[0].columns.forEach((col, i) => product[col] = result[0].values[0][i]);
      const subtotal = product.price * item.qty;
      total += subtotal;
      message += `- ${product.name}\n`;
      message += `   Cantidad: ${item.qty} x $${product.price} MXN\n`;
      message += `   Subtotal: $${subtotal.toFixed(2)} MXN\n\n`;
    }
  });

  message += `===============\n`;
  message += `TOTAL: $${total.toFixed(2)} MXN\n\n`;
  message += `Por favor confirmame disponibilidad y forma de pago. Gracias!`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedMsg}`;

  res.json({ url: waUrl, total: total.toFixed(2) });
});

module.exports = router;