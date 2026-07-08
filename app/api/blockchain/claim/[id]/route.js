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

    // If claim exists in DB, check regular access
    if (dbClaim && !canAccess(user, dbClaim)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If it's an on-chain only claim (not in DB), only auditors can explore it for now
    // as we cannot map on-chain addresses to local user IDs without more context
    if (!dbClaim && user.role !== 'AUDITOR') {
        return NextResponse.json({ error: 'Claim not found in local records' }, { status: 404 });
    }

    // We try to get it from chain
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
    const abi = ["function getClaim(uint _id) public view returns (tuple(uint id, uint amount, address hospital, address patient, bool approved, bool paid, uint timestamp))"];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS || ethers.ZeroAddress, abi, provider);
    
    let onChainData = null;
    try {
      if (process.env.CONTRACT_ADDRESS) {
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
      }
    } catch(chainErr) {
      console.warn('Chain read failed. Proceeding with DB data only.', chainErr.message);
    }

    if (!dbClaim && !onChainData) {
      return NextResponse.json({ error: 'Claim not found anywhere.' }, { status: 404 });
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
    const status = error.message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
