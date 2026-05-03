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

router.get('/backoffice', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }

  const db = req.db.getDb();
  
  const productCount = execToObjects(db, 'SELECT COUNT(*) as count FROM products')[0]?.count || 0;
  const categoryCount = execToObjects(db, 'SELECT COUNT(*) as count FROM categories')[0]?.count || 0;
  const blogCount = execToObjects(db, 'SELECT COUNT(*) as count FROM blog_posts')[0]?.count || 0;
  const lowStock = execToObjects(db, 'SELECT COUNT(*) as count FROM products WHERE stock < 10')[0]?.count || 0;

  const products = execToObjects(db, 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC');
  const categories = execToObjects(db, 'SELECT * FROM categories');

  res.render('backoffice/dashboard', {
    title: 'Backoffice — Lupi Pet',
    products,
    categories,
    productCount,
    categoryCount,
    blogCount,
    lowStock,
    page: 'backoffice',
    noFooter: true
  });
});

router.get('/backoffice/login', (req, res) => {
  res.render('backoffice/login', {
    title: 'Login — Backoffice',
    page: 'backoffice',
    noFooter: true
  });
});

router.post('/backoffice/login', (req, res) => {
  const { username, password } = req.body;
  
  const adminUser = req.db.getAdminUser();
  const passwordHash = req.db.getPasswordHash(password);
  
  if (adminUser && adminUser.username === username && adminUser.password_hash === passwordHash) {
    req.session = req.session || {};
    req.session.admin = true;
    req.session.username = username;
    return res.redirect('/backoffice');
  }
  res.render('backoffice/login', {
    title: 'Login — Backoffice',
    error: 'Usuario o contrasena incorrectos',
    page: 'backoffice',
    noFooter: true
  });
});

router.get('/backoffice/password', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  res.render('backoffice/password', {
    title: 'Cambiar Contrasena — Backoffice',
    page: 'backoffice',
    noFooter: true
  });
});

router.post('/backoffice/password', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  
  const { current_password, new_password, confirm_password } = req.body;
  const adminUser = req.db.getAdminUser();
  const currentHash = req.db.getPasswordHash(current_password);
  
  if (adminUser.password_hash !== currentHash) {
    return res.render('backoffice/password', {
      title: 'Cambiar Contrasena — Backoffice',
      error: 'Contrasena actual incorrecta',
      page: 'backoffice',
      noFooter: true
    });
  }
  
  if (new_password !== confirm_password) {
    return res.render('backoffice/password', {
      title: 'Cambiar Contrasena — Backoffice',
      error: 'Las contrasenas no coinciden',
      page: 'backoffice',
      noFooter: true
    });
  }
  
  if (new_password.length < 4) {
    return res.render('backoffice/password', {
      title: 'Cambiar Contrasena — Backoffice',
      error: 'La contrasena debe tener al menos 4 caracteres',
      page: 'backoffice',
      noFooter: true
    });
  }
  
  const newHash = req.db.getPasswordHash(new_password);
  req.db.updatePassword(newHash);
  
  res.render('backoffice/password', {
    title: 'Cambiar Contrasena — Backoffice',
    success: 'Contrasena actualizada correctamente',
    page: 'backoffice',
    noFooter: true
  });
});

router.get('/backoffice/products/new', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const categories = execToObjects(db, 'SELECT * FROM categories');
  res.render('backoffice/product-form', {
    title: 'Nuevo Producto — Backoffice',
    categories,
    product: {},
    page: 'backoffice',
    noFooter: true
  });
});

