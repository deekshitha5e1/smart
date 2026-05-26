import { useState, useEffect, useCallback, useMemo } from 'react';
import PageLayout from '../../components/PageLayout';
import { auth } from '../../firebase';
import { 
  Pill, Plus, Trash2, Edit, Trash, Search, User, Mail, FileText, 
  ChevronRight, Calendar, AlertCircle, CheckCircle, Clock, X, Info
} from 'lucide-react';

const ManagePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrescriptionId, setEditPrescriptionId] = useState(null);

  // Form Fields
  const [patientSelection, setPatientSelection] = useState('appointment'); // 'appointment' or 'manual'
  const [selectedApptId, setSelectedApptId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [additionalRecommendations, setAdditionalRecommendations] = useState('');

  // UI States
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [hoveredCard, setHoveredCard] = useState(null);

  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  const triggerAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const fetchPrescriptions = useCallback(async () => {
    if (!userUid) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/doctor/${userUid}/prescriptions`);
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  }, [userUid]);

  const fetchAppointments = useCallback(async () => {
    if (!userUid) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/doctor/${userUid}/appointments`);
      if (response.ok) {
        const data = await response.json();
        // Filter appointments that are accepted or completed
        const activeAppts = data.filter(appt => appt.status === 'accepted');
        // Map fields properly for the dropdown selection
        const mapped = activeAppts.map(appt => ({
          id: appt.id,
          patient_id: appt.patient_id,
          patientName: appt.patient_name,
          patientEmail: appt.patient_email,
          date: appt.appointment_date,
          time: appt.appointment_time,
          status: appt.status
        }));
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [userUid]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPrescriptions(), fetchAppointments()]);
      setLoading(false);
    };
    loadData();
  }, [fetchPrescriptions, fetchAppointments]);

  // Handle appointment dropdown selection
  const handleAppointmentSelect = (e) => {
    const apptId = e.target.value;
    setSelectedApptId(apptId);
    if (!apptId) {
      setPatientId('');
      setPatientName('');
      setPatientEmail('');
      return;
    }
    const appt = appointments.find(a => a.id === parseInt(apptId));
    if (appt) {
      setPatientId(appt.patient_id);
      setPatientName(appt.patientName);
      setPatientEmail(appt.patientEmail);
    }
  };

  // Medicine Builder inputs
  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  };

  const removeMedicineRow = (index) => {
    if (medicines.length === 1) {
      setMedicines([{ name: '', dosage: '', duration: '' }]);
      return;
    }
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  // Reset form
  const resetForm = () => {
    setPatientSelection('appointment');
    setSelectedApptId('');
    setPatientId('');
    setPatientName('');
    setPatientEmail('');
    setDiagnosis('');
    setMedicines([{ name: '', dosage: '', duration: '' }]);
    setAdditionalRecommendations('');
    setEditPrescriptionId(null);
    setIsEditing(false);
  };

  // Open creation form modal
  const openCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  // Handle edit click
  const handleEditClick = (presc) => {
    resetForm();
    setIsEditing(true);
    setEditPrescriptionId(presc.id);
    
    // Determine patient selection mode
    if (presc.patient_id) {
      const match = appointments.find(a => a.patient_id === presc.patient_id);
      if (match) {
        setPatientSelection('appointment');
        setSelectedApptId(match.id.toString());
      } else {
        setPatientSelection('manual');
      }
      setPatientId(presc.patient_id);
    } else {
      setPatientSelection('manual');
      setPatientId('');
    }

    setPatientName(presc.patient_name);
    setPatientEmail(presc.patient_email || '');
    setDiagnosis(presc.diagnosis);
    setMedicines(presc.medicines.length > 0 ? presc.medicines : [{ name: '', dosage: '', duration: '' }]);
    setAdditionalRecommendations(presc.additional_recommendations || '');
    
    setShowFormModal(true);
  };

  // Submit form (create or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !patientName.trim()) {
      triggerAlert("Patient name is required", "error");
      return;
    }
    if (!diagnosis.trim()) {
      triggerAlert("Diagnosis notes are required", "error");
      return;
    }

    // Filter empty medicines
    const filteredMeds = medicines.filter(m => m.name.trim() !== '');
    if (filteredMeds.length === 0) {
      triggerAlert("Please prescribe at least one medicine", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const payload = {
        patient_id: patientId || null,
        patient_name: patientName,
        patient_email: patientEmail || null,
        diagnosis,
        medicines: filteredMeds,
        additional_recommendations: additionalRecommendations
      };

      let url = `${API_URL}/api/prescriptions?doctor_uid=${userUid}`;
      let method = 'POST';

      if (isEditing) {
        url = `${API_URL}/api/prescriptions/${editPrescriptionId}?doctor_uid=${userUid}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        triggerAlert(
          isEditing ? "Prescription updated successfully!" : "Prescription issued successfully!"
        );
        setShowFormModal(false);
        resetForm();
        fetchPrescriptions();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Request failed");
      }
    } catch (error) {
      console.error("Error submitting prescription:", error);
      triggerAlert(error.message || "Failed to submit prescription", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription? This action cannot be undone.")) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/prescriptions/${id}?doctor_uid=${userUid}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        triggerAlert("Prescription deleted successfully!");
        fetchPrescriptions();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting prescription:", error);
      triggerAlert("Failed to delete prescription", "error");
    }
  };

  // Memoized filter list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(presc => {
      const search = searchQuery.toLowerCase().trim();
      if (!search) return true;
      return (
        presc.patient_name.toLowerCase().includes(search) ||
        (presc.patient_email && presc.patient_email.toLowerCase().includes(search)) ||
        presc.diagnosis.toLowerCase().includes(search) ||
        presc.medicines.some(m => m.name.toLowerCase().includes(search))
      );
    });
  }, [prescriptions, searchQuery]);

  return (
    <PageLayout title="Manage Prescriptions" backPath="/doctor">
      <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
        
        {/* Floating Alert System */}
        {alertMsg && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 10000,
            background: alertType === 'success' ? 'var(--secondary)' : '#ef4444',
            color: 'white',
            padding: '0.85rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            animation: 'slideUp 0.3s ease-out',
            fontSize: '0.9rem'
          }}>
            {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {alertMsg}
          </div>
        )}

        {/* Top Header Panel */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', marginTop: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              Digital Prescriptions
            </h2>
            <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '1rem', fontWeight: '400' }}>
              Issue digital prescriptions, compile clinical regimens, and review past treatment histories.
            </p>
          </div>
          
          <button 
            onClick={openCreateModal}
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.75rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <Plus size={18} strokeWidth={2.5} /> Issue New Prescription
          </button>
        </div>

        {/* Premium Search Filter Console */}
        <div style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px', 
          border: '1px solid var(--glass-border)', 
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '2rem',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0 1rem' }}>
            <Search size={18} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search by patient name, diagnosis, or prescribed medicine..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0.75rem', width: '100%', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-dark)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(14, 165, 233, 0.1)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-light)', fontWeight: '600', fontSize: '0.95rem' }}>Loading prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '5rem 2rem', 
            borderRadius: '24px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)', 
            border: '1px solid rgba(226, 232, 240, 0.8)' 
          }}>
            <Pill size={56} color="#cbd5e1" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              {prescriptions.length === 0 ? 'No Prescriptions Issued' : 'No Matching Prescriptions'}
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '440px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {prescriptions.length === 0 
                ? "You haven't generated any digital prescriptions yet. Click the button above to draft one." 
                : "We couldn't find any prescriptions matching your search criteria. Try modifying your keywords."
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {filteredPrescriptions.map(presc => {
              const isHovered = hoveredCard === presc.id;
              const createdDate = new Date(presc.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              });

              return (
                <div 
                  key={presc.id}
                  onMouseEnter={() => setHoveredCard(presc.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: isHovered ? '0 12px 24px -6px rgba(15, 23, 42, 0.06)' : '0 4px 12px -2px rgba(15, 23, 42, 0.02)',
                    border: isHovered ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid rgba(226, 232, 240, 0.8)',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    animation: 'slideUp 0.4s ease-out'
                  }}
                >
                  {/* Top Bar info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.05))', 
                        color: '#ec4899', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        fontFamily: "'Outfit', sans-serif"
                      }}>
                        {presc.patient_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)', fontFamily: "'Outfit', sans-serif" }}>
                          {presc.patient_name}
                        </h4>
                        <p style={{ margin: '0.15rem 0 0', color: 'var(--text-light)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={12} /> {presc.patient_email || 'No email attached'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Calendar size={14} color="var(--primary)" /> {createdDate}
                      </div>
                      
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleEditClick(presc)}
                          style={{
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            color: 'var(--text-dark)',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                          title="Edit Prescription"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(presc.id)}
                          style={{
                            background: 'white',
                            border: '1px solid #fca5a5',
                            color: '#ef4444',
                            padding: '0.4rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                          title="Delete Prescription"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: '3px solid var(--primary)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>Diagnosis / Clinical Findings</span>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '500', lineHeight: '1.5' }}>{presc.diagnosis}</p>
                  </div>

                  {/* Medicines Grid */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>Prescribed Regimen</span>
                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.6rem 1rem', color: 'var(--text-dark)', fontWeight: '600' }}>Medicine Name</th>
                            <th style={{ padding: '0.6rem 1rem', color: 'var(--text-dark)', fontWeight: '600' }}>Dosage Instructions</th>
                            <th style={{ padding: '0.6rem 1rem', color: 'var(--text-dark)', fontWeight: '600' }}>Tablets Per Day</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presc.medicines.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === presc.medicines.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.6rem 1rem', fontWeight: '600', color: 'var(--text-dark)' }}>{med.name}</td>
                              <td style={{ padding: '0.6rem 1rem', color: 'var(--text-dark)' }}>
                                <span style={{ background: 'rgba(14, 165, 233, 0.08)', color: 'var(--primary-dark)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                  {med.dosage}
                                </span>
                              </td>
                              <td style={{ padding: '0.6rem 1rem', color: 'var(--text-light)' }}>{med.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Recommendations */}
                  {presc.additional_recommendations && (
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>
                        <Info size={12} color="var(--primary)" /> Recommendations & Instructions
                      </span>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)', lineHeight: '1.5' }}>{presc.additional_recommendations}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form Dialog */}
        {showFormModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-dark)', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Pill size={22} color="#ec4899" /> {isEditing ? "Edit Digital Prescription" : "Draft New Prescription"}
                </h3>
                <button 
                  onClick={() => setShowFormModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', color: 'var(--text-dark)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 1. Patient Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem' }}>Patient Registration Mode</label>
                  
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', background: patientSelection === 'appointment' ? 'rgba(14, 165, 233, 0.06)' : 'white', borderColor: patientSelection === 'appointment' ? 'var(--primary)' : '#cbd5e1', color: patientSelection === 'appointment' ? 'var(--primary-dark)' : 'var(--text-dark)' }}>
                        <input 
                          type="radio" 
                          name="selection" 
                          checked={patientSelection === 'appointment'} 
                          onChange={() => { setPatientSelection('appointment'); resetForm(); }}
                        />
                        Select from Appointments
                      </label>
                      
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', background: patientSelection === 'manual' ? 'rgba(14, 165, 233, 0.06)' : 'white', borderColor: patientSelection === 'manual' ? 'var(--primary)' : '#cbd5e1', color: patientSelection === 'manual' ? 'var(--primary-dark)' : 'var(--text-dark)' }}>
                        <input 
                          type="radio" 
                          name="selection" 
                          checked={patientSelection === 'manual'} 
                          onChange={() => { setPatientSelection('manual'); resetForm(); setPatientSelection('manual'); }}
                        />
                        Enter Manually
                      </label>
                    </div>
                  )}

                  {patientSelection === 'appointment' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.4rem' }}>Select Accepted Patient Consultation</label>
                      <select
                        value={selectedApptId}
                        onChange={handleAppointmentSelect}
                        disabled={isEditing}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                      >
                        <option value="">-- Choose an appointment --</option>
                        {appointments.map(appt => (
                          <option key={appt.id} value={appt.id}>
                            {appt.patientName} ({appt.patientEmail}) - Date: {appt.date} at {appt.time}
                          </option>
                        ))}
                      </select>
                      {appointments.length === 0 && (
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertCircle size={12} /> Note: No "accepted" appointments found in your roster. You can use 'Enter Manually'.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.4rem' }}>Patient Name *</label>
                        <input 
                          type="text" 
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. John Doe"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.4rem' }}>Patient Email</label>
                        <input 
                          type="email" 
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                      ✏️ Editing prescription issued for <strong>{patientName}</strong> {patientEmail ? `(${patientEmail})` : ''}
                    </div>
                  )}
                </div>

                {/* 2. Diagnosis Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>Diagnosis Notes *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter diagnosis findings, symptoms reported, and clinical assessments..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* 3. Medicines Dynamic Builder */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>Prescribe Medicines *</label>
                    <button
                      type="button"
                      onClick={addMedicineRow}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <Plus size={14} strokeWidth={2.5} /> Add Medicine Row
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {medicines.map((med, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <input 
                            type="text" 
                            required
                            placeholder="Medicine Name (e.g. Paracetamol)"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            required
                            placeholder="Dosage (e.g. 500mg, 1-0-1)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <input 
                            type="text" 
                            required
                            placeholder="Tablets Per Day (e.g. 2 tablets)"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                            style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicineRow(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Additional Recommendations */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>Additional Recommendations / General Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Enter dietary advices, follow-up times, precautions, or lab tests required..."
                    value={additionalRecommendations}
                    onChange={(e) => setAdditionalRecommendations(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', opacity: submitLoading ? 0.7 : 1 }}
                  >
                    {submitLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Issue Prescription')}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
      
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </PageLayout>
  );
};

export default ManagePrescriptions;
