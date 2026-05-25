import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth } = require('../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    verifyAuth(req);
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

    return NextResponse.json({ claim });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
