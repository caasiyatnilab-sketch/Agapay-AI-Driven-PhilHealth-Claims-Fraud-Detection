const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('No authentication token provided');
    error.status = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET environment variable is not set');
    error.status = 500;
    throw error;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'agapay' });
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}

function canAccess(user, claim) {
  if (!user || !claim) return false;
  return user.role === 'AUDITOR' ||
    (user.role === 'PATIENT' && claim.patientId === user.id) ||
    (user.role === 'HOSPITAL' && claim.hospitalId === user.hospitalId);
}

module.exports = { verifyAuth, canAccess };
