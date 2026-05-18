import React from 'react';
import { LogOut, CalendarPlus, FileText, Pill, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './components/ModuleCard';

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  const modules = [
    { title: 'Appointments', path: '/patient/appointments', icon: CalendarPlus, color: 'var(--primary)', desc: 'Book or manage your upcoming visits' },
    { title: 'Medical Records', path: '/patient/records', icon: FileText, color: 'var(--secondary)', desc: 'View your test results and history' },
    { title: 'Prescriptions', path: '/patient/prescriptions', icon: Pill, color: '#f59e0b', desc: 'Request refills and view active meds' },
    { title: 'AI Symptom Checker', path: '/patient/ai-checker', icon: Activity, color: '#8b5cf6', desc: 'Check your symptoms instantly' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Patient Dashboard</h2>
          <p style={{ color: 'var(--text-light)' }}>Welcome back! Select a module to proceed.</p>
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

export default PatientDashboard;
