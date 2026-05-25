import { NextResponse } from 'next/server';
import { Claim, Hospital, syncDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    await syncDatabase();
    const user = verifyAuth(request);
    if (user.role !== 'AUDITOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const claims = await Claim.findAll({ 
       include: [Hospital],
       order: [['riskScore', 'DESC']] 
    });
    return NextResponse.json({ claims });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
