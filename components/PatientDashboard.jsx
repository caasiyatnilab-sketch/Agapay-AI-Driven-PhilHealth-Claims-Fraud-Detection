'use client';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthProvider';
import QRCodeModal from './QRCodeModal';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { token } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ hospitalId: '', diagnosis: '', icd10Code: '', caseRateType: '', amountClaimed: 0, daysAdmitted: 1 });
  const [selectedQR, setSelectedQR] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchClaims();
    fetchHospitals();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get('/api/claims', { headers: { Authorization: `Bearer ${token}` } });
      setClaims(res.data.claims || []);
    } catch (err) {
      toast.error('Failed to load claims');
      setClaims([]);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await axios.get('/api/hospitals');
      setHospitals(res.data.hospitals || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateOCR = async () => {
    setIsExtracting(true);
    try {
      const res = await axios.post('/api/ml/extract', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.extracted_text || 'OCR Simulated');
    } catch (e) {
      toast.error('OCR Simulation failed, backend might be offline.');
    } finally {
      setIsExtracting(false);
    }
  }

  const submitClaim = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/api/claims', formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Claim submitted successfully!');
      setShowForm(false);
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Claims</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-phBlue text-white px-4 py-2 rounded-md hover:bg-blue-800 shadow">+ New Claim</button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-phYellow">
          <h2 className="text-xl font-bold mb-4">Submit New PhilHealth Claim</h2>
          <form onSubmit={submitClaim} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">Hospital</label>
              <select id="hospitalId" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <input id="diagnosis" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
            </div>
            <div>
              <label htmlFor="icd10Code" className="block text-sm font-medium text-gray-700">ICD-10 Code</label>
              <input id="icd10Code" type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.icd10Code} onChange={e => setFormData({...formData, icd10Code: e.target.value})} />
            </div>
            <div>
              <label htmlFor="caseRateType" className="block text-sm font-medium text-gray-700">Case Rate Type</label>
              <select id="caseRateType" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.caseRateType} onChange={e => setFormData({...formData, caseRateType: e.target.value})}>
                <option value="">Select</option>
                <option value="MEDICAL">Medical Case</option>
                <option value="SURGICAL">Surgical Case</option>
              </select>
            </div>
            <div>
              <label htmlFor="amountClaimed" className="block text-sm font-medium text-gray-700">Amount Claimed (PHP)</label>
              <input id="amountClaimed" type="number" required min="1" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.amountClaimed} onChange={e => setFormData({...formData, amountClaimed: e.target.value})} />
            </div>
            <div>
              <label htmlFor="daysAdmitted" className="block text-sm font-medium text-gray-700">Days Admitted</label>
              <input id="daysAdmitted" type="number" required min="1" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.daysAdmitted} onChange={e => setFormData({...formData, daysAdmitted: e.target.value})} />
            </div>
            
            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Documents (Simulated)</label>
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={handleSimulateOCR}
              >
                 <p className="text-sm text-gray-500">{isExtracting ? 'Extracting details with AI OCR...' : 'Click to run AI OCR Document Extraction'}</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-phBlue text-white rounded-md hover:bg-blue-800 disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-phBlue">{claim.claimRef}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{claim.hospital?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(claim.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₱{claim.amountClaimed.toLocaleString()}</td>
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
                  <button onClick={() => setSelectedQR(claim.id)} className="text-indigo-600 hover:text-indigo-900 mx-2">QR</button>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No claims found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedQR && <QRCodeModal claimId={selectedQR} onClose={() => setSelectedQR(null)} />}
    </div>
  );
}
