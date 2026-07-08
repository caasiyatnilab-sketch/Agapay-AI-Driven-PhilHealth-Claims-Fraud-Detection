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

/**
 * Authorization helper to check if a user can access a specific claim.
 * @param {Object} user - The decoded user object from JWT.
 * @param {Object} claim - The claim object (must have patientId and hospitalId).
 * @returns {boolean}
 */
function canAccess(user, claim) {
  if (!user || !user.role) return false;
  if (user.role === 'AUDITOR') return true;
  if (user.role === 'PATIENT') return claim && claim.patientId === user.id;
  if (user.role === 'HOSPITAL') return claim && claim.hospitalId === user.hospitalId;
  return false;
}

module.exports = { verifyAuth, canAccess };
