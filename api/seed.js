const bcrypt = require('bcryptjs');
const connectDB = require('./lib/db');
const User = require('./lib/models/User');
const Product = require('./lib/models/Product');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

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
    }

    res.json({
      message: 'Database seeded successfully',
      users: userCount === 0 ? 'Created' : 'Already exist',
      products: productCount === 0 ? 'Created' : 'Already exist'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