router.post('/backoffice/products', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, category_id, pet, price, emoji, badge, description, stock, featured } = req.body;
  const image = req.file ? req.file.filename : null;

  req.db.getDb().run(`
    INSERT INTO products (name, category_id, pet, price, emoji, image, badge, description, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [name, parseInt(category_id), pet, parseFloat(price), emoji, image, badge, description, parseInt(stock) || 0, featured ? 1 : 0]);
  
  req.db.saveDb();

  res.redirect('/backoffice');
});

router.get('/backoffice/products/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const products = execToObjects(db, 'SELECT * FROM products WHERE id = ' + parseInt(req.params.id));
  const product = products.length > 0 ? products[0] : null;
  const categories = execToObjects(db, 'SELECT * FROM categories');
  
  res.render('backoffice/product-form', {
    title: 'Editar Producto — Backoffice',
    categories,
    product,
    page: 'backoffice'
  });
});

router.post('/backoffice/products/:id', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, category_id, pet, price, emoji, badge, description, stock, featured } = req.body;
  const image = req.file ? req.file.filename : req.body.existing_image;

  req.db.getDb().run(`
    UPDATE products
    SET name = ?, category_id = ?, pet = ?, price = ?, emoji = ?, image = ?, badge = ?, description = ?, stock = ?, featured = ?
    WHERE id = ?
  `, [name, parseInt(category_id), pet, parseFloat(price), emoji, image, badge, description, parseInt(stock) || 0, featured ? 1 : 0, parseInt(req.params.id)]);
  
  req.db.saveDb();

  res.redirect('/backoffice');
});

router.post('/backoffice/products/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  req.db.getDb().run('DELETE FROM products WHERE id = ?', [parseInt(req.params.id)]);
  req.db.saveDb();
  res.redirect('/backoffice');
});

router.get('/backoffice/categories', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const categories = execToObjects(db, 'SELECT * FROM categories');
  res.render('backoffice/categories', {
    title: 'Categorias — Backoffice',
    categories,
    page: 'backoffice'
  });
});

router.post('/backoffice/categories', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, slug, emoji } = req.body;
  req.db.getDb().run('INSERT INTO categories (name, slug, emoji) VALUES (?, ?, ?)', [name, slug, emoji]);
  req.db.saveDb();
  res.redirect('/backoffice/categories');
});

router.get('/backoffice/categories/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const cats = execToObjects(db, 'SELECT * FROM categories WHERE id = ' + parseInt(req.params.id));
  const category = cats.length > 0 ? cats[0] : null;
  res.render('backoffice/category-form', {
    title: 'Editar Categoria — Backoffice',
    category,
    page: 'backoffice'
  });
});

router.post('/backoffice/categories/:id', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, slug, emoji } = req.body;
  req.db.getDb().run('UPDATE categories SET name = ?, slug = ?, emoji = ? WHERE id = ?', [name, slug, emoji, parseInt(req.params.id)]);
  req.db.saveDb();
  res.redirect('/backoffice/categories');
});

router.post('/backoffice/categories/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  req.db.getDb().run('DELETE FROM categories WHERE id = ?', [parseInt(req.params.id)]);
  req.db.saveDb();
  res.redirect('/backoffice/categories');
});

router.get('/backoffice/blog', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const posts = execToObjects(db, 'SELECT * FROM blog_posts ORDER BY id DESC');
  res.render('backoffice/blog', {
    title: 'Blog — Backoffice',
    posts,
    page: 'backoffice'
  });
});

router.get('/backoffice/blog/new', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  res.render('backoffice/blog-form', {
    title: 'Nueva Entrada — Backoffice',
    post: {},
    page: 'backoffice'
  });
});

router.post('/backoffice/blog', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { title, category, pet, emoji, date, excerpt, content, read_time } = req.body;
  req.db.getDb().run(`
    INSERT INTO blog_posts (title, category, pet, emoji, date, excerpt, content, read_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, category, pet, emoji, date, excerpt, content, read_time]);
  req.db.saveDb();
  res.redirect('/backoffice/blog');
});

router.get('/backoffice/blog/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const posts = execToObjects(db, 'SELECT * FROM blog_posts WHERE id = ' + parseInt(req.params.id));
  const post = posts.length > 0 ? posts[0] : null;
  res.render('backoffice/blog-form', {
    title: 'Editar Entrada — Backoffice',
    post,
    page: 'backoffice'
  });
});

router.post('/backoffice/blog/:id', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { title, category, pet, emoji, date, excerpt, content, read_time } = req.body;
  req.db.getDb().run(`
    UPDATE blog_posts
    SET title = ?, category = ?, pet = ?, emoji = ?, date = ?, excerpt = ?, content = ?, read_time = ?
    WHERE id = ?
  `, [title, category, pet, emoji, date, excerpt, content, read_time, parseInt(req.params.id)]);
  req.db.saveDb();
  res.redirect('/backoffice/blog');
});

router.post('/backoffice/blog/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  req.db.getDb().run('DELETE FROM blog_posts WHERE id = ?', [parseInt(req.params.id)]);
  req.db.saveDb();
  res.redirect('/backoffice/blog');
});

router.get('/backoffice/logout', (req, res) => {
  req.session = null;
  res.redirect('/backoffice/login');
});

module.exports = router;