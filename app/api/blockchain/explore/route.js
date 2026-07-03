import { NextResponse } from 'next/server';
import { getBlockchainContract } from '@/lib/blockchain';
const { verifyAuth } = require('@/lib/auth');

export async function GET(req) {
  try {
    verifyAuth(req);
    const contract = await getBlockchainContract();
    
    if (!contract) {
       return NextResponse.json({ 
           status: 'SIMULATION',
           events: [
               { type: 'RECORDED', claimId: '1', amount: '5000', hospital: '0xSimulatedHosp...', txHash: '0xSim1...', blockNumber: 1 },
               { type: 'PAID', claimId: '1', txHash: '0xSim2...', blockNumber: 2 }
           ] 
       });
    }
    
    const recorded = await contract.queryFilter("ClaimRecorded");
    const paid = await contract.queryFilter("ClaimPaid");
    
    const events = [
      ...recorded.map((e) => ({
        type: 'RECORDED',
        claimId: e.args[0].toString(),
        amount: e.args[1].toString(),
        hospital: e.args[2],
        patient: e.args[3],
        approved: e.args[4],
        txHash: e.transactionHash,
        blockNumber: e.blockNumber
      })),
      ...paid.map((e) => ({
        type: 'PAID',
        claimId: e.args[0].toString(),
        txHash: e.transactionHash,
        blockNumber: e.blockNumber
      }))
    ];

    events.sort((a, b) => b.blockNumber - a.blockNumber);

    return NextResponse.json({ status: 'LIVE', events });
  } catch (error) {
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
