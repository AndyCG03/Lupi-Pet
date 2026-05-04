const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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
  res.redirect('/backoffice/products');
});

router.get('/backoffice/login', (req, res) => {
  res.render('backoffice/login', {
    title: 'Login — Backoffice',
    page: 'login',
    layout: false
  });
});

router.post('/backoffice/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = req.db.getAdminUser();
  const passwordHash = req.db.getPasswordHash(password);
  
  if (username === adminUser.username && adminUser.password_hash === passwordHash) {
    req.session.admin = true;
    req.session.username = username;
    return res.redirect('/backoffice/products');
  }
  res.render('backoffice/login', {
    title: 'Login — Backoffice',
    error: 'Usuario o contrasena incorrectos',
    page: 'login',
    layout: false
  });
});

router.get('/backoffice/products', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const products = execToObjects(db, 'SELECT p.*, c.name as category_name, m.name as pet_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN pets m ON p.pet = m.slug ORDER BY p.id DESC');
  const categories = execToObjects(db, 'SELECT * FROM categories');
  const pets = execToObjects(db, 'SELECT * FROM pets');
  const allPets = execToObjects(db, 'SELECT * FROM pets');
  
  res.render('backoffice/products', {
    title: 'Productos — Backoffice',
    products,
    categories,
    pets: allPets,
    page: 'products',
    layout: false
  });
});

router.post('/backoffice/products', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) console.error('Upload error:', err);
    next();
  });
}, (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, category_id, pet, price, description, stock, featured } = req.body;
  const uploadedImage = req.file ? req.file.filename : null;
  const stockVal = stock || 'muchos';
  const featuredVal = featured ? 1 : 0;
  req.db.runQuery(
    "INSERT INTO products (name, category_id, pet, price, image, description, stock, featured) VALUES ('" + 
    name.replace(/'/g, "''") + "', " + category_id + ", '" + pet + "', " + price + ", " + 
    (uploadedImage ? "'" + uploadedImage.replace(/'/g, "''") + "'" : "null") + ", '" + 
    (description || '').replace(/'/g, "''") + "', '" + stockVal + "', " + featuredVal + ")"
  );
  
  req.db.saveDb();
  res.redirect('/backoffice/products');
});

router.get('/backoffice/products/new', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const categories = execToObjects(db, 'SELECT * FROM categories');
  const pets = execToObjects(db, 'SELECT * FROM pets');
  res.render('backoffice/product-form', {
    title: 'Nuevo Producto — Backoffice',
    categories,
    pets,
    product: {},
    page: 'products',
    layout: false
  });
});

router.get('/backoffice/products/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const products = execToObjects(db, 'SELECT * FROM products WHERE id = ' + parseInt(req.params.id));
  const product = products.length > 0 ? products[0] : null;
  const categories = execToObjects(db, 'SELECT * FROM categories');
  const pets = execToObjects(db, 'SELECT * FROM pets');
  
  res.render('backoffice/product-form', {
    title: 'Editar Producto — Backoffice',
    categories,
    pets,
    product,
    page: 'products',
    layout: false
  });
});

router.post('/backoffice/products/:id', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) console.error('Upload error:', err);
    next();
  });
}, (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, category_id, pet, price, description, stock, featured, existing_image } = req.body;
  const image = req.file ? req.file.filename : existing_image;
  const featuredVal = featured ? 1 : 0;
  const stockVal = stock || 'muchos';
  const id = parseInt(req.params.id);
  req.db.runQuery(
    "UPDATE products SET name = '" + name.replace(/'/g, "''") + "', category_id = " + category_id + 
    ", pet = '" + pet + "', price = " + price + ", image = " + (image ? "'" + image.replace(/'/g, "''") + "'" : "null") + 
    ", description = '" + (description || '').replace(/'/g, "''") + "', stock = '" + stockVal + "', featured = " + featuredVal + " WHERE id = " + id
  );
  
  req.db.saveDb();
  res.redirect('/backoffice/products');
});

router.post('/backoffice/products/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const id = parseInt(req.params.id);
  const products = execToObjects(req.db.getDb(), 'SELECT image FROM products WHERE id = ' + id);
  if (products.length > 0 && products[0].image) {
    const imgPath = path.join(__dirname, '..', 'uploads', products[0].image);
    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch(e) {}
  }
  req.db.runQuery('DELETE FROM products WHERE id = ' + id);
  req.db.saveDb();
  res.redirect('/backoffice/products');
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
    page: 'categories',
    layout: false
  });
});

router.post('/backoffice/categories', (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  const { name, slug, pet } = req.body;
  req.db.runQuery("INSERT INTO categories (name, slug, pet) VALUES ('" + name.replace(/'/g, "''") + "', '" + slug.replace(/'/g, "''") + "', '" + (pet || 'ambos') + "')");
  req.db.saveDb();
  res.redirect('/backoffice/categories');
});

router.get('/backoffice/categories/new', (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  res.render('backoffice/category-form', { title: 'Nueva Categoria — Backoffice', category: {}, page: 'categories', layout: false });
});

router.get('/backoffice/categories/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  const db = req.db.getDb();
  const cats = execToObjects(db, 'SELECT * FROM categories WHERE id = ' + parseInt(req.params.id));
  const category = cats.length > 0 ? cats[0] : null;
  res.render('backoffice/category-form', { title: 'Editar Categoria — Backoffice', category, page: 'categories', layout: false });
});

