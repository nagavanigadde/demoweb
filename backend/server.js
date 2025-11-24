require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/User');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/demoweb';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Seed default users and products
const seedDatabase = async () => {
  try {
    // Seed users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const users = [
        { username: 'admin1', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
        { username: 'admin2', password: bcrypt.hashSync('admin456', 10), role: 'admin' },
        { username: 'user1', password: bcrypt.hashSync('user123', 10), role: 'user' },
        { username: 'user2', password: bcrypt.hashSync('user456', 10), role: 'user' }
      ];

      await User.insertMany(users);
      console.log('Default users created:');
      console.log('  Admin users: admin1/admin123, admin2/admin456');
      console.log('  Normal users: user1/user123, user2/user456');
    }

    // Seed products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        { name: 'Laptop', price: 999.99, description: 'High-performance laptop' },
        { name: 'Smartphone', price: 699.99, description: 'Latest smartphone model' },
        { name: 'Headphones', price: 149.99, description: 'Wireless noise-canceling headphones' },
        { name: 'Keyboard', price: 79.99, description: 'Mechanical gaming keyboard' },
        { name: 'Mouse', price: 49.99, description: 'Ergonomic wireless mouse' }
      ];

      await Product.insertMany(products);
      console.log('Sample products created');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

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
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Get all products (with optional search)
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;

    let products;
    if (search) {
      products = await Product.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    } else {
      products = await Product.find();
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new product (admin only)
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newProduct = new Product({
      name,
      price,
      description: description || ''
    });

    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
