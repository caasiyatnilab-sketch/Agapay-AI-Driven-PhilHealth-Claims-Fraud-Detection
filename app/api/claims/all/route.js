import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth } = require('../../../../lib/auth');
const { serializeClaim } = require('../../../../lib/claimRules');

export async function GET(request) {
  try {
    const user = verifyAuth(request);
    if (user.role !== 'AUDITOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { Claim, Hospital, User } = await getDb();
    const claims = await Claim.findAll({
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['id', 'name', 'philhealthId'] },
      ],
      order: [['riskScore', 'DESC'], ['createdAt', 'DESC']]
    });
    return NextResponse.json({ claims: claims.map(serializeClaim) });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
