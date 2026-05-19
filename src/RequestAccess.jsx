import React, { useState } from 'react';
import { ArrowLeft, UserPlus, HeartPulse, Lock, Mail, User, ShieldCheck } from 'lucide-react';

const RequestAccess = ({ onBack }) => {
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert('Access request submitted successfully! Your account registration is pending review.');
    onBack();
  };

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
      
      <div className="login-form-container" style={{ padding: '3rem 4rem' }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-light)', 
            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
            marginBottom: '1.5rem', fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <div className="form-header" style={{ marginBottom: '1.5rem' }}>
          <h2>Request Access</h2>
          <p>Please provide your details below to register.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '1.25rem' }}>
          <div className="input-group">
            <label>I am a...</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                <input type="radio" name="role" value="patient" checked={role === 'patient'} onChange={() => setRole('patient')} /> Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                <input type="radio" name="role" value="doctor" checked={role === 'doctor'} onChange={() => setRole('doctor')} /> Medical Professional
              </label>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <input 
                type="text" 
                id="fullName" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
              <User className="input-icon" size={20} />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="reqEmail">Email Address</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                id="reqEmail" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <Mail className="input-icon" size={20} />
            </div>
          </div>

          {role === 'doctor' && (
            <div className="input-group">
              <label htmlFor="hospitalId">Hospital ID / Medical License</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="hospitalId" 
                  placeholder="MED-12345" 
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required 
                />
                <ShieldCheck className="input-icon" size={20} />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="createPassword">Create Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                id="createPassword" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
              />
              <Lock className="input-icon" size={20} />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                minLength={6}
              />
              <Lock className="input-icon" size={20} />
            </div>
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: '1rem', background: 'linear-gradient(135deg, var(--secondary), #059669)' }}>
            Submit Request
            <UserPlus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestAccess;
