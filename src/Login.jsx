import React, { useState } from 'react';
import { Mail, Lock, HeartPulse, ArrowRight, Activity, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RequestAccess from './RequestAccess';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleRole, setGoogleRole] = useState(''); // 'doctor' or 'patient'
  const [showRoleError, setShowRoleError] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.toLowerCase().includes('doctor') || email.toLowerCase().includes('dr')) {
      navigate('/doctor');
    } else {
      navigate('/patient');
    }
  };

  const handleGoogleLogin = () => {
    if (!googleRole) {
      setShowRoleError(true);
      return;
    }
    setShowRoleError(false);

    // If VITE_FIREBASE_API_KEY is not set or is template, run mock/simulated login
    if (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('your_')) {
      alert(`[Demo Mode] Firebase is not fully configured in your .env file.
Proceeding with simulation for role: ${googleRole === 'doctor' ? 'Doctor' : 'Patient'}...`);
      navigate(googleRole === 'doctor' ? '/doctor' : '/patient');
      return;
    }

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        alert(`Welcome, ${user.displayName || 'Google User'}! Signed in successfully.`);
        navigate(googleRole === 'doctor' ? '/doctor' : '/patient');
      })
      .catch((error) => {
        console.error("Firebase OAuth Error:", error);
        alert(`Sign-in failed: ${error.message}`);
      });
  };

  if (isRequestingAccess) {
    return (
      <div className="app-container">
        <RequestAccess onBack={() => setIsRequestingAccess(false)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="login-wrapper">
        <div className="login-hero">
          <div className="hero-content">
            <div className="brand">
              <div className="brand-icon">
                <HeartPulse color="white" size={28} />
              </div>
              CarePulse
            </div>
            
            <div className="hero-text">
              <h1>Smart Hospital Management</h1>
              <p>Experience the future of healthcare administration. Securely access patient records, manage appointments, and coordinate care with our state-of-the-art system.</p>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                <Activity size={20} color="var(--primary)" />
                <span style={{ fontSize: '0.875rem' }}>Real-time Monitoring</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                <ShieldCheck size={20} color="var(--secondary)" />
                <span style={{ fontSize: '0.875rem' }}>Secure Records</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-form-container" style={{ padding: '3rem 4rem' }}>
          <div className="form-header" style={{ marginBottom: '2rem' }}>
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access your account.</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  placeholder="doctor@carepulse.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <Mail className="input-icon" size={20} />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <Lock className="input-icon" size={20} />
              </div>
            </div>
            
            <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn-submit" style={{ marginTop: '0.5rem' }}>
              Sign In to CarePulse
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="social-login" style={{ marginTop: '2rem' }}>
            <p>Or continue with</p>
            <div className="social-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-social" style={{ width: '100%' }}>
                <Stethoscope size={18} color="var(--primary)" />
                Hospital ID
              </button>
              
              <div className="google-login-section" style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)' }}>
                    Select Role for Google Login:
                  </span>
                  {showRoleError && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: '600', animation: 'shake 0.3s' }}>
                      Role required!
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleRole('doctor');
                      setShowRoleError(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      border: '1.5px solid',
                      borderColor: googleRole === 'doctor' ? 'var(--primary)' : '#e2e8f0',
                      background: googleRole === 'doctor' ? 'white' : '#f1f5f9',
                      color: googleRole === 'doctor' ? 'var(--primary)' : 'var(--text-light)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: googleRole === 'doctor' ? '0 4px 8px rgba(14, 165, 233, 0.12)' : 'none'
                    }}
                  >
                    <ShieldCheck size={16} /> Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleRole('patient');
                      setShowRoleError(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      border: '1.5px solid',
                      borderColor: googleRole === 'patient' ? 'var(--secondary)' : '#e2e8f0',
                      background: googleRole === 'patient' ? 'white' : '#f1f5f9',
                      color: googleRole === 'patient' ? 'var(--secondary)' : 'var(--text-light)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: googleRole === 'patient' ? '0 4px 8px rgba(16, 185, 129, 0.12)' : 'none'
                    }}
                  >
                    <User size={16} /> Patient
                  </button>
                </div>
                
                <button 
                  type="button"
                  className="btn-social"
                  onClick={handleGoogleLogin}
                  style={{
                    width: '100%',
                    background: googleRole ? 'white' : '#f8fafc',
                    border: '1px solid',
                    borderColor: googleRole ? '#cbd5e1' : '#e2e8f0',
                    color: googleRole ? 'var(--text-dark)' : 'var(--text-light)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: googleRole ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
          
          <div className="signup-prompt">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRequestingAccess(true); }}>
              Request Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
