const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, secret, { issuer: 'agapay' });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

function canAccess(user, claim) {
  if (!user || !claim) return false;
  if (user.role === 'AUDITOR') return true;
  if (user.role === 'PATIENT' && claim.patientId === user.id) return true;
  if (user.role === 'HOSPITAL' && claim.hospitalId === user.hospitalId) return true;
  return false;
}

module.exports = { verifyAuth, canAccess };
