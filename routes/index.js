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
    SELECT p.*, c.name as category_name, m.name as pet_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN pets m ON p.pet = m.slug
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
  const { categoria, mascota, q, page } = req.query;
  const limit = 12;
  const offset = ((parseInt(page) || 1) - 1) * limit;
  const db = req.db.getDb();
  
  let products, total;
  if (categoria || mascota || q) {
    let query = `
      SELECT p.*, c.name as category_name, m.name as pet_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN pets m ON p.pet = m.slug
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    if (categoria) {
      query += ` AND c.slug = '${categoria}'`;
      countQuery += ` AND c.slug = '${categoria}'`;
    }
    if (mascota) {
      query += ` AND (p.pet = '${mascota}' OR p.pet = 'ambos')`;
      countQuery += ` AND (p.pet = '${mascota}' OR p.pet = 'ambos')`;
    }
    if (q) {
      query += ` AND (p.name LIKE '%${q}%' OR p.description LIKE '%${q}%')`;
      countQuery += ` AND (p.name LIKE '%${q}%' OR p.description LIKE '%${q}%')`;
    }
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    products = execToObjects(db, query);
    total = execToObjects(db, countQuery)[0]?.total || 0;
  } else {
    products = execToObjects(db, `SELECT p.*, c.name as category_name, m.name as pet_name FROM products p JOIN categories c ON p.category_id = c.id LEFT JOIN pets m ON p.pet = m.slug LIMIT ${limit} OFFSET ${offset}`);
    total = execToObjects(db, 'SELECT COUNT(*) as total FROM products p JOIN categories c ON p.category_id = c.id')[0]?.total || 0;
  }

  const categories = execToObjects(db, 'SELECT * FROM categories');
  const pets = execToObjects(db, 'SELECT * FROM pets');

  res.render('tienda', {
    title: 'Tienda — Lupi Pet',
    products,
    categories,
    pets,
    total,
    currentPage: parseInt(page) || 1,
    totalPages: Math.ceil(total / limit),
    categoria,
    mascota,
    q,
    page: 'tienda'
  });
});

router.get('/producto/:id', (req, res) => {
  const db = req.db.getDb();
  const products = execToObjects(db, `SELECT p.*, c.name as category_name, m.name as pet_name FROM products p JOIN categories c ON p.category_id = c.id LEFT JOIN pets m ON p.pet = m.slug WHERE p.id = ${parseInt(req.params.id)}`);
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

router.get('/nosotros', (req, res) => {
  res.render('nosotros', {
    title: '¿Quiénes Somos? — Lupi Pet',
    page: 'nosotros'
  });
});

module.exports = router;