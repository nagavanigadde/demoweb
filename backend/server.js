const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'database.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT
  );
`);

// Seed default users (2 admins, 2 normal users)
const seedUsers = () => {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

  if (existingUsers.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');

    const users = [
      { username: 'admin1', password: 'admin123', role: 'admin' },
      { username: 'admin2', password: 'admin456', role: 'admin' },
      { username: 'user1', password: 'user123', role: 'user' },
      { username: 'user2', password: 'user456', role: 'user' }
    ];

    users.forEach(user => {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      insertUser.run(user.username, hashedPassword, user.role);
    });

    console.log('Default users created:');
    console.log('  Admin users: admin1/admin123, admin2/admin456');
    console.log('  Normal users: user1/user123, user2/user456');
  }
};

// Seed some sample products
const seedProducts = () => {
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();

  if (existingProducts.count === 0) {
    const insertProduct = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');

    const products = [
      { name: 'Laptop', price: 999.99, description: 'High-performance laptop' },
      { name: 'Smartphone', price: 699.99, description: 'Latest smartphone model' },
      { name: 'Headphones', price: 149.99, description: 'Wireless noise-canceling headphones' },
      { name: 'Keyboard', price: 79.99, description: 'Mechanical gaming keyboard' },
      { name: 'Mouse', price: 49.99, description: 'Ergonomic wireless mouse' }
    ];

    products.forEach(product => {
      insertProduct.run(product.name, product.price, product.description);
    });

    console.log('Sample products created');
  }
};

seedUsers();
seedProducts();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Get all products (with optional search)
app.get('/api/products', authenticateToken, (req, res) => {
  const { search } = req.query;

  let products;
  if (search) {
    products = db.prepare(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?'
    ).all(`%${search}%`, `%${search}%`);
  } else {
    products = db.prepare('SELECT * FROM products').all();
  }

  res.json(products);
});

// Add new product (admin only)
app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, price, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const result = db.prepare(
    'INSERT INTO products (name, price, description) VALUES (?, ?, ?)'
  ).run(name, price, description || '');

  const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json(newProduct);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
