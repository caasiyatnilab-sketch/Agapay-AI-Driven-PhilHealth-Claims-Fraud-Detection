import { NextResponse } from 'next/server';
import { Claim, syncDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    await syncDatabase();
    const user = verifyAuth(request);
    if (user.role !== 'HOSPITAL') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const claims = await Claim.findAll({ where: { hospitalId: user.hospitalId }, order: [['createdAt', 'DESC']] });
    return NextResponse.json({ claims });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
