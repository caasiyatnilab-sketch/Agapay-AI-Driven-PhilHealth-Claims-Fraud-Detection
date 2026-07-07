import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth, canAccess } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    const { Claim, ClaimHistory } = await getDb();

    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    if (!canAccess(user, claim)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const timeline = await ClaimHistory.findAll({
      where: { claimId: id },
      order: [['createdAt', 'ASC']]
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
