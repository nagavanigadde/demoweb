const connectDB = require('./lib/db');
const Product = require('./lib/models/Product');
const { verifyToken } = require('./lib/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const auth = verifyToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
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

      return res.json(products);
    }

    if (req.method === 'POST') {
      if (auth.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

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

      return res.status(201).json(newProduct);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
