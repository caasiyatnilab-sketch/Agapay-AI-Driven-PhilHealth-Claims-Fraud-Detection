const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'agapay' });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = { verifyAuth };
