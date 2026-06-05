const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./security');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, getJwtSecret(), { issuer: 'agapay' });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = { verifyAuth };
