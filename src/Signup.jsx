import React, { useState } from 'react';
import { ArrowLeft, UserPlus, HeartPulse, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { auth, db, UserRole } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = ({ onBack }) => {
  const [role, setRole] = useState(UserRole.PATIENT);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the user credentials in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Call the FastAPI backend to store the user details in PostgreSQL/Supabase
      const url = new URL('http://localhost:8000/api/users/signup');
      if (role === UserRole.DOCTOR) {
        url.searchParams.append('hospital_id', hospitalId);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: email,
          full_name: fullName,
          role: role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to store user profile in database');
      }

      alert('Sign up successful! Your user account and profile are stored in Supabase PostgreSQL.');
      onBack();
    } catch (error) {
      console.error("Firebase Auth & Firestore Registration Error:", error);
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        alert("Firestore Error: Missing or insufficient permissions. Please go to your Firebase Console -> Firestore Database -> Rules and change the rules to allow read/write (e.g., 'allow read, write: if request.auth != null;').");
      } else if (error.message?.includes('database') || error.code === 'unavailable' || error.code === 'not-found') {
        alert("Firestore Error: Database not initialized. Please go to your Firebase Console -> Firestore Database and click 'Create Database'.");
      } else if (error.code === 'auth/email-already-in-use') {
        alert("An account with this email address already exists. You cannot register the same email twice for different roles. Please log in instead.");
      } else {
        alert(`Registration failed: ${error.message} (${error.code})`);
      }
    } finally {
      setLoading(false);
    }
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
            <p>Sign up to the CarePulse platform to manage health records or hospital appointments seamlessly.</p>
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
          <h2>Sign Up</h2>
          <p>Please provide your details below to register.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '1.25rem' }}>
          <div className="input-group">
            <label>I am a...</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                <input type="radio" name="role" value={UserRole.PATIENT} checked={role === UserRole.PATIENT} onChange={() => setRole(UserRole.PATIENT)} /> Patient
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                <input type="radio" name="role" value={UserRole.DOCTOR} checked={role === UserRole.DOCTOR} onChange={() => setRole(UserRole.DOCTOR)} /> Medical Professional
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

          {role === UserRole.DOCTOR && (
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

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem', 
              background: 'linear-gradient(135deg, var(--secondary), #059669)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <UserPlus size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
