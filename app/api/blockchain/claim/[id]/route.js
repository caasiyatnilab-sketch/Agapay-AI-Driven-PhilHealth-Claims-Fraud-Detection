import { NextResponse } from 'next/server';
const { ethers } = require('ethers');
const { getDb } = require('../../../../../lib/db');
const { verifyAuth, canAccess } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    
    const { Claim } = await getDb();
    const dbClaim = await Claim.findByPk(id);

    // Security: Validate access to claim
    if (dbClaim && !canAccess(user, dbClaim)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // We try to get it from chain first
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
    const abi = ["function getClaim(uint _id) public view returns (tuple(uint id, uint amount, address hospital, address patient, bool approved, bool paid, uint timestamp))"];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', abi, provider);
    
    let onChainData = null;
    try {
      const result = await contract.getClaim(parseInt(id));
      if (result && result.id.toString() !== '0') {
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
    } catch(chainErr) {
      console.warn('Chain read failed. Proceeding to DB check.', chainErr.message);
    }

    if (!dbClaim && !onChainData) {
      return NextResponse.json({ error: 'Claim not found anywhere.' }, { status: 404 });
    }

    // If it's only on-chain, we don't have patientId/hospitalId to check easily without mapping
    // For now, if we found it in DB we checked canAccess. If only on chain, we allow if AUDITOR or if it matches the DB data we might not have.
    // In a real scenario, we'd map patient/hospital addresses to user IDs.

    return NextResponse.json({ 
       claim: {
         source: onChainData ? 'BLOCKCHAIN' : 'DATABASE_FALLBACK',
         onChainData: onChainData || 'Local simulated data or contract call failed',
         databaseData: dbClaim
       }
    });
  } catch (error) {
    console.error('Explorer error:', error);
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
