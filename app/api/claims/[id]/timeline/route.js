import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    const { Claim, ClaimHistory } = await getDb();

    // Check if claim exists and if user is authorized to see it
    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    if (user.role === 'PATIENT' && claim.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }
    if (user.role === 'HOSPITAL' && claim.hospitalId !== user.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const timeline = await ClaimHistory.findAll({
      where: { claimId: id },
      order: [['createdAt', 'ASC']]
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    const status = (error.message.includes('token') || error.message.includes('authentication')) ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
