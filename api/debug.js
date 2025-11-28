module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.json({
    env_check: {
      MONGODB_URI: process.env.MONGODB_URI ? 'SET ✓' : 'MISSING ✗',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET ✓' : 'MISSING ✗',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    },
    mongodb_uri_preview: process.env.MONGODB_URI ?
      process.env.MONGODB_URI.substring(0, 20) + '...' :
      'NOT SET',
    timestamp: new Date().toISOString()
  });
};
