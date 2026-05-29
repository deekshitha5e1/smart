import { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { Star, Download, FileText, Calendar, User, Eye } from 'lucide-react';
import { auth } from '../../firebase';

const DoctorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState(null); // For modal preview

  const userUid = localStorage.getItem('userUid') || auth.currentUser?.uid;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userUid) {
        setLoading(false);
        return;
      }
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/reviews/doctor/${userUid}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          console.error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userUid]);

  const handleDownloadPdf = (pdfUrl, appointmentId) => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Appointment_Review_${appointmentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          fill={i <= rating ? "#f59e0b" : "transparent"}
          color={i <= rating ? "#f59e0b" : "#cbd5e1"}
          style={{ marginRight: '0.2rem' }}
        />
      );
    }
    return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
  };

  return (
    <PageLayout title="Patient Reviews" backPath="/doctor">
      <div style={{ maxWidth: '950px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', marginTop: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
            Patient Feedback
          </h2>
          <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '1rem', fontWeight: '400' }}>
            View details and PDF attachments of reviews submitted by patients for their appointments.
          </p>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(14, 165, 233, 0.1)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-light)', fontWeight: '600', fontSize: '0.95rem' }}>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ 
            background: 'white', 
            padding: '5rem 2rem', 
            borderRadius: '24px', 
            textAlign: 'center', 
            boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.04)', 
            border: '1px solid rgba(226, 232, 240, 0.8)' 
          }}>
            <Star size={56} color="#cbd5e1" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h3 style={{ color: 'var(--text-dark)', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              No Reviews Yet
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '440px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
              When patients rate their consultation and upload their appointment feedback PDFs, they will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {reviews.map((review) => (
              <div 
                key={review.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: 'var(--secondary)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    }}>
                      {review.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)', fontFamily: "'Outfit', sans-serif" }}>
                        {review.patient_name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={13} />
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>APPT ID: #{review.appointment_id}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderStars(review.rating)}
                  </div>
                </div>

                {/* Comments & Suggestions Blocks */}
                {review.comments && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Comments</div>
                    <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{review.comments}</p>
                  </div>
                )}

                {review.suggestions && (
                  <div style={{ background: 'rgba(14, 165, 233, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>Suggestions</div>
                    <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{review.suggestions}</p>
                  </div>
                )}

                {review.pdf_url && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    background: '#f8fafc', 
                    padding: '1rem 1.25rem', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dark)' }}>
                      <FileText size={20} color="var(--primary)" />
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Appointment_Review_Report.pdf</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedPdf(review.pdf_url)}
                        style={{
                          background: 'white',
                          color: 'var(--text-dark)',
                          border: '1px solid #cbd5e1',
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button 
                        onClick={() => handleDownloadPdf(review.pdf_url, review.appointment_id)}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                        onMouseLeave={e => e.currentTarget.style.opacity = 1}
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF View Modal */}
      {selectedPdf && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1100,
          padding: '1.5rem'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '800px', 
            height: '80vh', 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '1.25rem 1.5rem', 
              borderBottom: '1px solid #e2e8f0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-dark)', fontFamily: "'Outfit', sans-serif" }}>
                Review Document Viewer
              </h3>
              <button 
                onClick={() => setSelectedPdf(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5rem', 
                  cursor: 'pointer', 
                  color: 'var(--text-light)', 
                  lineHeight: 1 
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ flex: 1, background: '#f1f5f9' }}>
              <object 
                data={selectedPdf} 
                type="application/pdf" 
                width="100%" 
                height="100%"
              >
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dark)' }}>
                  <p>Unable to display PDF directly in browser.</p>
                  <a 
                    href={selectedPdf} 
                    download="Appointment_Review.pdf"
                    style={{ 
                      display: 'inline-block',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600'
                    }}
                  >
                    Download PDF File
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </PageLayout>
  );
};

export default DoctorReviews;
