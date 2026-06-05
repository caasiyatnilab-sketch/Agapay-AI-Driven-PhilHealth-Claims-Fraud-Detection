const { Op } = require('sequelize');

const VALID_ROLES = new Set(['PATIENT', 'HOSPITAL', 'AUDITOR']);
const VALID_STATUSES = new Set(['PENDING', 'APPROVED', 'REJECTED', 'PAID']);
const VALID_AUDIT_STATUSES = new Set(['APPROVED', 'REJECTED', 'PAID']);
const VALID_HOSPITAL_DECISIONS = new Set(['APPROVED', 'REJECTED']);

const CASE_RATE_LIMITS = {
  MEDICAL: 75000,
  SURGICAL: 150000,
  default: 100000,
};

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toPositiveNumber(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= min || parsed > max) {
    throw new Error(`${fieldName} must be greater than ${min} and no more than ${max}.`);
  }
  return parsed;
}

function toPositiveInteger(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= min || parsed > max) {
    throw new Error(`${fieldName} must be an integer greater than ${min} and no more than ${max}.`);
  }
  return parsed;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function clampRisk(score) {
  const parsed = Number(score);
  if (!Number.isFinite(parsed)) return 0.5;
  return Math.min(1, Math.max(0, parsed));
}

function calculateHeuristicRisk({ amountClaimed, daysAdmitted, caseRateType, previousClaimsCount = 0, duplicateCount = 0 }) {
  const amount = Number(amountClaimed) || 0;
  const days = Number(daysAdmitted) || 0;
  const normalizedCaseRateType = String(caseRateType || '').toUpperCase();
  const amountLimit = CASE_RATE_LIMITS[normalizedCaseRateType] || CASE_RATE_LIMITS.default;

  let score = 0.18;
  const signals = [];

  if (amount > amountLimit) {
    score += 0.3;
    signals.push(`Amount exceeds expected ${normalizedCaseRateType || 'case'} benchmark`);
  }

  if (days >= 14) {
    score += 0.18;
    signals.push('Long admission duration');
  } else if (days <= 1 && amount > amountLimit * 0.6) {
    score += 0.14;
    signals.push('High amount for very short admission');
  }

  if (previousClaimsCount >= 3) {
    score += 0.16;
    signals.push('Patient has elevated recent claim volume');
  }

  if (duplicateCount > 0) {
    score += 0.28;
    signals.push('Possible duplicate claim for same hospital and diagnosis');
  }

  if (signals.length === 0) {
    signals.push('No major rule-based fraud indicators');
  }

  return {
    riskScore: clampRisk(score),
    signals,
    priority: score >= 0.7 ? 'HIGH' : score >= 0.35 ? 'MEDIUM' : 'LOW',
  };
}

function assertTransition(currentStatus, nextStatus, actorRole) {
  if (!VALID_STATUSES.has(nextStatus)) throw new Error('Invalid claim status.');

  if (actorRole === 'HOSPITAL') {
    if (!VALID_HOSPITAL_DECISIONS.has(nextStatus)) throw new Error('Hospitals may only approve or reject claims.');
    if (currentStatus !== 'PENDING') throw new Error('Hospital decisions are only allowed for pending claims.');
    return;
  }

  if (actorRole === 'AUDITOR') {
    if (!VALID_AUDIT_STATUSES.has(nextStatus)) throw new Error('Auditors may only approve, reject, or mark claims as paid.');
    if (nextStatus === 'PAID' && currentStatus !== 'APPROVED') {
      throw new Error('Only approved claims can be marked as paid.');
    }
    return;
  }

  throw new Error('Unauthorized claim status transition.');
}

function serializeClaim(claim) {
  const plain = typeof claim?.toJSON === 'function' ? claim.toJSON() : claim;
  if (!plain) return plain;
  const riskScore = clampRisk(plain.riskScore);
  return {
    ...plain,
    riskScore,
    riskLevel: riskScore >= 0.7 ? 'HIGH' : riskScore >= 0.35 ? 'MEDIUM' : 'LOW',
    requiresManualReview: riskScore >= 0.7 || plain.status === 'REJECTED',
  };
}

async function getRecentClaimContext({ Claim, patientId, hospitalId, diagnosis }) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const previousClaimsCount = await Claim.count({
    where: {
      patientId,
      createdAt: { [Op.gte]: thirtyDaysAgo },
    },
  });
  const duplicateCount = await Claim.count({
    where: {
      patientId,
      hospitalId,
      diagnosis,
      createdAt: { [Op.gte]: thirtyDaysAgo },
    },
  });
  return { previousClaimsCount, duplicateCount };
}

module.exports = {
  VALID_ROLES,
  VALID_STATUSES,
  VALID_AUDIT_STATUSES,
  normalizeEmail,
  toPositiveNumber,
  toPositiveInteger,
  csvEscape,
  clampRisk,
  calculateHeuristicRisk,
  assertTransition,
  serializeClaim,
  getRecentClaimContext,
};
