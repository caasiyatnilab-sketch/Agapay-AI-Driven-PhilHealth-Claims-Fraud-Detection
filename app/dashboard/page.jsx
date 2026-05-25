'use client';
import { useContext } from 'react';
import { AuthContext } from '../../components/AuthProvider';
import PatientDashboard from '../../components/PatientDashboard';
import HospitalDashboard from '../../components/HospitalDashboard';
import AuditorDashboard from '../../components/AuditorDashboard';
import PhilippineHeader from '../../components/PhilippineHeader';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PhilippineHeader user={user} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {user.role === 'PATIENT' && <PatientDashboard />}
        {user.role === 'HOSPITAL' && <HospitalDashboard />}
        {user.role === 'AUDITOR' && <AuditorDashboard />}
      </main>
    </div>
  );
}
