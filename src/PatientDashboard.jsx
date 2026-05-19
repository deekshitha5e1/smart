import React from 'react';
import { LogOut, CalendarPlus, FileText, Pill, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './components/ModuleCard';

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  const userEmail = localStorage.getItem('userEmail') || 'patient@carepulse.com';
  const userName = localStorage.getItem('userName') || 'Patient User';
  const userPhoto = localStorage.getItem('userPhoto');

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    navigate('/');
  };

  const modules = [
    { title: 'Appointments', path: '/patient/appointments', icon: CalendarPlus, color: 'var(--primary)', desc: 'Book or manage your upcoming visits' },
    { title: 'Medical Records', path: '/patient/records', icon: FileText, color: 'var(--secondary)', desc: 'View your test results and history' },
    { title: 'Prescriptions', path: '/patient/prescriptions', icon: Pill, color: '#f59e0b', desc: 'Request refills and view active meds' },
    { title: 'AI Symptom Checker', path: '/patient/ai-checker', icon: Activity, color: '#8b5cf6', desc: 'Check your symptoms instantly' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out', position: 'relative' }}>
      
      {/* Absolutely positioned profile and logout in top right corner */}
      <div style={{ 
        position: 'absolute', 
        top: '2rem', 
        right: '2rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem', 
        flexWrap: 'wrap',
        zIndex: 100
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
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--secondary)', 
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '60%' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Patient Dashboard</h2>
          <p style={{ color: 'var(--text-light)' }}>Welcome back! Select a module to proceed.</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {modules.map((mod, index) => (
          <ModuleCard key={index} mod={mod} />
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
