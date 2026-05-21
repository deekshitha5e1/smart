import { useState } from 'react';
import { LogOut, CalendarPlus, FileText, Pill, Activity, Search, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './components/ModuleCard';
import { auth } from './firebase';

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  const userEmail = localStorage.getItem('userEmail') || 'patient@carepulse.com';
  const userName = localStorage.getItem('userName') || 'Patient User';
  const userPhoto = localStorage.getItem('userPhoto');
  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    localStorage.removeItem('userUid');
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setDoctors([]);
      return;
    }
    
    setSearching(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/doctors/search?specialisation=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(doc => ({
          uid: doc.uid,
          fullName: doc.full_name,
          specialisation: doc.specialisation,
          shift: doc.shift,
          freeTime: doc.free_time,
          patientsConsulted: doc.patients_consulted,
          status: doc.status
        }));
        setDoctors(mapped);
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      console.error("Error searching doctors:", error);
      alert("Failed to search doctors.");
    } finally {
      setSearching(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate || !appointmentTime) return;
    
    setBooking(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/patient/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: userUid,
          doctor_id: selectedDoctor.uid,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime
        })
      });

      if (!response.ok) throw new Error("Failed to book appointment");

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor(null);
        setAppointmentDate('');
        setAppointmentTime('');
      }, 3000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to send appointment request.");
    } finally {
      setBooking(false);
    }
  };

  const modules = [
    { title: 'Appointments', path: '/patient/appointments', icon: CalendarPlus, color: 'var(--primary)', desc: 'Book or manage your upcoming visits' },
    { title: 'Medical Records', path: '/patient/records', icon: FileText, color: 'var(--secondary)', desc: 'View your test results and history' },
    { title: 'Prescriptions', path: '/patient/prescriptions', icon: Pill, color: '#f59e0b', desc: 'Request refills and view active meds' },
    { title: 'AI Symptom Checker', path: '/patient/ai-checker', icon: Activity, color: '#8b5cf6', desc: 'Check your symptoms instantly' }
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

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>Patient Dashboard</h2>
        <p style={{ color: 'var(--text-light)' }}>Welcome back! Search for a specialist or select a module.</p>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '3rem', background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
            <Search size={20} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search specialists (e.g., ENT, Cardiologist)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '1rem', width: '100%', outline: 'none', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" disabled={searching} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: searching ? 0.7 : 1 }}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {doctors.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Available Specialists</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {doctors.map(doctor => (
                <div key={doctor.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {doctor.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{doctor.fullName}</h4>
                      <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '500' }}>{doctor.specialisation}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span><strong>Shift:</strong> {doctor.shift === 'night' ? 'Night Shift' : 'Day Shift'}</span>
                    <span><strong>Free Time:</strong> {doctor.freeTime || 'Not specified'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedDoctor(doctor)}
                    style={{ marginTop: '0.5rem', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                  >
                    Request Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out' }}>
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Request Sent!</h3>
                <p style={{ color: 'var(--text-light)' }}>Your appointment request has been sent to {selectedDoctor.fullName}.</p>
              </div>
            ) : (
              <>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarPlus size={20} color="var(--primary)" /> Book Appointment
                </h3>
                <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  Request an appointment with <strong>{selectedDoctor.fullName}</strong> ({selectedDoctor.specialisation}).
                </p>
                <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Date</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 0.75rem' }}>
                      <CalendarIcon size={16} color="var(--text-light)" />
                      <input 
                        type="date" 
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Time</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 0.75rem' }}>
                      <Clock size={16} color="var(--text-light)" />
                      <input 
                        type="time" 
                        required
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setSelectedDoctor(null)} style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={booking} style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', opacity: booking ? 0.7 : 1 }}>
                      {booking ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Original Modules */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Dashboard Modules</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {modules.map((mod, index) => (
          <ModuleCard key={index} mod={mod} />
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
