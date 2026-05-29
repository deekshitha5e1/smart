import { useState, useEffect, useCallback, useMemo } from 'react';
import PageLayout from '../../components/PageLayout';
import { auth } from '../../firebase';
import { 
  Pill, Search, User, Calendar, FileText, Printer, CheckCircle, Info, Heart, ShieldCheck, Download
} from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;
  const userEmail = localStorage.getItem('userEmail') || '';

  const fetchPrescriptions = useCallback(async () => {
    if (!userUid) {
      setLoading(false);
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      // We query by patient UID and optional patient email as fallback
      const url = userEmail 
        ? `${API_URL}/api/patient/${userUid}/prescriptions?email=${encodeURIComponent(userEmail)}`
        : `${API_URL}/api/patient/${userUid}/prescriptions`;
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
    } finally {
      setLoading(false);
    }
  }, [userUid, userEmail]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  // Live filter list
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(presc => {
      const search = searchQuery.toLowerCase().trim();
      if (!search) return true;
      return (
        presc.doctor_name.toLowerCase().includes(search) ||
        presc.diagnosis.toLowerCase().includes(search) ||
        presc.medicines.some(m => m.name.toLowerCase().includes(search))
      );
    });
  }, [prescriptions, searchQuery]);

  // Direct print option for a specific prescription ID
  const handlePrint = (id) => {
    const originalTitle = document.title;
    document.title = `Prescription_CarePulse_${id}`;
    
    // We add a print-target class to the selected card, trigger window.print(), and remove it
    const element = document.getElementById(`presc-slip-${id}`);
    if (element) {
      element.classList.add('print-active');
      window.print();
      element.classList.remove('print-active');
    }
    
    document.title = originalTitle;
  };

  const handleDownloadPrescription = (presc) => {
    const dateObj = new Date(presc.created_at);
    const issuedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const medicineRows = presc.medicines.map(med => `
      <tr>
        <td style="padding: 0.8rem 1.25rem; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${med.name}</td>
        <td style="padding: 0.8rem 1.25rem; border-bottom: 1px solid #f1f5f9;">
          <span style="background: rgba(16, 185, 129, 0.08); color: #10b981; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">
            ${med.dosage}
          </span>
        </td>
        <td style="padding: 0.8rem 1.25rem; color: #64748b; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${med.duration}</td>
      </tr>
    `).join('');

    const recommendationsHtml = presc.additional_recommendations ? `
      <div style="border-top: 1px dashed #e2e8f0; padding-top: 1.5rem; margin-top: 2rem;">
        <span style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.5rem;">
          Doctor's Recommendations
        </span>
        <p style="margin: 0; font-size: 0.875rem; color: #64748b; line-height: 1.6;">${presc.additional_recommendations}</p>
      </div>
    ` : '';

    const htmlContent = `
<div style="font-family: 'Inter', sans-serif; background-color: white; color: #0f172a; padding: 2.5rem; border-radius: 24px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; max-width: 650px; margin: 0 auto;">
  <div style="height: 6px; background: linear-gradient(90deg, #0ea5e9, #10b981); position: absolute; top: 0; left: 0; right: 0;"></div>
  
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2rem;">
    <h3 style="margin: 0; font-size: 1.5rem; color: #0284c7;">CarePulse Hospital</h3>
    <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; background: rgba(16, 185, 129, 0.08); padding: 0.35rem 0.75rem; border-radius: 20px;">Verified Prescription</span>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
    <div>
      <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.25rem; letter-spacing: 0.04em;">Prescribing Physician</label>
      <strong style="font-size: 1.05rem; color: #0f172a; display: block;">Dr. ${presc.doctor_name}</strong>
      <span style="font-size: 0.8rem; color: #64748b;">${presc.doctor_specialisation || 'CarePulse Authorized Specialist'}</span>
    </div>
    <div>
      <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.25rem; letter-spacing: 0.04em;">Issued For Patient</label>
      <strong style="font-size: 1.05rem; color: #0f172a; display: block;">${presc.patient_name}</strong>
      <span style="font-size: 0.8rem; color: #64748b;">${presc.patient_email || 'Verified Account'}</span>
    </div>
  </div>

  <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #64748b; margin-bottom: 1.75rem;">
    <span>Issued on <strong>${issuedDate}</strong></span>
  </div>

  <div style="margin-bottom: 2rem;">
    <span style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.75rem; letter-spacing: 0.06em;">Clinical Diagnosis Notes</span>
    <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 1.25rem; border-radius: 14px; font-size: 0.95rem; color: #0f172a; line-height: 1.5; font-weight: 500;">
      ${presc.diagnosis}
    </div>
  </div>

  <div style="margin-bottom: 2rem;">
    <span style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.75rem; letter-spacing: 0.06em;">Prescribed Regimen / Medicine Sheet</span>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 0.8rem 1.25rem; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Medicine Name</th>
          <th style="padding: 0.8rem 1.25rem; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Dosage Instructions</th>
          <th style="padding: 0.8rem 1.25rem; color: #0f172a; font-weight: 700; border-bottom: 1px solid #e2e8f0;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${medicineRows}
      </tbody>
    </table>
  </div>

  ${recommendationsHtml}

  <div style="margin-top: 2.5rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
    <div style="font-size: 0.75rem; color: #64748b; line-height: 1.5;">
      <p style="margin: 0;">CarePulse Digitally Signed Registry</p>
      <p style="margin: 0.2rem 0 0; font-family: monospace; opacity: 0.8;">UUID: ${presc.doctor_id}</p>
    </div>
    <div style="text-align: right; width: 200px;">
      <div style="border-bottom: 1px solid #cbd5e1; height: 30px; margin-bottom: 0.4rem;"></div>
      <strong style="font-size: 0.85rem; color: #0f172a; display: block;">Dr. ${presc.doctor_name}</strong>
      <span style="font-size: 0.75rem; color: #64748b;">Authorized Signature</span>
    </div>
  </div>
</div>
    `;

    const runHtml2Pdf = () => {
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      const opt = {
        margin:       0.5,
        filename:     `CarePulse_Prescription_${presc.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().from(element).set(opt).save();
    };

    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        runHtml2Pdf();
      };
      document.body.appendChild(script);
    }
  };

  return (
    <PageLayout title="Prescription Management" backPath="/patient">
      <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header Title Section */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', marginTop: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
              My Prescriptions
            </h2>
            <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '1rem', fontWeight: '400' }}>
              Access active medical regimens, download verified drug sheets, and print doctor slips.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem 1rem', borderRadius: '12px', color: 'var(--secondary)', fontWeight: '600', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} /> Digitally Verified
          </div>
        </div>

        {/* Live Filter Bar */}
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
              placeholder="Search by drug name, doctor name, or diagnosis notes..." 
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

        {/* Prescriptions Stack */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(16, 185, 129, 0.1)', borderTopColor: 'var(--secondary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-light)', fontWeight: '600', fontSize: '0.95rem' }}>Retrieving your verified prescriptions...</p>
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
              {prescriptions.length === 0 ? 'No Prescriptions Found' : 'No Matching Prescriptions'}
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '440px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {prescriptions.length === 0 
                ? "You do not have any active digital prescriptions registered in CarePulse yet." 
                : "No matching regimens were found in your record. Try resetting your search term."
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {filteredPrescriptions.map(presc => {
              const isHovered = hoveredCard === presc.id;
              const dateObj = new Date(presc.created_at);
              const issuedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              });

              return (
                <div 
                  key={presc.id}
                  id={`presc-slip-${presc.id}`}
                  onMouseEnter={() => setHoveredCard(presc.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="prescription-slip-card"
                  style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    boxShadow: isHovered ? '0 20px 40px -12px rgba(15, 23, 42, 0.08)' : '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: 'slideUp 0.4s ease-out'
                  }}
                >
                  {/* Decorative Slip Header line */}
                  <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', position: 'absolute', top: 0, left: 0, right: 0 }} />

                  {/* Print & Details Ribbon */}
                  <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => handleDownloadPrescription(presc)}
                      style={{
                        background: 'rgba(14, 165, 233, 0.05)',
                        border: '1.5px solid rgba(14, 165, 233, 0.3)',
                        color: 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s'
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
                      <Download size={14} /> Download Digital Slip
                    </button>

                    <button
                      onClick={() => handlePrint(presc.id)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: 'var(--text-dark)',
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                      <Printer size={14} /> Print Clinical Slip
                    </button>
                  </div>

                  {/* High Fidelity Clinical Seal / Clinic Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-dark)', fontFamily: "'Outfit', sans-serif" }}>
                        CarePulse Hospital
                      </h3>
                    </div>
                  </div>

                  {/* Doctor & Patient Metadata Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>Prescribing Physician</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-dark)', display: 'block', fontFamily: "'Outfit', sans-serif" }}>Dr. {presc.doctor_name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{presc.doctor_specialisation || 'CarePulse Authorized Specialist'}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem', letterSpacing: '0.04em' }}>Issued For Patient</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-dark)', display: 'block', fontFamily: "'Outfit', sans-serif" }}>{presc.patient_name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{presc.patient_email || 'Verified Account'}</span>
                    </div>
                  </div>

                  {/* Date of Issue Info block */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.75rem' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>Issued on <strong>{issuedDate}</strong></span>
                  </div>

                  {/* Diagnosis */}
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>Clinical Diagnosis Notes</span>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', borderLeft: '4px solid var(--primary)', fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.5', fontWeight: '500' }}>
                      {presc.diagnosis}
                    </div>
                  </div>

                  {/* Regimen Drugs Table */}
                  <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>Prescribed Drugs / Regimen</span>
                    
                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.8rem 1.25rem', color: 'var(--text-dark)', fontWeight: '700' }}>Medicine Name</th>
                            <th style={{ padding: '0.8rem 1.25rem', color: 'var(--text-dark)', fontWeight: '700' }}>Dosage Instructions</th>
                            <th style={{ padding: '0.8rem 1.25rem', color: 'var(--text-dark)', fontWeight: '700' }}>Tablets Per Day</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presc.medicines.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: idx === presc.medicines.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.8rem 1.25rem', fontWeight: '700', color: 'var(--text-dark)' }}>{med.name}</td>
                              <td style={{ padding: '0.8rem 1.25rem' }}>
                                <span style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--secondary)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>
                                  {med.dosage}
                                </span>
                              </td>
                              <td style={{ padding: '0.8rem 1.25rem', color: 'var(--text-light)', fontWeight: '500' }}>{med.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Custom Recommendations Block */}
                  {presc.additional_recommendations && (
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                        <Info size={14} color="var(--primary)" /> Doctor's Recommendation
                      </span>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)', lineHeight: '1.6' }}>{presc.additional_recommendations}</p>
                    </div>
                  )}

                  {/* Print-only Clinician Signature Block */}
                  <div className="print-only" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem', marginTop: '1.5rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-light)' }}>Verification: CarePulse Digital Ledger</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>UUID: {presc.doctor_id}</p>
                    </div>
                    <div style={{ textAlign: 'right', width: '200px' }}>
                      <div style={{ borderBottom: '1px solid #000', height: '30px', marginBottom: '0.4rem' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)', display: 'block' }}>Dr. {presc.doctor_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Authorized Signature</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Global CSS Inject for Spacing, Animations and Direct Printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Direct Slip Printing Sheet Styles */
        @media print {
          body * {
            visibility: hidden !important;
          }
          
          /* Only display the selected print card */
          .prescription-slip-card.print-active,
          .prescription-slip-card.print-active * {
            visibility: visible !important;
          }
          
          .prescription-slip-card.print-active {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: flex !important;
          }
        }
      `}} />
    </PageLayout>
  );
};

export default Prescriptions;
