'use client';
import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthProvider';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function AuditorDashboard() {
  const { token } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [notes, setNotes] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Memoize fetch function to prevent unnecessary recreations
  // Performance: Avoids redundant function allocations and dependency triggers
  const fetchClaims = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Parallel data fetching reduces total network wait time
      const [claimsRes, analyticsRes] = await Promise.all([
        axios.get('/api/claims/all', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/analytics/fraud', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setClaims(claimsRes.data.claims || []);
      setAnalytics(analyticsRes.data.summary || null);
    } catch (err) {
      toast.error('Failed to load auditor dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleAudit = async (status) => {
    if (!selectedClaim) return;
    try {
      await axios.put(`/api/claims/${selectedClaim.id}/audit`, { status, notes }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Claim marked as ${status}.`);
      setSelectedClaim(null);
      setNotes('');
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Audit failed');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await axios.get('/api/reports', { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'claims_report.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  // Memoize statistics to prevent O(N) recalculations on every render
  const stats = useMemo(() => {
    let high = 0, med = 0, low = 0, total = 0;
    for (const c of claims) {
      total += c.amountClaimed;
      if (c.riskScore > 0.7) high++;
      else if (c.riskScore > 0.3) med++;
      else low++;
    }
    return { high, med, low, total };
  }, [claims]);

  const pieData = useMemo(() => [
    { name: 'High Risk', value: stats.high, color: '#ef4444' },
    { name: 'Medium Risk', value: stats.med, color: '#eab308' },
    { name: 'Low Risk', value: stats.low, color: '#22c55e' }
  ], [stats]);

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phBlue"></div>
      </div>
    );
  }

  return (
    <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">PhilHealth Auditor Dashboard</h1>
        <button onClick={exportCSV} className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-black text-sm">Download CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
             <h4 className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Claims</h4>
             <p className="text-3xl font-bold text-gray-800 mt-2">{claims.length}</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center">
             <h4 className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Amount</h4>
             <p className="text-3xl font-bold text-phBlue mt-2">₱{stats.total.toLocaleString()}</p>
         </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-1 md:col-span-2 flex items-center">
             <div className="w-1/2">
                <h4 className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">AI Fraud Detection</h4>
                <div className="flex items-center mt-1"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span><span className="text-sm font-medium">{stats.high} High Risk</span></div>
                <div className="flex items-center mt-1"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span><span className="text-sm font-medium">{stats.med} Medium Risk</span></div>
                <div className="flex items-center mt-1"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span><span className="text-sm font-medium">{stats.low} Low Risk</span></div>
             </div>
             <div className="w-1/2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} innerRadius={30} outerRadius={50} dataKey="value" stroke="none">
                       {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Pie>
                     <RechartsTooltip />
                   </PieChart>
                </ResponsiveContainer>
             </div>
         </div>
      </div>

      {analytics?.topRiskHospitals?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Top Risk Hospitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.topRiskHospitals.slice(0, 3).map((hospital) => (
              <div key={hospital.hospital} className="border rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-gray-800">{hospital.hospital}</p>
                <p className="text-sm text-gray-600">{hospital.claims} claims · {hospital.highRisk} high risk</p>
                <p className="text-sm font-bold text-phBlue">₱{hospital.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Audit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Note: Claims from /api/claims/all are already server-side sorted by riskScore DESC */}
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-bold text-gray-900">{claim.claimRef}</div>
                   <div className="text-xs text-gray-500">{format(new Date(claim.createdAt), 'MM/dd/yyyy')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-bold ${claim.riskScore > 0.7 ? 'text-red-600' : claim.riskScore > 0.3 ? 'text-yellow-600' : 'text-green-600'}`}>
                       {(claim.riskScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{claim.hospital?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₱{claim.amountClaimed.toLocaleString()}</td>
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
                  <button onClick={() => setSelectedClaim(claim)} className="text-phBlue hover:text-blue-900 font-bold border border-phBlue px-2 py-1 rounded">Action</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClaim && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-2xl relative">
             <button onClick={() => setSelectedClaim(null)} className="absolute top-4 right-4 text-gray-500 hover:text-black">&times;</button>
             <h3 className="text-xl font-bold mb-4">Audit Claim {selectedClaim.claimRef}</h3>
             
             <div className="bg-gray-50 p-4 rounded mb-4 border text-sm">
                 <p><strong>Patient PIN:</strong> {selectedClaim.patient.philhealthId}</p>
                 <p><strong>Diagnosis:</strong> {selectedClaim.diagnosis} ({selectedClaim.icd10Code})</p>
                 <p><strong>Days Admitted:</strong> {selectedClaim.daysAdmitted}</p>
                 <p><strong>AI Risk Score:</strong> <span className={selectedClaim.riskScore > 0.7 ? 'text-red-600 font-bold' : ''}>{(selectedClaim.riskScore * 100).toFixed(1)}%</span></p>
                 <p className="mt-2 text-xs text-gray-500 break-all"><strong>TxHash:</strong> {selectedClaim.txHash || 'Pending...'}</p>
             </div>

             <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Audit Notes</label>
                 <textarea className="w-full border border-gray-300 rounded p-2 text-sm" rows="3" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
             </div>
             <div className="flex justify-between items-center mt-6">
                 <div>
                    <button onClick={() => handleAudit('REJECTED')} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded text-sm mr-2">Reject Fraud</button>
                 </div>
                 <div className="space-x-2">
                    <button onClick={() => handleAudit('APPROVED')} className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded text-sm">Approve</button>
                    {selectedClaim.status === 'APPROVED' && (
                       <button onClick={() => handleAudit('PAID')} className="px-3 py-1.5 bg-phBlue text-white hover:bg-blue-800 font-semibold rounded text-sm shadow">Mark Paid (On-Chain)</button>
                    )}
                 </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
