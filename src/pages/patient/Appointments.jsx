import { useState, useEffect, useCallback, useMemo } from 'react';
import PageLayout from '../../components/PageLayout';
import { auth } from '../../firebase';
import { Check, X, Calendar, Clock, User, Filter, ChevronDown, ChevronUp, RotateCcw, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all'); // 'all', 'previous', 'present', 'future'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(['pending', 'accepted', 'rejected']);

  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  const fetchAppointments = useCallback(async () => {
    if (!userUid) {
      setLoading(false);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/patient/${userUid}/appointments`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(app => ({
          id: app.id,
          doctorName: app.doctor_name,
          doctorEmail: app.doctor_email, // If backend returns it, else we fallback
          date: app.appointment_date,
          time: app.appointment_time,
          status: app.status
        }));
        // Sort by date descending
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Helper to get formatted local date (YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  // Dynamic Memoized Filtering Logic
  const filteredAppointments = useMemo(() => {
    const todayStr = getTodayStr();

    return appointments.filter(app => {
      // 1. Status Filter
      if (!selectedStatuses.includes(app.status)) {
        return false;
      }

      // 2. Time Period Filter
      if (timePeriod === 'previous') {
        if (app.date >= todayStr) return false;
      } else if (timePeriod === 'future') {
        if (app.date <= todayStr) return false;
      } else if (timePeriod === 'present') {
        // "Present" defaults to today's date if no specific selectedDate is provided, 
        // otherwise it filters to that specific selectedDate.
        const targetDate = selectedDate || todayStr;
        if (app.date !== targetDate) return false;
      }

      // 3. Custom Date Filter (if selectedDate is set and we're not in 'present' mode, 
      // or if we are in present mode and selectedDate is set, it's already handled)
      if (selectedDate && timePeriod !== 'present') {
        if (app.date !== selectedDate) return false;
      }

      return true;
    });
  }, [appointments, timePeriod, selectedDate, selectedStatuses]);

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleResetFilters = () => {
    setTimePeriod('all');
    setSelectedDate('');
    setSelectedStatuses(['pending', 'accepted', 'rejected']);
  };

  const isFiltersModified = timePeriod !== 'all' || selectedDate !== '' || selectedStatuses.length !== 3;

  return (
    <PageLayout title="My Appointments" backPath="/patient">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-dark)', marginBottom: '0.5rem', marginTop: 0 }}>Appointment Status & History</h2>
            <p style={{ color: 'var(--text-light)', margin: 0 }}>View your requested, accepted, or completed appointment consultations.</p>
          </div>
          <button 
            onClick={() => navigate('/patient')}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(14, 165, 233, 0.15)'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            Request New Visit
          </button>
        </div>

        {/* Dynamic Expandable Filter Panel */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header Panel */}
          <div style={{ 
            padding: '1rem 1.5rem', 
            background: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer'
          }} onClick={() => setShowFilters(!showFilters)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>
                <Filter size={16} />
              </div>
              <span style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.95rem' }}>Filter Appointments</span>
              {isFiltersModified && (
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Active
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={e => e.stopPropagation()}>
              {isFiltersModified && (
                <button 
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-light)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem'
                }}
              >
                {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Filter Body with Slide Animation styling */}
          <div style={{
            maxHeight: showFilters ? '500px' : '0px',
            opacity: showFilters ? 1 : 0,
            transition: 'all 0.3s ease-in-out',
            padding: showFilters ? '1.5rem' : '0 1.5rem',
            borderTop: showFilters ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
              
              {/* Time Period Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Time Period
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: 'all', label: 'All Appointments' },
                    { id: 'previous', label: 'Previous (Past)' },
                    { id: 'present', label: 'Present (Today / Spec. Date)' },
                    { id: 'future', label: 'Future (Upcoming)' }
                  ].map(period => {
                    const isSelected = timePeriod === period.id;
                    return (
                      <button
                        key={period.id}
                        onClick={() => setTimePeriod(period.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid #e2e8f0',
                          background: isSelected ? 'rgba(14, 165, 233, 0.06)' : 'white',
                          color: isSelected ? 'var(--primary)' : 'var(--text-dark)',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filter by Specific Date
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        color: 'var(--text-dark)',
                        outline: 'none',
                        background: selectedDate ? 'rgba(14, 165, 233, 0.02)' : 'white',
                        borderColor: selectedDate ? 'var(--primary)' : '#e2e8f0'
                      }}
                    />
                  </div>
                  {timePeriod === 'present' && !selectedDate && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '500', background: 'rgba(14, 165, 233, 0.08)', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
                      💡 Present mode is currently defaulting to Today: <strong>{getTodayStr()}</strong>. You can change this using the date picker above.
                    </span>
                  )}
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate('')}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#f1f5f9',
                        border: 'none',
                        color: 'var(--text-dark)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Clear Date Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Appointment Status
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: 'pending', label: 'Pending Request', color: '#b45309', bg: '#fef3c7' },
                    { id: 'accepted', label: 'Accepted', color: '#047857', bg: '#d1fae5' },
                    { id: 'rejected', label: 'Declined / Rejected', color: '#b91c1c', bg: '#fee2e2' }
                  ].map(status => {
                    const isChecked = selectedStatuses.includes(status.id);
                    return (
                      <div 
                        key={status.id} 
                        onClick={() => handleStatusToggle(status.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          border: isChecked ? `1px solid ${status.color}` : '1px solid #e2e8f0',
                          background: isChecked ? status.bg : 'white',
                          color: isChecked ? status.color : 'var(--text-dark)',
                          fontWeight: isChecked ? '600' : '400',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '4px', 
                          border: `1.5px solid ${isChecked ? status.color : '#cbd5e1'}`, 
                          background: isChecked ? status.color : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '10px'
                        }}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        {status.label}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Main List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-light)', fontWeight: '500' }}>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {appointments.length === 0 ? 'No Appointments Found' : 'No Matching Appointments'}
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              {appointments.length === 0 
                ? "You haven't requested any medical appointments yet. Search for a specialist to get started." 
                : "No appointments match your current filter settings. Try resetting or adjusting the filters."
              }
            </p>
            {appointments.length === 0 ? (
              <button 
                onClick={() => navigate('/patient')}
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.65rem 1.25rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(14, 165, 233, 0.15)'
                }}
              >
                Find a Specialist
              </button>
            ) : isFiltersModified ? (
              <button 
                onClick={handleResetFilters}
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.65rem 1.25rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: '500' }}>
                Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments
              </span>
            </div>
            
            {filteredAppointments.map(app => (
              <div key={app.id} style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '1.5rem', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Dr. {app.doctorName}</h4>
                      <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.875rem' }}>Primary Care Consultant</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: '500' }}>
                      <Calendar size={18} color="var(--primary)" /> {app.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: '500' }}>
                      <Clock size={18} color="#f59e0b" /> {app.time}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)' }}>Status:</span>
                    {app.status === 'pending' && <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Pending Approval</span>}
                    {app.status === 'accepted' && <span style={{ background: '#d1fae5', color: '#047857', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Accepted & Confirmed</span>}
                    {app.status === 'rejected' && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Declined</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default PatientAppointments;
