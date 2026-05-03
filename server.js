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
  next();
});

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => (a * b).toFixed(2),
    json: (ctx) => JSON.stringify(ctx),
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