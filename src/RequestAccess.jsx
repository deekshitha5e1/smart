import React, { useState } from 'react';
import { ArrowLeft, UserPlus, HeartPulse } from 'lucide-react';

const RequestAccess = ({ onBack }) => {
  const [role, setRole] = useState('patient');

  return (
    <div className="login-wrapper" style={{ animation: 'slideUp 0.4s ease-out forwards' }}>
      <div className="login-hero" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #064e3b 100%)' }}>
        <div className="hero-content">
          <div className="brand">
            <div className="brand-icon">
              <HeartPulse color="white" size={28} />
            </div>
            CarePulse
          </div>
          <div className="hero-text">
            <h1>Join Our Network</h1>
            <p>Request access to the CarePulse platform to manage health records or hospital appointments seamlessly.</p>
          </div>
        </div>
      </div>
      
      <div className="login-form-container">
        <button 
          onClick={onBack} 
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-light)', 
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            marginBottom: '2rem', fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <div className="form-header">
          <h2>Request Access</h2>
          <p>Please provide your details below.</p>
        </div>
        
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); alert('Access request submitted!'); onBack(); }}>
          <div className="input-group">
            <label>I am a...</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="role" value="patient" checked={role === 'patient'} onChange={() => setRole('patient')} /> Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="role" value="doctor" checked={role === 'doctor'} onChange={() => setRole('doctor')} /> Medical Professional
              </label>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <input type="text" id="fullName" placeholder="John Doe" required />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="reqEmail">Email Address</label>
            <div className="input-wrapper">
              <input type="email" id="reqEmail" placeholder="john@example.com" required />
            </div>
          </div>

          {role === 'doctor' && (
            <div className="input-group">
              <label htmlFor="hospitalId">Hospital ID / Medical License</label>
              <div className="input-wrapper">
                <input type="text" id="hospitalId" placeholder="MED-12345" required />
              </div>
            </div>
          )}

          <button type="submit" className="btn-submit" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--secondary), #059669)' }}>
            Submit Request
            <UserPlus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestAccess;
