import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Check, X, Calendar, Clock, User, AlertCircle } from 'lucide-react';

const AcceptAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  useEffect(() => {
    fetchAppointments();
  }, [userUid]);

  const fetchAppointments = async () => {
    if (!userUid) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/doctor/${userUid}/appointments`);
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(app => ({
          id: app.id,
          patientName: app.patient_name,
          patientEmail: app.patient_email,
          date: app.appointment_date,
          time: app.appointment_time,
          status: app.status
        }));
        // Sort by date
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/appointment/${id}/status?status=${newStatus}`, {
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

  return (
    <PageLayout title="Appointment Requests" backPath="/doctor">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Patient Requests</h2>
          <p style={{ color: 'var(--text-light)' }}>Review and manage incoming appointment requests from patients.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <p>Loading requests...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <Calendar size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--text-dark)' }}>No Requests Yet</h3>
            <p style={{ color: 'var(--text-light)' }}>You don't have any pending appointment requests right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map(app => (
              <div key={app.id} style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '1.5rem', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                animation: 'slideUp 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {app.patientName ? app.patientName.charAt(0).toUpperCase() : <User size={24} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{app.patientName}</h4>
                      <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.875rem' }}>{app.patientEmail}</p>
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
                    {app.status === 'pending' && <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Pending</span>}
                    {app.status === 'accepted' && <span style={{ background: '#d1fae5', color: '#047857', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Accepted</span>}
                    {app.status === 'rejected' && <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>Rejected</span>}
                  </div>

                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'white', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                      >
                        <X size={16} /> Decline
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--secondary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                      >
                        <Check size={16} /> Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AcceptAppointment;
