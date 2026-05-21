import { LogOut, CalendarCheck, Users, CalendarPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  const userUid = localStorage.getItem('userUid');
  const [shift, setShift] = useState('day');
  const [freeSlots, setFreeSlots] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userUid) return;
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/doctor/profile/${userUid}`);
        if (response.ok) {
          const data = await response.json();
          setShift(data.shift || 'day');
          if (data.free_time) {
            setFreeSlots(data.free_time.split(', ').filter(Boolean));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [userUid]);

  const saveFreeSlots = async () => {
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_URL}/api/doctor/freetime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail: userEmail, freeSlots })
      });
      alert('Free slots saved successfully');
    } catch (error) {
      console.error('Error saving free slots:', error);
      alert('Failed to save free slots');
    } finally {
      setSaving(false);
    }
  };

  const toggleSlot = (slot) => {
    setFreeSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const getAvailableSlots = () => {
    return shift === 'day' 
      ? ['9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM']
      : ['9:00 PM - 10:00 PM', '10:00 PM - 11:00 PM', '11:00 PM - 12:00 AM', '12:00 AM - 1:00 AM', '1:00 AM - 2:00 AM', '2:00 AM - 3:00 AM', '3:00 AM - 4:00 AM', '4:00 AM - 5:00 AM', '5:00 AM - 6:00 AM'];
  };

  const modules = [
    { title: 'Doctor Profile', path: '/doctor/profile', icon: Users, color: '#8b5cf6', desc: 'Manage your personal details and schedule', highlight: true },
    { title: 'Accept Appointment', path: '/doctor/accept-appointment', icon: CalendarCheck, color: 'var(--primary)', desc: 'Review and approve incoming requests' },
    { title: 'Total Patients', path: '/doctor/patients', icon: Users, color: 'var(--secondary)', desc: 'Manage your patient roster' },
    { title: 'Schedule Appointment', path: '/doctor/schedule', icon: CalendarPlus, color: '#f59e0b', desc: 'Book follow-ups manually' }
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

      <div style={{ marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Manage Free Time (Break Slots)</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Select the times you will be unavailable for appointments. Patients will not be able to book these slots.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {getAvailableSlots().map(slot => (
            <button
              key={slot}
              onClick={() => toggleSlot(slot)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${freeSlots.includes(slot) ? 'var(--primary)' : '#e2e8f0'}`,
                background: freeSlots.includes(slot) ? 'rgba(14, 165, 233, 0.1)' : 'white',
                color: freeSlots.includes(slot) ? 'var(--primary)' : 'var(--text-dark)',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {slot}
            </button>
          ))}
        </div>
        <button 
          onClick={saveFreeSlots} 
          disabled={saving}
          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Free Time'}
        </button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
