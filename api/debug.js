const connectDB = require('./lib/db');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const result = {
    env_check: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET ✓' : 'MISSING ✗',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET ✓' : 'MISSING ✗',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    },
    mongodb_uri_preview: process.env.MONGODB_URI ?
      process.env.MONGODB_URI.substring(0, 20) + '...' :
      'NOT SET',
    timestamp: new Date().toISOString(),
    mongoose_version: mongoose.version,
    connection_test: 'pending'
  };

  // Try to connect
  try {
    await connectDB();
    result.connection_test = 'SUCCESS ✓';
    result.mongodb_status = mongoose.connection.readyState;
  } catch (error) {
    result.connection_test = 'FAILED ✗';
    result.error_message = error.message;
    result.error_name = error.name;
  }

  res.json(result);
};