router.post('/backoffice/categories/:id', (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  const { name, slug, pet } = req.body;
  const id = parseInt(req.params.id);
  req.db.runQuery("UPDATE categories SET name = '" + name.replace(/'/g, "''") + "', slug = '" + slug.replace(/'/g, "''") + "', pet = '" + (pet || 'ambos') + "' WHERE id = " + id);
  req.db.saveDb();
  res.redirect('/backoffice/categories');
});

router.post('/backoffice/categories/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  req.db.runQuery('DELETE FROM categories WHERE id = ' + parseInt(req.params.id));
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
    page: 'blog',
    layout: false
  });
});

router.get('/backoffice/blog/new', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  res.render('backoffice/blog-form', { title: 'Nueva Entrada — Backoffice', post: {}, page: 'blog', layout: false });
});

router.post('/backoffice/blog', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) console.error('Upload error:', err);
    next();
  });
}, (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  const { title, category, pet, content } = req.body;
  const image = req.file ? req.file.filename : null;
  req.db.runQuery(
    "INSERT INTO blog_posts (title, category, pet, content, image) VALUES ('" + 
    title.replace(/'/g, "''") + "', '" + category + "', '" + pet + "', '" + (content || '').replace(/'/g, "''") + "', " + 
    (image ? "'" + image.replace(/'/g, "''") + "'" : "null") + ")"
  );
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
  res.render('backoffice/blog-form', { title: 'Editar Entrada — Backoffice', post, page: 'blog', layout: false });
});

router.post('/backoffice/blog/:id', (req, res, next) => {
  req.upload.single('image')(req, res, (err) => {
    if (err) console.error('Upload error:', err);
    next();
  });
}, (req, res) => {
  if (!req.session || !req.session.admin) return res.redirect('/backoffice/login');
  const { title, category, pet, content, existing_image } = req.body;
  const image = req.file ? req.file.filename : existing_image;
  const id = parseInt(req.params.id);
  req.db.runQuery(
    "UPDATE blog_posts SET title = '" + title.replace(/'/g, "''") + "', category = '" + category + "', pet = '" + pet + "', content = '" + 
    (content || '').replace(/'/g, "''") + "', image = " + (image ? "'" + image.replace(/'/g, "''") + "'" : "null") + " WHERE id = " + id
  );
  req.db.saveDb();
  res.redirect('/backoffice/blog');
});

router.post('/backoffice/blog/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const id = parseInt(req.params.id);
  const posts = execToObjects(req.db.getDb(), 'SELECT image FROM blog_posts WHERE id = ' + id);
  if (posts.length > 0 && posts[0].image) {
    const imgPath = path.join(__dirname, '..', 'uploads', posts[0].image);
    try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch(e) {}
  }
  req.db.runQuery('DELETE FROM blog_posts WHERE id = ' + id);
  req.db.saveDb();
  res.redirect('/backoffice/blog');
});

router.get('/backoffice/password', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  res.render('backoffice/password', {
    title: 'Cambiar Contraseña — Backoffice',
    page: 'password',
    layout: false
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
      title: 'Cambiar Contraseña — Backoffice',
      error: 'Contraseña actual incorrecta',
      page: 'password',
      layout: false
    });
  }
  
  if (new_password !== confirm_password) {
    return res.render('backoffice/password', {
      title: 'Cambiar Contraseña — Backoffice',
      error: 'Las contraseñas no coinciden',
      page: 'password',
      layout: false
    });
  }
  
  if (new_password.length < 4) {
    return res.render('backoffice/password', {
      title: 'Cambiar Contraseña — Backoffice',
      error: 'La contraseña debe tener al menos 4 caracteres',
      page: 'password',
      layout: false
    });
  }
  
  const newHash = req.db.getPasswordHash(new_password);
  req.db.updatePassword(newHash);
  
  req.session.destroy();
  res.redirect('/backoffice/login');
});

router.get('/backoffice/logout', (req, res) => {
  req.session = null;
  res.redirect('/backoffice/login');
});

router.get('/backoffice/pets', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const pets = execToObjects(db, 'SELECT * FROM pets ORDER BY id');
  res.render('backoffice/pets', {
    title: 'Mascotas — Backoffice',
    pets,
    page: 'pets',
    layout: false
  });
});

router.post('/backoffice/pets', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, slug } = req.body;
  req.db.runQuery("INSERT INTO pets (name, slug) VALUES ('" + name.replace(/'/g, "''") + "', '" + slug.replace(/'/g, "''") + "')");
  req.db.saveDb();
  res.redirect('/backoffice/pets');
});

router.get('/backoffice/pets/:id/edit', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const db = req.db.getDb();
  const pets = execToObjects(db, 'SELECT * FROM pets WHERE id = ' + parseInt(req.params.id));
  const pet = pets.length > 0 ? pets[0] : null;
  res.render('backoffice/pet-form', {
    title: 'Editar Mascota — Backoffice',
    pet,
    page: 'pets',
    layout: false
  });
});

router.post('/backoffice/pets/:id', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const { name, slug } = req.body;
  const id = parseInt(req.params.id);
  req.db.runQuery("UPDATE pets SET name = '" + name.replace(/'/g, "''") + "', slug = '" + slug.replace(/'/g, "''") + "' WHERE id = " + id);
  req.db.saveDb();
  res.redirect('/backoffice/pets');
});

router.get('/backoffice/pets/:id/delete', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.redirect('/backoffice/login');
  }
  const id = parseInt(req.params.id);
  req.db.runQuery('DELETE FROM pets WHERE id = ' + id);
  req.db.saveDb();
  res.redirect('/backoffice/pets');
});

module.exports = router;