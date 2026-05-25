'use client';
import { useState } from 'react';
import axios from 'axios';
import PhilippineHeader from '../../components/PhilippineHeader';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BlockchainExplorer() {
  const [claimId, setClaimId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.get(`/api/blockchain/claim/${claimId}`);
      setResult(res.data.claim);
    } catch (err) {
      setError(err.response?.data?.error || 'Claim not found or Blockchain offline');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center">
             <div className="bg-gray-800 w-8 h-8 rounded shrink-0 flex items-center justify-center text-white font-bold text-xs mr-3">BX</div>
             <span className="font-bold text-xl text-gray-800">Agapay<span className="text-phBlue">Chain</span> Explorer</span>
           </div>
           <Link href="/dashboard" className="text-sm text-gray-600 hover:text-phBlue">Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
         <div className="bg-white p-8 rounded-lg shadow border-t-4 border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-center">Verify Claim on Blockchain</h2>
            <form onSubmit={search} className="flex space-x-4 mb-8">
               <input type="text" placeholder="Enter Claim DB ID (e.g. 1)" required className="flex-1 border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-phBlue" value={claimId} onChange={e => setClaimId(e.target.value)} />
               <button type="submit" disabled={loading} className="bg-phBlue text-white px-6 py-3 rounded hover:bg-blue-800 font-semibold shadow transition disabled:opacity-50">
                 {loading ? 'Searching...' : 'Search Ledger'}
               </button>
            </form>

            {error && <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

            {result && (
               <div className="bg-gray-50 p-6 rounded border font-mono text-sm shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 font-sans font-bold shadow-sm">VERIFIED ON-CHAIN</div>
                  <pre className="whitespace-pre-wrap break-all text-gray-800 mt-2">
{JSON.stringify(result, null, 2)}
                  </pre>
               </div>
            )}
            
            <div className="mt-8 text-center text-sm text-gray-500">
               <p>AgapayChain uses an immutable distributed ledger to prevent tampering and double-spending of PhilHealth claims.</p>
            </div>
         </div>
      </main>
    </div>
  );
}
