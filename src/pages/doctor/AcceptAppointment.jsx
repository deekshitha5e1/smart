import { useState, useEffect, useCallback, useMemo } from 'react';
import PageLayout from '../../components/PageLayout';
import { auth } from '../../firebase';
import { Check, X, Calendar, Clock, User, Filter, ChevronDown, ChevronUp, RotateCcw, Activity, Download } from 'lucide-react';

const AcceptAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [timePeriod, setTimePeriod] = useState('all'); // 'all', 'previous', 'present', 'future'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(['pending', 'accepted', 'rejected']);

  // Hover states for individual components
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredReset, setHoveredReset] = useState(false);
  const [hoveredFilterHeader, setHoveredFilterHeader] = useState(false);
  const [hoveredDeclineBtn, setHoveredDeclineBtn] = useState(null);
  const [hoveredAcceptBtn, setHoveredAcceptBtn] = useState(null);

  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  const fetchAppointments = useCallback(async () => {
    if (!userUid) {
      setLoading(false);
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/doctor/${userUid}/appointments`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(app => ({
          id: app.id,
          patientName: app.patient_name,
          patientEmail: app.patient_email,
          doctorName: app.doctor_name,
          doctorSpecialisation: app.doctor_specialisation || 'Authorized Specialist',
          date: app.appointment_date,
          time: app.appointment_time,
          status: app.status
        }));
        // Sort by date descending
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [userUid]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/appointment/${id}/status?status=${newStatus}`, {
        method: 'PUT'
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Optimistically update the UI
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update status.");
    }
  };

  const handleDownloadAppointment = (app) => {
    const statusText = app.status === 'pending' ? 'Pending Approval' : app.status === 'accepted' ? 'Accepted & Confirmed' : 'Declined / Cancelled';
    const statusColor = app.status === 'pending' ? '#d97706' : app.status === 'accepted' ? '#059669' : '#dc2626';
    const statusBg = app.status === 'pending' ? 'rgba(254, 243, 199, 0.7)' : app.status === 'accepted' ? 'rgba(209, 250, 229, 0.7)' : 'rgba(254, 226, 226, 0.7)';
    const statusBorder = app.status === 'pending' ? '#fef3c7' : app.status === 'accepted' ? '#d1fae5' : '#fee2e2';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CarePulse Appointment - Dr. ${app.doctorName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0ea5e9;
      --primary-dark: #0284c7;
      --secondary: #10b981;
      --text-dark: #0f172a;
      --text-light: #64748b;
      --bg: #f8fafc;
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--text-dark);
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    
    /* Top Action Bar */
    .action-bar {
      width: 100%;
      max-width: 600px;
      margin-top: 2rem;
      padding: 0 1rem;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
    }
    .btn-print {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
      transition: all 0.2s;
    }
    .btn-print:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
    }

    /* Main Slip Card */
    .slip-container {
      background: white;
      width: calc(100% - 2rem);
      max-width: 600px;
      margin: 1.5rem 1rem 3rem;
      border-radius: 24px;
      padding: 2.5rem;
      box-sizing: border-box;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
      position: relative;
      overflow: hidden;
    }
    .slip-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
    }

    /* Header styling */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .hospital-title {
      margin: 0;
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      color: var(--primary-dark);
      letter-spacing: -0.01em;
    }
    .slip-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-light);
      background: #f1f5f9;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
    }

    /* Info sections */
    .section-title {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-light);
      letter-spacing: 0.06em;
      margin-bottom: 0.75rem;
      display: block;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .meta-item label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-light);
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.25rem;
      letter-spacing: 0.04em;
    }
    .meta-item strong {
      font-size: 1.05rem;
      color: var(--text-dark);
      display: block;
      font-family: 'Outfit', sans-serif;
    }
    .meta-item span {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    /* Details styling */
    .details-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding: 1rem 0;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 600;
      color: var(--text-light);
      font-size: 0.95rem;
    }
    .details-val {
      font-weight: 700;
      color: var(--text-dark);
      font-size: 0.95rem;
      text-align: right;
    }

    /* Status badge style */
    .status-badge {
      background: ${statusBg};
      color: ${statusColor};
      border: 1px solid ${statusBorder};
      padding: 0.35rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: inline-block;
    }

    /* Footer verification */
    .footer {
      margin-top: 2.5rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-ledger {
      font-size: 0.75rem;
      color: var(--text-light);
      line-height: 1.5;
    }
    .signature-block {
      text-align: right;
      width: 180px;
    }
    .signature-line {
      border-bottom: 1px solid #cbd5e1;
      height: 30px;
      margin-bottom: 0.4rem;
    }

    /* Print styling */
    @media print {
      body {
        background-color: white;
      }
      .action-bar {
        display: none !important;
      }
      .slip-container {
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  
  <div class="action-bar">
    <button class="btn-print" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print / Save to PDF
    </button>
  </div>

  <div class="slip-container">
    <div class="header">
      <h3 class="hospital-title">CarePulse Hospital</h3>
      <span class="slip-tag">Appointment Confirmation</span>
    </div>

    <div class="meta-box">
      <div class="meta-item">
        <label>Consulting Physician</label>
        <strong>Dr. ${app.doctorName}</strong>
        <span>${app.doctorSpecialisation}</span>
      </div>
      <div class="meta-item">
        <label>Registered Patient</label>
        <strong>${app.patientName}</strong>
        <span>CarePulse Verified Account</span>
      </div>
    </div>

    <div>
      <span class="section-title">Schedule Information</span>
      <div class="details-row">
        <span class="details-label">Date of Consultation</span>
        <span class="details-val">${app.date}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Allocated Time Slot</span>
        <span class="details-val">${app.time}</span>
      </div>
      <div class="details-row" style="align-items: center;">
        <span class="details-label">Appointment Status</span>
        <span class="details-val">
          <span class="status-badge">${statusText}</span>
        </span>
      </div>
    </div>

    <div class="footer">
      <div class="footer-ledger">
        <p style="margin: 0;">CarePulse Clinical Operations Registry</p>
        <p style="margin: 0.2rem 0 0; font-family: monospace; opacity: 0.8;">REG-ID: APPT-00${app.id}</p>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-dark);">Authorized Registrar</span>
      </div>
    </div>
  </div>

</body>
</html>
    `;

    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `CarePulse_Appointment_Details_${app.id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
        const targetDate = selectedDate || todayStr;
        if (app.date !== targetDate) return false;
      }

      // 3. Custom Date Filter
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
    <PageLayout title="Appointment Requests" backPath="/doctor">
      <div style={{ maxWidth: '950px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', marginTop: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              Patient Consultations
            </h2>
            <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '1rem', fontWeight: '400' }}>
              Verify details, review schedules, and manage incoming appointment requests.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', padding: '0.5rem 1.25rem', borderRadius: '12px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
            <Activity size={18} className="pulse" /> Live Dispatch
          </div>
        </div>

        {/* Premium Glassmorphic Filter Panel */}
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px', 
          border: '1px solid var(--glass-border)', 
          boxShadow: hoveredFilterHeader ? '0 10px 25px -5px rgba(15, 23, 42, 0.08)' : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '2rem',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header Panel */}
          <div 
            style={{ 
              padding: '1.25rem 1.75rem', 
              background: 'rgba(248, 250, 252, 0.6)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }} 
            onClick={() => setShowFilters(!showFilters)}
            onMouseEnter={() => setHoveredFilterHeader(true)}
            onMouseLeave={() => setHoveredFilterHeader(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                color: 'white',
                boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)'
              }}>
                <Filter size={16} />
              </div>
              <div>
                <span style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem', display: 'block' }}>Filter Console</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '0.1rem' }}>
                  {isFiltersModified ? 'Custom filters active' : 'Showing all requests'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} onClick={e => e.stopPropagation()}>
              {/* Quick status mini pills */}
              {!showFilters && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }} className="hide-on-mobile">
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--text-dark)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize' }}>
                    Period: {timePeriod}
                  </span>
                  {selectedDate && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: '600' }}>
                      Date: {selectedDate}
                    </span>
                  )}
                  {selectedStatuses.length < 3 && (
                    <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: '600' }}>
                      Status: {selectedStatuses.join(', ')}
                    </span>
                  )}
                </div>
              )}

              {isFiltersModified && (
                <button 
                  onClick={handleResetFilters}
                  onMouseEnter={() => setHoveredReset(true)}
                  onMouseLeave={() => setHoveredReset(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: hoveredReset ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    border: 'none',
                    color: hoveredReset ? '#ef4444' : 'var(--text-light)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  <RotateCcw size={13} style={{ transform: hoveredReset ? 'rotate(-180deg)' : 'none', transition: 'transform 0.4s' }} /> Reset
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: 'none',
                  color: 'var(--text-dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem',
                  borderRadius: '50%',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.05)'}
              >
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Filter Console Panel Body */}
          <div style={{
            maxHeight: showFilters ? '600px' : '0px',
            opacity: showFilters ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: showFilters ? '1.75rem' : '0 1.75rem',
            borderTop: showFilters ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
            background: 'rgba(255, 255, 255, 0.4)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              
              {/* 1. Time Period Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Time Interval
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { id: 'all', label: 'All Requests' },
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
                          padding: '0.65rem 1rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                          background: isSelected ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.02))' : 'white',
                          color: isSelected ? 'var(--primary-dark)' : 'var(--text-dark)',
                          fontWeight: isSelected ? '600' : '500',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(14, 165, 233, 0.05)' : 'none',
                          transform: isSelected ? 'translateX(2px)' : 'none',
                          outline: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{period.label}</span>
                          {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Custom Date Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Calendar Date Target
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1.5px solid',
                        borderColor: selectedDate ? 'var(--primary)' : '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        color: 'var(--text-dark)',
                        outline: 'none',
                        background: 'white',
                        transition: 'all 0.2s',
                        boxShadow: selectedDate ? '0 4px 12px rgba(14, 165, 233, 0.05)' : 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  {timePeriod === 'present' && !selectedDate && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--primary-dark)', 
                      background: 'rgba(14, 165, 233, 0.06)', 
                      padding: '0.5rem 0.85rem', 
                      borderRadius: '10px', 
                      lineHeight: '1.4',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      💡 Present mode default today: <strong>{getTodayStr()}</strong>. Select another date above to shift focus.
                    </div>
                  )}
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate('')}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#f1f5f9',
                        border: 'none',
                        color: 'var(--text-dark)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      <X size={12} /> Clear Date Target
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Status Filters */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Request Status
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[
                    { id: 'pending', label: 'Pending Request', color: '#d97706', activeBg: 'rgba(254, 243, 199, 0.8)', border: '#fef3c7' },
                    { id: 'accepted', label: 'Accepted Request', color: '#059669', activeBg: 'rgba(209, 250, 229, 0.8)', border: '#d1fae5' },
                    { id: 'rejected', label: 'Declined Request', color: '#dc2626', activeBg: 'rgba(254, 226, 226, 0.8)', border: '#fee2e2' }
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
                          padding: '0.65rem 1rem',
                          borderRadius: '12px',
                          border: '1.5px solid',
                          borderColor: isChecked ? status.color : '#e2e8f0',
                          background: isChecked ? status.activeBg : 'white',
                          color: isChecked ? status.color : 'var(--text-dark)',
                          fontWeight: isChecked ? '600' : '500',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isChecked ? `0 4px 12px ${status.border}` : 'none'
                        }}
                      >
                        <div style={{ 
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '6px', 
                          border: `2px solid ${isChecked ? status.color : '#cbd5e1'}`, 
                          background: isChecked ? status.color : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          transition: 'all 0.2s'
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

        {/* Info row */}
        {!loading && filteredAppointments.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: '500' }}>
              Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> patient consultations
            </span>
          </div>
        )}

        {/* Main List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(14, 165, 233, 0.1)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-light)', fontWeight: '600', fontSize: '0.95rem' }}>Retrieving appointments from Supabase...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '5rem 2rem', 
            borderRadius: '24px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)', 
            border: '1px solid rgba(226, 232, 240, 0.8)' 
          }}>
            <Calendar size={56} color="#cbd5e1" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              {appointments.length === 0 ? 'No Appointment Requests' : 'No Matching Consultations'}
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '440px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {appointments.length === 0 
                ? "Excellent job! You are currently all caught up. No incoming patient consultation requests were found." 
                : "No patient visits match your active filters. Try loosening or clearing your filter settings in the console."
              }
            </p>
            {isFiltersModified && (
              <button 
                onClick={handleResetFilters}
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.75rem 1.75rem', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredAppointments.map(app => {
              const isHovered = hoveredCard === app.id;
              
              // Status Styling details
              let statusBg = '';
              let statusText = '';
              let statusBorder = '';
              if (app.status === 'pending') {
                statusBg = 'rgba(254, 243, 199, 0.7)';
                statusText = '#d97706';
                statusBorder = '#fef3c7';
              } else if (app.status === 'accepted') {
                statusBg = 'rgba(209, 250, 229, 0.7)';
                statusText = '#059669';
                statusBorder = '#d1fae5';
              } else {
                statusBg = 'rgba(254, 226, 226, 0.7)';
                statusText = '#dc2626';
                statusBorder = '#fee2e2';
              }

              return (
                <div 
                  key={app.id} 
                  onMouseEnter={() => setHoveredCard(app.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '1.75rem', 
                    boxShadow: isHovered ? '0 12px 24px -6px rgba(15, 23, 42, 0.06)' : '0 4px 12px -2px rgba(15, 23, 42, 0.02)',
                    border: isHovered ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: 'slideUp 0.4s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', 
                        color: 'var(--secondary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.4rem', 
                        fontWeight: '700',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.05)',
                        fontFamily: "'Outfit', sans-serif"
                      }}>
                        {app.patientName ? app.patientName.charAt(0).toUpperCase() : <User size={24} />}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-dark)', fontFamily: "'Outfit', sans-serif" }}>
                          {app.patientName}
                        </h4>
                        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-light)', fontSize: '0.875rem' }}>
                          {app.patientEmail}
                        </p>
                      </div>
                    </div>
                    
                    {/* Date and Time Badges */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.6rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.85rem' }}>
                        <Calendar size={16} color="var(--primary)" /> {app.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.6rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.85rem' }}>
                        <Clock size={16} color="#d97706" /> {app.time}
                      </div>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status:</span>
                      <span style={{ 
                        background: statusBg, 
                        color: statusText, 
                        border: `1px solid ${statusBorder}`,
                        padding: '0.35rem 1rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: `0 2px 8px ${statusBorder}`
                      }}>
                        {app.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleDownloadAppointment(app)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: 'rgba(14, 165, 233, 0.05)',
                          color: 'var(--primary)',
                          border: '1.5px solid rgba(14, 165, 233, 0.3)',
                          padding: '0.5rem 1.2rem',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <Download size={14} /> Download Slip
                      </button>

                      {app.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          onMouseEnter={() => setHoveredDeclineBtn(app.id)}
                          onMouseLeave={() => setHoveredDeclineBtn(null)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.35rem', 
                            background: hoveredDeclineBtn === app.id ? 'rgba(239, 68, 68, 0.05)' : 'white', 
                            color: '#ef4444', 
                            border: '1.5px solid #fca5a5', 
                            padding: '0.55rem 1.25rem', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            boxShadow: hoveredDeclineBtn === app.id ? '0 4px 10px rgba(239, 68, 68, 0.08)' : 'none'
                          }}
                        >
                          <X size={15} /> Decline
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          onMouseEnter={() => setHoveredAcceptBtn(app.id)}
                          onMouseLeave={() => setHoveredAcceptBtn(null)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.35rem', 
                            background: 'linear-gradient(135deg, var(--secondary), #059669)', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.6rem 1.5rem', 
                            borderRadius: '10px', 
                            cursor: 'pointer', 
                            fontWeight: '600', 
                            fontSize: '0.85rem',
                            transition: 'all 0.3s',
                            boxShadow: hoveredAcceptBtn === app.id ? '0 6px 15px rgba(16, 185, 129, 0.3)' : '0 4px 10px rgba(16, 185, 129, 0.15)',
                            transform: hoveredAcceptBtn === app.id ? 'translateY(-1px)' : 'none'
                          }}
                        >
                          <Check size={15} strokeWidth={2.5} /> Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Dynamic Keyframes inject */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        @media (max-width: 600px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}} />
    </PageLayout>
  );
};

export default AcceptAppointment;
