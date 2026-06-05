import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    const { Claim, ClaimHistory } = await getDb();

    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    const canAccess = user.role === 'AUDITOR' ||
      (user.role === 'PATIENT' && claim.patientId === user.id) ||
      (user.role === 'HOSPITAL' && claim.hospitalId === user.hospitalId);
    if (!canAccess) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const timeline = await ClaimHistory.findAll({
      where: { claimId: id },
      order: [['createdAt', 'ASC']]
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
