'use client';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div
            aria-label="Agapay PhilHealth"
            className="bg-phBlue w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
          >
            AGAPAY
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              required
              disabled={isSubmitting}
              className="mt-1 block w-full outline-none border border-gray-300 rounded-md p-2 focus:ring-phBlue focus:border-phBlue disabled:bg-gray-100"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              disabled={isSubmitting}
              className="mt-1 block w-full outline-none border border-gray-300 rounded-md p-2 focus:ring-phBlue focus:border-phBlue disabled:bg-gray-100"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-phBlue text-white py-2 px-4 rounded-md hover:bg-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-phBlue hover:underline text-sm">Don&apos;t have an account? Register</Link>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Test Accounts:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>Patient: patient@test.com</li>
            <li>Hospital: hospital@test.com</li>
            <li>Auditor: auditor@test.com</li>
            <li>All Passwords: password123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
