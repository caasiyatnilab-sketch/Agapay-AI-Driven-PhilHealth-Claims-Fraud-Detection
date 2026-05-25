import { NextResponse } from 'next/server';
import axios from 'axios';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');
const { v4: uuidv4 } = require('uuid');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5000';

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    const { Claim, Hospital, User, ClaimHistory } = await getDb();

    let whereClause = {};
    if (user.role === 'PATIENT') whereClause.patientId = user.id;
    if (user.role === 'HOSPITAL') whereClause.hospitalId = user.hospitalId;

    const claims = await Claim.findAll({
      where: whereClause,
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['name', 'philhealthId'] },
        { model: ClaimHistory, as: 'history' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'PATIENT') throw new Error('Only patients can submit claims');

    const body = await req.json();
    const { hospitalId, diagnosis, icd10Code, caseRateType, amountClaimed, daysAdmitted } = body;
    const { Claim, ClaimHistory, Notification } = await getDb();

    const claimRef = `PH-${new Date().getFullYear()}-${uuidv4().substring(0, 5).toUpperCase()}`;

    // Get ML Risk Score
    let riskScore = 0.5; // fallback
    try {
      const mlRes = await axios.post(`${ML_API_URL}/predict`, {
        patient_age: 35, // Mocked for now
        amount_claimed: parseFloat(amountClaimed),
        days_admitted: parseInt(daysAdmitted),
        case_rate_type_encoded: 1,
        hospital_type: 1,
        region_encoded: 1,
        previous_claims_count: 0
      });
      if (mlRes.data && mlRes.data.risk_score !== undefined) {
        riskScore = mlRes.data.risk_score;
      }
    } catch (mlErr) {
      console.warn('ML Service unreachable, using fallback risk score.');
    }

    const claim = await Claim.create({
      claimRef,
      patientId: user.id,
      hospitalId,
      diagnosis,
      icd10Code,
      caseRateType,
      amountClaimed: parseFloat(amountClaimed),
      daysAdmitted: parseInt(daysAdmitted),
      riskScore
    });

    await ClaimHistory.create({
      claimId: claim.id,
      status: 'PENDING',
      notes: 'Claim submitted by patient.'
    });

    await Notification.create({
      userId: user.id,
      title: 'Claim Submitted',
      message: `Your claim ${claimRef} has been successfully submitted.`
    });

    return NextResponse.json({ message: 'Claim created', claim });
  } catch (error) {
    console.error('Claims POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
