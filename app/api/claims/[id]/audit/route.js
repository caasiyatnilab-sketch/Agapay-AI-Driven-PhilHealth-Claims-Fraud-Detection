import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');
const { markClaimPaidOnChain } = require('../../../../../lib/blockchain');

export async function PUT(req, { params }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') throw new Error('Unauthorized');
    
    const { id } = params;
    const { status, notes } = await req.json();
    const { Claim, ClaimHistory, Notification } = await getDb();

    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (status === 'PAID') {
      const txHash = await markClaimPaidOnChain(claim.id);
      if (txHash && (!claim.txHash || claim.txHash.length < 10)) {
        claim.txHash = txHash;
      }
    }

    claim.status = status;
    await claim.save();

    await ClaimHistory.create({
      claimId: claim.id,
      status: status,
      notes: notes || `Auditor marked claim as ${status}.`
    });

    await Notification.create({
      userId: claim.patientId,
      title: 'Claim Update',
      message: `Your claim ${claim.claimRef} is now ${status}.`
    });

    return NextResponse.json({ message: `Claim ${status}`, claim });
  } catch (error) {
    console.error('Audit block error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
