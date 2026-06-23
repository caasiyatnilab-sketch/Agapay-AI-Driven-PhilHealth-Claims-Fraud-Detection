const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }
    return jwt.verify(token, secret, { issuer: 'agapay' });
  } catch (error) {
    if (error.message.includes('JWT_SECRET')) throw error;
    throw new Error('Invalid or expired token');
  }
}

/**
 * Checks if a user has permission to access a specific claim.
 * @param {Object} user - The authenticated user from the JWT.
 * @param {Object} claim - The claim record from the database.
 * @returns {boolean} - True if access is permitted.
 */
function canAccess(user, claim) {
  if (!user || !claim) return false;
  return user.role === 'AUDITOR' ||
    (user.role === 'PATIENT' && claim.patientId === user.id) ||
    (user.role === 'HOSPITAL' && claim.hospitalId === user.hospitalId);
}

module.exports = { verifyAuth, canAccess };
