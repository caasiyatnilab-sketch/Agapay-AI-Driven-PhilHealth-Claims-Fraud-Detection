import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth, canAccess } = require('../../../../lib/auth');
const { serializeClaim } = require('../../../../lib/claimRules');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    const { Claim, Hospital, User, ClaimHistory } = await getDb();

    const claim = await Claim.findByPk(id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['id', 'name', 'philhealthId'] },
        { model: ClaimHistory, as: 'history' }
      ],
      order: [[{ model: ClaimHistory, as: 'history' }, 'createdAt', 'ASC']]
    });

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    if (!canAccess(user, claim)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    return NextResponse.json({ claim: serializeClaim(claim) });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
