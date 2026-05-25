'use client';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import Link from 'next/link';

export default function PhilippineHeader({ user }) {
  const { logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
             <div className="bg-phBlue w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 border-2 border-phRed">AG</div>
             <span className="font-bold text-xl text-gray-800 tracking-tight">Agapay <span className="text-phRed">PhilHealth</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-phBlue font-medium px-2 py-0.5 rounded bg-blue-50 inline-block">{user.role}</div>
            </div>
            <Link href="/blockchain" className="text-sm text-gray-600 hover:text-phBlue">Explorer</Link>
            <button onClick={logout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded transition">Logout</button>
          </div>
        </div>
      </div>
      {/* Decorative flag line */}
      <div className="h-1 w-full flex">
         <div className="h-1 bg-phBlue w-1/3"></div>
         <div className="h-1 bg-white w-1/3"></div>
         <div className="h-1 bg-phRed w-1/3"></div>
      </div>
    </header>
  );
}
