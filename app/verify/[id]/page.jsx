'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ClaimVerification({ params }) {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaim();
  }, [params.id]);

  const fetchClaim = async () => {
    try {
      // In a real app we might have a public endpoint, but let's just use the blockchain explorer API
      const res = await axios.get(`/api/blockchain/claim/${params.id}`);
      setClaim(res.data.claim);
    } catch (err) {
      setError('Claim not found or invalid QR code.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (error) return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
           <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
           <p className="text-gray-600">{error}</p>
        </div>
     </div>
  );

  const data = claim.databaseData;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-12 items-center">
       <div className="max-w-md w-full bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
           <div className="bg-phBlue p-6 text-center text-white relative">
              {claim.source === 'BLOCKCHAIN' && (
                 <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">SECURED ON-CHAIN</div>
              )}
              <h2 className="text-2xl font-bold tracking-wider mb-1">Agapay</h2>
              <p className="text-blue-200 text-sm">Official Claim Verification Document</p>
           </div>
           
           <div className="p-6">
              <div className="mb-4 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                   ${data.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                     data.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                     data.status === 'PAID' ? 'bg-blue-100 text-blue-800' : 
                     'bg-yellow-100 text-yellow-800'}`}>
                   Status: {data.status}
                </span>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Claim Reference</p>
                    <p className="text-lg font-mono font-bold text-gray-800">{data.claimRef}</p>
                 </div>
                 <div className="flex border-b pb-4">
                    <div className="w-1/2">
                       <p className="text-xs text-gray-500 uppercase font-semibold">Amount Claimed</p>
                       <p className="text-lg font-bold text-gray-800">₱{data.amountClaimed.toLocaleString()}</p>
                    </div>
                    <div className="w-1/2">
                       <p className="text-xs text-gray-500 uppercase font-semibold">Diagnosis</p>
                       <p className="text-md font-semibold text-gray-700">{data.diagnosis}</p>
                    </div>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded text-sm border">
                    <p className="mb-2"><span className="font-semibold text-gray-700">Date Logged:</span> {format(new Date(data.createdAt), 'MMMM d, yyyy')}</p>
                    {data.txHash && (
                       <div>
                          <p className="font-semibold text-gray-700">Blockchain TxHash:</p>
                          <p className="font-mono text-xs text-gray-500 break-all">{data.txHash}</p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="mt-8 text-center">
                 <Link href="/login" className="text-phBlue hover:underline text-sm font-semibold">Go to Portal</Link>
              </div>
           </div>
       </div>
       
       <div className="mt-6 text-sm text-gray-500 text-center px-4 max-w-md">
          This digital certificate serves as proof of claim recording on the distributed PhilHealth ledger.
       </div>
    </div>
  );
}
