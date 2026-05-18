import React from 'react';
import { LogOut, CalendarCheck, Users, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './components/ModuleCard';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  const modules = [
    { title: 'Accept Appointment', path: '/doctor/accept-appointment', icon: CalendarCheck, color: 'var(--primary)', desc: 'Review and approve incoming requests' },
    { title: 'Total Patients', path: '/doctor/patients', icon: Users, color: 'var(--secondary)', desc: 'Manage your patient roster' },
    { title: 'Schedule Appointment', path: '/doctor/schedule', icon: CalendarPlus, color: '#f59e0b', desc: 'Book follow-ups manually' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Doctor Dashboard</h2>
          <p style={{ color: 'var(--text-light)' }}>Manage your schedule and patients.</p>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}>
          <LogOut size={18} /> Logout
        </button>
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
