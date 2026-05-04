const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const multer = require('multer');
const { loadDb } = require('./db/database');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

app.use(session({
  secret: 'lupi-pet-secret',
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  req.db = require('./db/database');
  req.upload = upload;
  const reqPath = req.path;
  if (reqPath.startsWith('/backoffice') && !reqPath.includes('/login')) {
    if (reqPath === '/backoffice' || reqPath === '/backoffice/') res.locals.page = 'dashboard';
    else if (reqPath.includes('/products')) res.locals.page = 'products';
    else if (reqPath.includes('/categories')) res.locals.page = 'categories';
    else if (reqPath.includes('/blog')) res.locals.page = 'blog';
    else if (reqPath.includes('/password')) res.locals.page = 'password';
  }
  next();
});

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    ifEquals: (a, b) => a === b ? 'selected' : '',
    multiply: (a, b) => (a * b).toFixed(2),
    json: (ctx) => JSON.stringify(ctx),
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    gt: (a, b) => a > b,
    lt: (a, b) => a < b,
    petLabel: (pet, pet_name) => {
      if (pet === 'ambos') return 'Ambos';
      if (pet === true) return 'Perro';
      if (pet === false) return 'Gato';
      if (pet === 'true') return 'Perro';
      if (pet === 'false') return 'Gato';
      if (pet === 'perro') return 'Perro';
      if (pet === 'gato') return 'Gato';
      if (pet_name && typeof pet_name === 'string') return pet_name;
      return pet === 'ambos' ? 'Ambos' : (pet || '');
    },
    stockLabel: (stock) => {
      console.log('DEBUG stock:', stock, typeof stock);
      if (stock === 'sin-stock') return 'Sin stock';
      if (stock === 'pocos') return 'Pocos';
      if (stock === false || stock === 'false' || stock === 0) return 'Sin stock';
      return 'En stock';
    },
    stockClass: (stock) => {
      if (stock === 'sin-stock') return 'out';
      if (stock === false || stock === 'false' || stock === 0) return 'out';
      return 'in';
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/backoffice'));

loadDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🐾 Lupi Pet corriendo en http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Error al cargar la base de datos:', err);
});