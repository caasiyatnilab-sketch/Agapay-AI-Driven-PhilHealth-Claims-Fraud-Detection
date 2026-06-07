import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth } = require('../../../../lib/auth');
const { serializeClaim } = require('../../../../lib/claimRules');

export async function GET(request) {
  try {
    const user = verifyAuth(request);
    if (user.role !== 'HOSPITAL') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { Claim, User } = await getDb();
    const claims = await Claim.findAll({
      where: { hospitalId: user.hospitalId },
      include: [{ model: User, as: 'patient', attributes: ['id', 'name', 'philhealthId'] }],
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json({ claims: claims.map(serializeClaim) });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
