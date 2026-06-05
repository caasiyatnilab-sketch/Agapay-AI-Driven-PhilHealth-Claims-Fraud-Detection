import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth } = require('../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    const { Claim, Hospital, User, ClaimHistory } = await getDb();

    const claim = await Claim.findByPk(id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['name', 'philhealthId'] },
        { model: ClaimHistory, as: 'history' }
      ]
    });

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    // Authorization check: Patients can only see their own claims, Hospitals can only see their own hospital's claims.
    if (user.role === 'PATIENT' && claim.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to this claim' }, { status: 403 });
    }
    if (user.role === 'HOSPITAL' && claim.hospitalId !== user.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized access to this claim' }, { status: 403 });
    }

    return NextResponse.json({ claim });
  } catch (error) {
    const status = (error.message.includes('token') || error.message.includes('authentication')) ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
