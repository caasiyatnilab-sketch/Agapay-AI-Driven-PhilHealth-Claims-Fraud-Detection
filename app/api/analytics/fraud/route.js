import { NextResponse } from 'next/server';
const { getDb } = require('../../../../lib/db');
const { verifyAuth } = require('../../../../lib/auth');

export async function GET(req) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { Claim, Hospital } = await getDb();
    const claims = await Claim.findAll({ include: [{ model: Hospital, as: 'hospital' }] });

    const summary = claims.reduce((acc, claim) => {
      acc.totalClaims += 1;
      acc.totalAmount += claim.amountClaimed || 0;
      acc.byStatus[claim.status] = (acc.byStatus[claim.status] || 0) + 1;
      const riskBand = claim.riskScore >= 0.7 ? 'HIGH' : claim.riskScore >= 0.35 ? 'MEDIUM' : 'LOW';
      acc.byRisk[riskBand] = (acc.byRisk[riskBand] || 0) + 1;
      const hospitalName = claim.hospital?.name || 'Unknown Hospital';
      if (!acc.byHospital[hospitalName]) acc.byHospital[hospitalName] = { claims: 0, amount: 0, highRisk: 0 };
      acc.byHospital[hospitalName].claims += 1;
      acc.byHospital[hospitalName].amount += claim.amountClaimed || 0;
      if (riskBand === 'HIGH') acc.byHospital[hospitalName].highRisk += 1;
      return acc;
    }, {
      totalClaims: 0,
      totalAmount: 0,
      byStatus: {},
      byRisk: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      byHospital: {},
    });

    const topRiskHospitals = Object.entries(summary.byHospital)
      .map(([hospital, metrics]) => ({ hospital, ...metrics }))
      .sort((a, b) => b.highRisk - a.highRisk || b.amount - a.amount)
      .slice(0, 10);

    return NextResponse.json({ summary: { ...summary, topRiskHospitals } });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
