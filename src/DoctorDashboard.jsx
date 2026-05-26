import { LogOut, CalendarCheck, Users, CalendarPlus, Pill } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './components/ModuleCard';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  const userEmail = localStorage.getItem('userEmail') || 'doctor@carepulse.com';
  const userName = localStorage.getItem('userName') || 'Doctor User';
  const userPhoto = localStorage.getItem('userPhoto');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    navigate('/');
  };



  const modules = [
    { title: 'Doctor Profile', path: '/doctor/profile', icon: Users, color: '#8b5cf6', desc: 'Manage your personal details and schedule', highlight: true },
    { title: 'Accept Appointment', path: '/doctor/accept-appointment', icon: CalendarCheck, color: 'var(--primary)', desc: 'Review and approve incoming requests' },
    { title: 'Total Patients', path: '/doctor/patients', icon: Users, color: 'var(--secondary)', desc: 'Manage your patient roster' },
    { title: 'Schedule Appointment', path: '/doctor/schedule', icon: CalendarPlus, color: '#f59e0b', desc: 'Book follow-ups manually' },
    { title: 'Manage Prescriptions', path: '/doctor/prescriptions', icon: Pill, color: '#ec4899', desc: 'Create and manage digital prescriptions' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out' }}>
      
      {/* Top Header Navigation Row removed as it is now in DashboardLayout */}

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Doctor Dashboard</h2>
        <p style={{ color: 'var(--text-light)' }}>Manage your schedule and patients.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {modules.map((mod, index) => (
          <ModuleCard key={index} mod={mod} />
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
