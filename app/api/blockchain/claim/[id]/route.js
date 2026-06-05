import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { getBlockchainContract } = require('../../../../../lib/blockchain');

export async function GET(req, { params }) {
  try {
    const { id } = params;
    let onChainData = null;

    try {
      const contract = await getBlockchainContract();
      if (contract) {
        const result = await contract.getClaim(Number.parseInt(id, 10));
        if (result.id.toString() !== '0') {
          onChainData = {
            id: result.id.toString(),
            amount: result.amount.toString(),
            hospital: result.hospital,
            patient: result.patient,
            approved: result.approved,
            paid: result.paid,
            timestamp: result.timestamp.toString()
          };
        }
      }
    } catch (chainErr) {
      console.warn('Chain read failed. Proceeding to DB check.', chainErr.message);
    }

    const { Claim, Hospital, User } = await getDb();
    const dbClaim = await Claim.findByPk(id, {
      include: [
        { model: Hospital, as: 'hospital' },
        { model: User, as: 'patient', attributes: ['name', 'philhealthId'] }
      ]
    });

    if (!dbClaim && !onChainData) {
      return NextResponse.json({ error: 'Claim not found anywhere.' }, { status: 404 });
    }

    return NextResponse.json({
      claim: {
        source: onChainData ? 'BLOCKCHAIN' : 'DATABASE_FALLBACK',
        onChainData: onChainData || 'Local database record; live contract data unavailable.',
        databaseData: dbClaim
      }
    });
  } catch (error) {
    console.error('Explorer error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
