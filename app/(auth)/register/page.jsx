'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PATIENT', philhealthId: '', hospitalId: '' });
  const [hospitals, setHospitals] = useState([]);
  const router = useRouter();

  useEffect(() => {
     axios.get('/api/hospitals')
       .then(res => setHospitals(res.data.hospitals))
       .catch(err => console.error('Failed to load hospitals:', err));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="PATIENT">Patient (PhilHealth Member)</option>
              <option value="HOSPITAL">Hospital Representative</option>
            </select>
          </div>

          {formData.role === 'PATIENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">PhilHealth ID (PIN)</label>
              <input type="text" placeholder="xx-xxxxxxx-x" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.philhealthId} onChange={e => setFormData({...formData, philhealthId: e.target.value})} />
            </div>
          )}

          {formData.role === 'HOSPITAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Associated Hospital</label>
              <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={formData.hospitalId} onChange={e => setFormData({...formData, hospitalId: e.target.value})}>
                <option value="">Select Hospital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          )}
          <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded p-3">Auditor accounts are provisioned by administrators to protect production audit workflows. Use the seeded auditor demo account for local testing.</p>
          <button type="submit" className="w-full bg-phBlue text-white py-2 px-4 rounded-md hover:bg-blue-800 transition">Register</button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-phBlue hover:underline text-sm">Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
}
