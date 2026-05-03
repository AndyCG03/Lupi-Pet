const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// ── View Engine ──
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

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ──
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`\n🐾 Lupi Pet corriendo en http://localhost:${PORT}\n`);
});
