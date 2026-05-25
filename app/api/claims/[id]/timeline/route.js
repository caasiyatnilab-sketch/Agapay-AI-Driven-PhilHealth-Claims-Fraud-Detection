import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    verifyAuth(req);
    const { id } = params;
    const { ClaimHistory } = await getDb();

    const timeline = await ClaimHistory.findAll({
      where: { claimId: id },
      order: [['createdAt', 'ASC']]
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
