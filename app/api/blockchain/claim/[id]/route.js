import { NextResponse } from 'next/server';
const { ethers } = require('ethers');
const { getDb } = require('../../../../../lib/db');
const { verifyAuth } = require('../../../../../lib/auth');

export async function GET(req, { params }) {
  try {
    const user = verifyAuth(req);
    const { id } = params;

    const { Claim } = await getDb();
    const dbClaim = await Claim.findByPk(id);

    if (!dbClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Security: Ownership check (IDOR prevention)
    const canAccess = user.role === 'AUDITOR' ||
      (user.role === 'PATIENT' && dbClaim.patientId === user.id) ||
      (user.role === 'HOSPITAL' && dbClaim.hospitalId === user.hospitalId);

    if (!canAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
      console.warn('Chain read failed. Proceeding with DB data.', chainErr.message);
    }

    return NextResponse.json({ 
       claim: {
         source: onChainData ? 'BLOCKCHAIN' : 'DATABASE',
         onChainData: onChainData || 'Not available on-chain',
         databaseData: dbClaim
       }
    });
  } catch (error) {
    console.error('Blockchain Claim API Error:', error);
    const status = error.message.includes('token') ? 401 : 500;
    const message = status === 500 ? 'Internal Server Error' : error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
