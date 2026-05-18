import React, { useState } from 'react';
import { Mail, Lock, HeartPulse, ArrowRight, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RequestAccess from './RequestAccess';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        
        <div className="login-form-container">
          <div className="form-header">
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
            
            <button type="submit" className="btn-submit">
              Sign In to CarePulse
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="social-login">
            <p>Or continue with</p>
            <div className="social-buttons">
              <button className="btn-social">
                <Stethoscope size={18} color="var(--primary)" />
                Hospital ID
              </button>
              <button className="btn-social">
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
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
