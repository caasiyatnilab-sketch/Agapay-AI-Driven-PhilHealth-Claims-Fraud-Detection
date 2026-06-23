import { NextResponse } from 'next/server';
const { ethers } = require('ethers');
const { getDb } = require('../../../../../lib/db');
const { verifyAuth, canAccess } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;
    
    // We try to get it from chain first
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

    const { Claim } = await getDb();
    const dbClaim = await Claim.findByPk(id);

    if (!dbClaim && !onChainData) {
      return NextResponse.json({ error: 'Claim not found anywhere.' }, { status: 404 });
    }

    // Security check: Ensure user has permission to view this claim
    if (dbClaim && !canAccess(user, dbClaim)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ 
       claim: {
         source: onChainData ? 'BLOCKCHAIN' : 'DATABASE_FALLBACK',
         onChainData: onChainData || 'Local simulated data or contract call failed',
         databaseData: dbClaim
       }
    });
  } catch (error) {
    console.error('Explorer error:', error);
    const isAuthError = error.message.includes('token');
    const status = isAuthError ? 401 : 500;
    const message = isAuthError ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
