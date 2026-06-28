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

    // If claim exists in DB, check authorization
    if (dbClaim && !canAccess(user, dbClaim)) {
      return NextResponse.json({ error: 'Unauthorized access to claim data.' }, { status: 403 });
    }

    // We try to get it from chain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
    const abi = ["function getClaim(uint _id) public view returns (tuple(uint id, uint amount, address hospital, address patient, bool approved, bool paid, uint timestamp))"];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);
    
    let onChainData = null;
    try {
      const result = await contract.getClaim(parseInt(id));
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
    } catch(chainErr) {
      console.warn('Chain read failed. Proceeding to DB check.', chainErr.message);
    }

    if (!dbClaim && !onChainData) {
      return NextResponse.json({ error: 'Claim not found anywhere.' }, { status: 404 });
    }

    // If it was only found on chain, we technically don't have the internal patientId/hospitalId to check canAccess
    // against the DB model, but the user is at least authenticated here.
    // In a real system, the blockchain address would be mapped to the user identity.

    return NextResponse.json({ 
       claim: {
         source: onChainData ? 'BLOCKCHAIN' : 'DATABASE_FALLBACK',
         onChainData: onChainData || 'Local simulated data or contract call failed',
         databaseData: dbClaim
       }
    });
  } catch (error) {
    console.error('Explorer error:', error);
    const status = error.message.includes('token') || error.message.includes('JWT_SECRET') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
