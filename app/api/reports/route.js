import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') throw new Error('Unauthorized');

    const { Claim } = await getDb();
    const claims = await Claim.findAll();

    let csv = 'ID,Claim Ref,Diagnosis,ICD10,Case Rate,Amount,Status,Risk Score,Tx Hash\n';
    claims.forEach(c => {
      csv += `${c.id},${c.claimRef},"${c.diagnosis}",${c.icd10Code},${c.caseRateType},${c.amountClaimed},${c.status},${c.riskScore},${c.txHash || ''}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="claims_report.csv"'
      }
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
