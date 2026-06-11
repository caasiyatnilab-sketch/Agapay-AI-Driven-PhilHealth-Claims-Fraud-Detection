import { NextResponse } from 'next/server';
const { ethers } = require('ethers');
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');

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

    // Access control
    const patientId = dbClaim ? dbClaim.patientId : (onChainData ? onChainData.patient : null);
    const hospitalId = dbClaim ? dbClaim.hospitalId : null; // We might not have hospitalId mapping for blockchain address easily here without more lookups

    const isOwner = user.role === 'AUDITOR' ||
                    (user.role === 'PATIENT' && patientId && String(patientId) === String(user.id)) ||
                    (user.role === 'HOSPITAL' && hospitalId && String(hospitalId) === String(user.hospitalId));

    if (!isOwner) {
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
    const status = error.message.includes('token') ? 401 : 500;
    const message = status === 500 ? 'An unexpected error occurred' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
