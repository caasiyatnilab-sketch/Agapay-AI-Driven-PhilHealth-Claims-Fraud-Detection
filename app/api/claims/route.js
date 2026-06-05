import { NextResponse } from 'next/server';
import axios from 'axios';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');
const { v4: uuidv4 } = require('uuid');
const {
  calculateHeuristicRisk,
  clampRisk,
  getRecentClaimContext,
  serializeClaim,
  toPositiveInteger,
  toPositiveNumber,
} = require('../../../lib/claimRules');
const { assertRateLimit, getErrorStatus } = require('../../../lib/security');
const { writeAuditLog } = require('../../../lib/audit');

const ML_API_URL = process.env.ML_API_URL || process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    const { Claim, Hospital, User, ClaimHistory } = await getDb();

    const whereClause = {};
    if (user.role === 'PATIENT') whereClause.patientId = user.id;
    if (user.role === 'HOSPITAL') whereClause.hospitalId = user.hospitalId;

    const claims = await Claim.findAll({
      where: whereClause,
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['id', 'name', 'philhealthId'] },
        { model: ClaimHistory, as: 'history', separate: true, order: [['createdAt', 'ASC']] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ claims: claims.map(serializeClaim) });
  } catch (error) {
    console.error('Claims GET Error:', error);
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req) {
  try {
    assertRateLimit(req, { key: 'claims:create', limit: 20, windowMs: 60_000 });
    const user = verifyAuth(req);
    if (user.role !== 'PATIENT') throw new Error('Only patients can submit claims');

    const body = await req.json();
    const { hospitalId, diagnosis, icd10Code, caseRateType } = body;
    const amountClaimed = toPositiveNumber(body.amountClaimed, 'Amount claimed', { max: 1000000 });
    const daysAdmitted = toPositiveInteger(body.daysAdmitted, 'Days admitted', { max: 365 });

    if (!hospitalId) throw new Error('Hospital is required.');
    if (!diagnosis || String(diagnosis).trim().length < 2) throw new Error('Diagnosis is required.');
    if (!icd10Code || String(icd10Code).trim().length < 2) throw new Error('ICD-10 code is required.');
    if (!caseRateType) throw new Error('Case rate type is required.');

    const db = await getDb();
    const { Claim, ClaimHistory, Hospital, Notification } = db;
    const hospital = await Hospital.findByPk(hospitalId);
    if (!hospital) return NextResponse.json({ error: 'Selected hospital does not exist.' }, { status: 400 });

    const context = await getRecentClaimContext({
      Claim,
      patientId: user.id,
      hospitalId,
      diagnosis: String(diagnosis).trim(),
    });
    const heuristic = calculateHeuristicRisk({ amountClaimed, daysAdmitted, caseRateType, ...context });

    let riskScore = heuristic.riskScore;
    let riskSource = 'RULE_ENGINE';
    try {
      const mlRes = await axios.post(`${ML_API_URL}/predict`, {
        patient_age: 35,
        amount_claimed: amountClaimed,
        days_admitted: daysAdmitted,
        case_rate_type_encoded: String(caseRateType).toUpperCase() === 'SURGICAL' ? 2 : 1,
        hospital_type: 1,
        region_encoded: 1,
        previous_claims_count: context.previousClaimsCount,
        duplicate_claims_count: context.duplicateCount,
      }, { timeout: 2500 });

      if (mlRes.data && mlRes.data.risk_score !== undefined) {
        riskScore = Math.max(heuristic.riskScore, clampRisk(mlRes.data.risk_score));
        riskSource = 'ML_AND_RULE_ENGINE';
      }
    } catch (mlErr) {
      console.warn('ML Service unreachable, using rule-engine fallback risk score.', mlErr.message);
    }

    const claimRef = `PH-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    const claim = await Claim.create({
      claimRef,
      patientId: user.id,
      hospitalId,
      diagnosis: String(diagnosis).trim(),
      icd10Code: String(icd10Code).trim().toUpperCase(),
      caseRateType: String(caseRateType).trim().toUpperCase(),
      amountClaimed,
      daysAdmitted,
      riskScore
    });

    await ClaimHistory.create({
      claimId: claim.id,
      status: 'PENDING',
      notes: `Claim submitted by patient. Risk source: ${riskSource}. Signals: ${heuristic.signals.join('; ')}`
    });

    await writeAuditLog(db, {
      actorUserId: user.id,
      action: 'CLAIM_SUBMITTED',
      entityType: 'Claim',
      entityId: claim.id,
      metadata: { claimRef, riskScore, riskSource, signals: heuristic.signals },
      req,
    });

    await Notification.bulkCreate([
      {
        userId: user.id,
        title: 'Claim Submitted',
        message: `Your claim ${claimRef} has been submitted with ${heuristic.priority.toLowerCase()} review priority.`
      },
      {
        userId: user.id,
        title: 'Fraud Screening Complete',
        message: `AI/rule screening score: ${(riskScore * 100).toFixed(1)}%. ${heuristic.signals.join('; ')}`
      }
    ]);

    return NextResponse.json({
      message: 'Claim created',
      claim: serializeClaim(claim),
      screening: { ...heuristic, riskScore, riskSource }
    }, { status: 201 });
  } catch (error) {
    console.error('Claims POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: getErrorStatus(error, 400) });
  }
}
