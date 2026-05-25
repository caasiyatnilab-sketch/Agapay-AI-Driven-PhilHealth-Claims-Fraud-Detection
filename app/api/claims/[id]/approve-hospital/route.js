import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');
const { recordClaimOnChain } = require('../../../../../lib/blockchain');

export async function PUT(req, { params }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'HOSPITAL') throw new Error('Unauthorized');
    
    const { id } = params;
    const { approved, remarks } = await req.json();
    const { Claim, ClaimHistory } = await getDb();

    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (claim.hospitalId !== user.hospitalId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const newStatus = approved ? 'APPROVED' : 'REJECTED';
    
    // Save to blockchain
    const txHash = await recordClaimOnChain(
      claim.id, 
      claim.amountClaimed, 
      '0x0000000000000000000000000000000000000001', // mock address
      '0x0000000000000000000000000000000000000002', // mock address
      approved
    );

    claim.status = newStatus;
    if (txHash) claim.txHash = txHash;
    await claim.save();

    await ClaimHistory.create({
      claimId: claim.id,
      status: newStatus,
      notes: remarks || `Hospital ${newStatus.toLowerCase()} the claim.`
    });

    return NextResponse.json({ message: `Claim ${newStatus}`, claim });
  } catch (error) {
    console.error('Approve block error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
