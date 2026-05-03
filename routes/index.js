const express = require('express');
const router = express.Router();
const { products, blogPosts } = require('../data/products');

// HOME
router.get('/', (req, res) => {
  const featured = products.filter(p => p.badge).slice(0, 4);
  res.render('home', {
    title: 'Lupi Pet — Amor en cada patita',
    featured,
    blogPosts,
    page: 'home'
  });
});

// TIENDA
router.get('/tienda', (req, res) => {
  const { categoria, mascota, q } = req.query;
  let filtered = [...products];

  if (categoria) filtered = filtered.filter(p => p.category === categoria);
  if (mascota) filtered = filtered.filter(p => p.pet === mascota || p.pet === 'ambos');
  if (q) filtered = filtered.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );

  res.render('tienda', {
    title: 'Tienda — Lupi Pet',
    products: filtered,
    total: filtered.length,
    categoria,
    mascota,
    q,
    page: 'tienda'
  });
});

// BLOG
router.get('/blog', (req, res) => {
  res.render('blog', {
    title: 'Blog — Lupi Pet',
    blogPosts,
    page: 'blog'
  });
});

// CONTACTO
router.get('/contacto', (req, res) => {
  res.render('contacto', {
    title: 'Contacto — Lupi Pet',
    page: 'contacto'
  });
});

module.exports = router;
