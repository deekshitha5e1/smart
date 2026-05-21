import { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { User, Mail, ShieldCheck, Clock, Calendar, Hash, Save, Briefcase, Activity } from 'lucide-react';
import { auth } from '../../firebase';

const DoctorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    uid: '',
    hospitalId: '',
    specialisation: '',
    shift: 'day', // 'day' or 'night'
    freeTime: '',
    patientsConsulted: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const savedUid = auth.currentUser?.uid || localStorage.getItem('userUid');
      const savedEmail = auth.currentUser?.email || localStorage.getItem('userEmail');
      const savedName = auth.currentUser?.displayName || localStorage.getItem('userName');

      try {
        if (!savedUid) {
          console.error("No user UID found");
          setLoading(false);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/doctor/profile/${savedUid}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            fullName: data.full_name || savedName || '',
            email: data.email || savedEmail || '',
            uid: data.uid || savedUid || '',
            hospitalId: data.hospital_id || '',
            specialisation: data.specialisation || '',
            shift: data.shift || 'day',
            freeTime: data.free_time || '',
            patientsConsulted: data.patients_consulted || 0,
          });
        } else {
          // If the profile isn't initialized yet in database, autofill with local session data
          setProfileData(prev => ({
            ...prev,
            uid: savedUid || '',
            email: savedEmail || '',
            fullName: savedName || '',
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback to local session data
        setProfileData(prev => ({
          ...prev,
          uid: savedUid || '',
          email: savedEmail || '',
          fullName: savedName || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid || localStorage.getItem('userUid') || profileData.uid;
      if (!uid) throw new Error("No UID found for saving profile");

      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/doctor/profile/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileData.fullName,
          hospital_id: profileData.hospitalId,
          specialisation: profileData.specialisation,
          shift: profileData.shift,
          free_time: profileData.freeTime,
          patients_consulted: Number(profileData.patientsConsulted),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save validation error details:", errorData);
        throw new Error(errorData.detail || "Failed to save profile");
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Doctor Profile" backPath="/doctor">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <p>Loading profile...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Doctor Profile" backPath="/doctor">
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : <User size={32} />}
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.5rem' }}>{profileData.fullName || 'Doctor'}</h2>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{profileData.specialisation || 'Specialisation not set'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Full Name */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <User size={18} color="var(--text-light)" />
                <input 
                  type="text" 
                  name="fullName"
                  value={profileData.fullName} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }} 
                  required
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Email Address</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Mail size={18} color="var(--text-light)" />
                <input 
                  type="email" 
                  value={profileData.email} 
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none', color: 'var(--text-light)' }} 
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* UID (Read Only, Autofilled from Firebase) */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Firebase UID</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Hash size={18} color="var(--text-light)" />
                <input 
                  type="text" 
                  value={profileData.uid} 
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none', color: 'var(--text-light)', fontSize: '0.85rem' }} 
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Medical ID (Enabled) */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Medical / Hospital ID</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <ShieldCheck size={18} color="var(--text-light)" />
                <input 
                  type="text" 
                  name="hospitalId"
                  value={profileData.hospitalId} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }} 
                  required
                />
              </div>
            </div>

            {/* Specialisation */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Specialisation</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Briefcase size={18} color="var(--text-light)" />
                <input 
                  type="text" 
                  name="specialisation"
                  placeholder="e.g. Cardiologist"
                  value={profileData.specialisation} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }} 
                />
              </div>
            </div>

            {/* Shift */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Working Shift</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Clock size={18} color="var(--text-light)" />
                <select 
                  name="shift"
                  value={profileData.shift} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none', color: 'var(--text-dark)' }} 
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                </select>
              </div>
            </div>

            {/* Free Time */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Free Time / Break</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Calendar size={18} color="var(--text-light)" />
                <input 
                  type="text" 
                  name="freeTime"
                  placeholder="e.g. 1:00 PM - 2:00 PM"
                  value={profileData.freeTime} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }} 
                />
              </div>
            </div>

            {/* Patients Consulted */}
            <div className="input-group" style={{ margin: 0 }}>
              <label>Patients Consulted</label>
              <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
                <Activity size={18} color="var(--text-light)" />
                <input 
                  type="number" 
                  name="patientsConsulted"
                  min="0"
                  value={profileData.patientsConsulted} 
                  onChange={handleChange}
                  style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none' }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'var(--primary)', 
                color: 'white', 
                border: 'none', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '12px', 
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: saving ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default DoctorProfile;
