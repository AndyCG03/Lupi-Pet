const express = require('express');
const router = express.Router();

function execToObjects(db, query) {
  const result = db.exec(query);
  if (result.length === 0) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

router.get('/', (req, res) => {
  const db = req.db.getDb();
  const products = execToObjects(db, `
    SELECT p.*, c.name as category_name, c.emoji as category_emoji
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.featured = 1
  `);
  const blogPosts = execToObjects(db, 'SELECT * FROM blog_posts ORDER BY id DESC');

  res.render('home', {
    title: 'Lupi Pet — Amor en cada patita',
    products,
    blogPosts,
    page: 'home'
  });
});

router.get('/tienda', (req, res) => {
  const { categoria, mascota, q } = req.query;
  const db = req.db.getDb();

  let products;
  if (categoria || mascota || q) {
    let query = `
      SELECT p.*, c.name as category_name, c.emoji as category_emoji
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    if (categoria) query += ` AND c.slug = '${categoria}'`;
    if (mascota) query += ` AND (p.pet = '${mascota}' OR p.pet = 'ambos')`;
    if (q) query += ` AND (p.name LIKE '%${q}%' OR p.description LIKE '%${q}%')`;
    products = execToObjects(db, query);
  } else {
    products = execToObjects(db, 'SELECT p.*, c.name as category_name, c.emoji as category_emoji FROM products p JOIN categories c ON p.category_id = c.id');
  }

  const categories = execToObjects(db, 'SELECT * FROM categories');
  const pets = execToObjects(db, 'SELECT * FROM pets');

  res.render('tienda', {
    title: 'Tienda — Lupi Pet',
    products,
    categories,
    pets,
    total: products.length,
    categoria,
    mascota,
    q,
    page: 'tienda'
  });
});

router.get('/producto/:id', (req, res) => {
  const db = req.db.getDb();
  const products = execToObjects(db, `SELECT p.*, c.name as category_name, c.emoji as category_emoji FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ${parseInt(req.params.id)}`);
  if (products.length === 0) {
    return res.redirect('/tienda');
  }
  const product = products[0];
  const related = execToObjects(db, `SELECT p.* FROM products p WHERE p.category_id = ${product.category_id} AND p.id != ${product.id} LIMIT 4`);
  
  res.render('producto', {
    title: `${product.name} — Lupi Pet`,
    product,
    related,
    page: 'tienda'
  });
});

router.get('/blog', (req, res) => {
  const db = req.db.getDb();
  const blogPosts = execToObjects(db, 'SELECT * FROM blog_posts ORDER BY id DESC');
  res.render('blog', {
    title: 'Blog — Lupi Pet',
    blogPosts,
    page: 'blog'
  });
});

router.get('/blog/:id', (req, res) => {
  const db = req.db.getDb();
  const posts = execToObjects(db, 'SELECT * FROM blog_posts WHERE id = ' + parseInt(req.params.id));
  if (posts.length === 0) {
    return res.redirect('/blog');
  }
  const post = posts[0];
  res.render('blog-post', {
    title: post.title + ' — Blog Lupi Pet',
    post,
    page: 'blog'
  });
});

router.get('/contacto', (req, res) => {
  res.render('contacto', {
    title: 'Contacto — Lupi Pet',
    page: 'contacto'
  });
});

module.exports = router;