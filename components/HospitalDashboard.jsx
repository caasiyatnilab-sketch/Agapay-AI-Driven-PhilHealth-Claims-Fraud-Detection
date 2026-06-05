'use client';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthProvider';
import { format } from 'date-fns';

export default function HospitalDashboard() {
  const { token, user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get('/api/claims', { headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data.claims || []);
    } catch (err) {
      toast.error('Failed to load hospital claims');
    }
  };

  const handleAction = async (approved) => {
    if (!selectedClaim) return;
    try {
      await axios.put(`/api/claims/${selectedClaim.id}/approve-hospital`, { approved, remarks }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Claim ${approved ? 'approved' : 'rejected'} and recorded to blockchain.`);
      setSelectedClaim(null);
      setRemarks('');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hospital Claims Dashboard</h1>
      <p className="mb-4 text-gray-600">Logged in as representative of: <span className="font-semibold text-phBlue">{user.hospital?.name}</span></p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient (PIN)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claimRef}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{claim.patient.name} <br/><span className="text-xs text-gray-500">{claim.patient.philhealthId}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(claim.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₱{claim.amountClaimed.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${claim.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' : claim.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {claim.riskLevel || 'LOW'} · {((claim.riskScore || 0) * 100).toFixed(0)}%
                  </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${claim.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      claim.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                      claim.status === 'PAID' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {claim.status === 'PENDING' ? (
                     <button onClick={() => setSelectedClaim(claim)} className="text-phBlue hover:text-blue-900">Review</button>
                  ) : (
                     <span className="text-gray-400">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClaim && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl relative">
             <button onClick={() => setSelectedClaim(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">&times;</button>
             <h3 className="text-xl font-bold mb-4">Review Claim {selectedClaim.claimRef}</h3>
             <div className="space-y-3 mb-6 text-sm">
                <p><span className="font-semibold w-24 inline-block">Diagnosis:</span> {selectedClaim.diagnosis}</p>
                <p><span className="font-semibold w-24 inline-block">ICD-10:</span> {selectedClaim.icd10Code}</p>
                <p><span className="font-semibold w-24 inline-block">Amount:</span> ₱{selectedClaim.amountClaimed.toLocaleString()}</p>
                <p><span className="font-semibold w-24 inline-block">Days Admitted:</span> {selectedClaim.daysAdmitted}</p>
                <p><span className="font-semibold w-24 inline-block">Risk:</span> {selectedClaim.riskLevel || 'LOW'} ({((selectedClaim.riskScore || 0) * 100).toFixed(1)}%)</p>
             </div>
             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Notes</label>
                 <textarea className="w-full border border-gray-300 rounded p-2 text-sm" rows="3" value={remarks} onChange={e => setRemarks(e.target.value)}></textarea>
             </div>
             <div className="flex justify-end space-x-3">
                 <button onClick={() => handleAction(false)} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded">Reject</button>
                 <button onClick={() => handleAction(true)} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-semibold rounded">Approve</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
