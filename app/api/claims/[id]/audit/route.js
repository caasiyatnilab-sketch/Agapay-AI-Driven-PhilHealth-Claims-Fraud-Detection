import { NextResponse } from 'next/server';
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');
const { markClaimPaidOnChain } = require('../../../../../lib/blockchain');
const { assertTransition, serializeClaim } = require('../../../../../lib/claimRules');

export async function PUT(req, { params }) {
  try {
    const user = verifyAuth(req);
    if (user.role !== 'AUDITOR') throw new Error('Unauthorized');

    const { id } = params;
    const { status, notes } = await req.json();
    const nextStatus = String(status || '').toUpperCase();
    const { Claim, ClaimHistory, Notification } = await getDb();

    const claim = await Claim.findByPk(id);
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    assertTransition(claim.status, nextStatus, user.role);

    if (nextStatus === 'PAID') {
      const txHash = await markClaimPaidOnChain(claim.id);
      if (txHash) claim.txHash = txHash;
    }

    claim.status = nextStatus;
    await claim.save();

    await ClaimHistory.create({
      claimId: claim.id,
      status: nextStatus,
      notes: notes || `Auditor marked claim as ${nextStatus}.`
    });

    await Notification.create({
      userId: claim.patientId,
      title: 'Claim Update',
      message: `Your claim ${claim.claimRef} is now ${nextStatus}.`
    });

    return NextResponse.json({ message: `Claim ${nextStatus}`, claim: serializeClaim(claim) });
  } catch (error) {
    console.error('Audit block error:', error);
    const status = error.message === 'Unauthorized' ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
