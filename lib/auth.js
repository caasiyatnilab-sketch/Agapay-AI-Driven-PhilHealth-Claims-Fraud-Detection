const jwt = require('jsonwebtoken');

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is not set.');
    throw new Error('Authentication system is misconfigured');
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, secret, { issuer: 'agapay' });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Centralized authorization logic for claim access.
 * @param {Object} user - The authenticated user object from verifyAuth.
 * @param {Object} claim - The claim record (can be database object or plain object).
 * @returns {Boolean}
 */
function canAccess(user, claim) {
  if (!user || !claim) return false;

  // Auditor can see everything
  if (user.role === 'AUDITOR') return true;

  // Patient can see their own claims
  if (user.role === 'PATIENT' && claim.patientId === user.id) return true;

  // Hospital can see claims associated with their hospital
  if (user.role === 'HOSPITAL' && claim.hospitalId === user.hospitalId) return true;

  return false;
}

module.exports = { verifyAuth, canAccess };
