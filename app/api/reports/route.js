import { NextResponse } from 'next/server';
const { getDb } = require('../../../lib/db');
const { verifyAuth } = require('../../../lib/auth');
const { csvEscape } = require('../../../lib/claimRules');

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') throw new Error('Unauthorized');

    const { Claim, Hospital, User } = await getDb();
    const claims = await Claim.findAll({
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['name', 'philhealthId'] },
      ],
      order: [['createdAt', 'DESC']]
    });

    const headers = ['ID', 'Claim Ref', 'Patient', 'PhilHealth ID', 'Hospital', 'Diagnosis', 'ICD10', 'Case Rate', 'Amount', 'Days Admitted', 'Status', 'Risk Score', 'Risk Level', 'Tx Hash', 'Created At'];
    const rows = claims.map(c => {
      const riskLevel = c.riskScore >= 0.7 ? 'HIGH' : c.riskScore >= 0.35 ? 'MEDIUM' : 'LOW';
      return [c.id, c.claimRef, c.patient?.name, c.patient?.philhealthId, c.hospital?.name, c.diagnosis, c.icd10Code, c.caseRateType, c.amountClaimed, c.daysAdmitted, c.status, c.riskScore, riskLevel, c.txHash || '', c.createdAt?.toISOString?.() || c.createdAt];
    });
    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="claims_report.csv"'
      }
    });
  } catch (error) {
    console.error('Reports API error:', error);
    const status = error.message === 'Unauthorized' ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
