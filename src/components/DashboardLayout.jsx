import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarPlus, 
  FileText, 
  Pill, 
  Activity,
  User
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Topbar = ({ role }) => {
  const userName = localStorage.getItem('userName') || (role === 'doctor' ? 'Doctor' : 'Patient');
  const userPhoto = localStorage.getItem('userPhoto');
  const topbarTitle = role === 'doctor' ? 'Welcome Dear Doctor' : 'Welcome Dear Patient';

  return (
    <div style={{
      height: '60px',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderBottom: '1px solid #333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>{topbarTitle}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {userPhoto ? (
            <img src={userPhoto} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          ) : (
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#333', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
          )}
          <span style={{ fontSize: '14px' }}>{userName}</span>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userPhoto');
            localStorage.removeItem('userUid');
            window.location.href = '/';
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const doctorModules = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/doctor' },
    { name: 'Doctor Profile', icon: <Users size={20} />, path: '/doctor/profile' },
    { name: 'Accept Appointment', icon: <CalendarCheck size={20} />, path: '/doctor/accept-appointment' },
    { name: 'Total Patients', icon: <Users size={20} />, path: '/doctor/patients' },
    { name: 'Schedule Appointment', icon: <CalendarPlus size={20} />, path: '/doctor/schedule' },
    { name: 'Manage Prescriptions', icon: <Pill size={20} />, path: '/doctor/prescriptions' }
  ];

  const patientModules = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/patient' },
    { name: 'Appointments', icon: <CalendarPlus size={20} />, path: '/patient/appointments' },
    { name: 'Medical Records', icon: <FileText size={20} />, path: '/patient/records' },
    { name: 'Prescriptions', icon: <Pill size={20} />, path: '/patient/prescriptions' },
    { name: 'AI Symptom Checker', icon: <Activity size={20} />, path: '/patient/ai-checker' }
  ];

  const menuItems = role === 'doctor' ? doctorModules : patientModules;

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      height: '100vh',
      position: 'fixed',
      top: '60px',
      left: 0,
      overflowY: 'auto',
      paddingTop: '20px',
      borderRight: '1px solid #333'
    }}>
      {menuItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <div 
            key={index}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              cursor: 'pointer',
              backgroundColor: isActive ? '#1e5f8f' : 'transparent',
              borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
              transition: 'all 0.2s ease',
              marginBottom: '4px'
            }}
          >
            <div style={{ marginRight: '16px', opacity: isActive ? 1 : 0.7 }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '400', flex: 1, opacity: isActive ? 1 : 0.8 }}>
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DashboardLayout = ({ role = 'patient', children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      <Topbar role={role} />
      <Sidebar role={role} />
      <div style={{ 
        marginLeft: '240px', 
        marginTop: '60px', 
        padding: '20px', 
        width: 'calc(100% - 240px)',
        minHeight: 'calc(100vh - 60px)'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
