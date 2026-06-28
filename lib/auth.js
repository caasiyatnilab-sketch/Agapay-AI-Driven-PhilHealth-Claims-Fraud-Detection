const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET configuration missing');
  }

  try {
    return jwt.verify(token, secret, { issuer: 'agapay' });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Basic authorization helper to check if a user can access a claim resource.
 */
function canAccess(user, claim) {
  if (!user || !claim) return false;
  if (user.role === 'AUDITOR') return true;
  if (user.role === 'HOSPITAL') return claim.hospitalId === user.hospitalId;
  if (user.role === 'PATIENT') return claim.patientId === user.id;
  return false;
}

module.exports = { verifyAuth, canAccess };
