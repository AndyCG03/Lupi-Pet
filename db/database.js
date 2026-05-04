const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'lupi.db');
const ADMIN_USER = 'admin';
const DEFAULT_PASSWORD_HASH = crypto.createHash('sha256').update('lupi2025').digest('hex');

let db = null;

async function loadDb() {
  const SQL = await initSqlJs();
  
  let data = null;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
  }
  
  db = new SQL.Database(data);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      pet TEXT DEFAULT 'ambos',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  try { db.run("ALTER TABLE categories ADD COLUMN pet TEXT DEFAULT 'ambos'"); } catch(e) {}
  
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      pet TEXT NOT NULL,
      price REAL NOT NULL,
      emoji TEXT,
      image TEXT,
      badge TEXT,
      description TEXT,
      stock INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      pet TEXT NOT NULL,
      date TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      read_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  try { db.run("ALTER TABLE blog_posts ADD COLUMN image TEXT"); } catch(e) {}
  
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_user (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const catResult = db.exec('SELECT COUNT(*) as count FROM categories');
  const catCount = catResult.length > 0 ? catResult[0].values[0][0] : 0;
  
  if (catCount === 0) {
    db.run("INSERT INTO categories (name, slug, pet) VALUES ('Alimentos', 'alimentos', 'ambos')");
    db.run("INSERT INTO categories (name, slug, pet) VALUES ('Accesorios', 'accesorios', 'ambos')");
    db.run("INSERT INTO categories (name, slug, pet) VALUES ('Higiene', 'higiene', 'ambos')");
  }
  
  const adminResult = db.exec('SELECT COUNT(*) as count FROM admin_user');
  const adminCount = adminResult.length > 0 ? adminResult[0].values[0][0] : 0;
  
  if (adminCount === 0) {
    db.run("INSERT INTO admin_user (username, password_hash) VALUES ('" + ADMIN_USER + "', '" + DEFAULT_PASSWORD_HASH + "')");
    saveDb();
  }
}

function runQuery(query, params = []) {
  if (params.length > 0) {
    query = query.replace(/\?/g, () => {
      const p = params.shift();
      if (typeof p === 'string') return "'" + p.replace(/'/g, "''") + "'";
      return p;
    });
  }
  db.run(query);
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDb() {
  return db;
}

function getPasswordHash(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return getPasswordHash(password) === hash;
}

function getAdminUser() {
  const result = db.exec('SELECT * FROM admin_user WHERE id = 1');
  if (result.length > 0 && result[0].values.length > 0) {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = result[0].values[0][i]);
    return obj;
  }
  return null;
}

function updatePassword(newHash) {
  db.run('UPDATE admin_user SET password_hash = ' + newHash + ' WHERE id = 1');
  saveDb();
}

module.exports = { loadDb, saveDb, getDb, getPasswordHash, verifyPassword, getAdminUser, updatePassword, runQuery };