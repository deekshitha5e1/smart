import React from 'react';
import { LogOut, CalendarCheck, Users, CalendarPlus } from 'lucide-react';
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
    { title: 'Accept Appointment', path: '/doctor/accept-appointment', icon: CalendarCheck, color: 'var(--primary)', desc: 'Review and approve incoming requests' },
    { title: 'Total Patients', path: '/doctor/patients', icon: Users, color: 'var(--secondary)', desc: 'Manage your patient roster' },
    { title: 'Schedule Appointment', path: '/doctor/schedule', icon: CalendarPlus, color: '#f59e0b', desc: 'Book follow-ups manually' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out' }}>
      
      {/* Top Header Navigation Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: '1.25rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '1.25rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.5rem 1rem', 
          background: 'white', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          {userPhoto ? (
            <img src={userPhoto} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'rgba(14, 165, 233, 0.1)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)' }}>{userName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{userEmail}</span>
          </div>
        </div>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s ease' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

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
