import React, { useState } from 'react';
import { Mail, Lock, HeartPulse, ArrowRight, Activity, ShieldCheck, Stethoscope, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider, UserRole, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleRole, setGoogleRole] = useState(''); // 'doctor' or 'patient'
  const [showRoleError, setShowRoleError] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve user profile from FastAPI Backend to determine role
      const response = await fetch(`http://localhost:8000/api/users/${user.uid}`);
      
      if (response.ok) {
        const userData = await response.json();
        
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', userData.full_name || user.email.split('@')[0]);
        localStorage.setItem('userUid', user.uid);
        localStorage.removeItem('userPhoto');

        if (userData.role === UserRole.DOCTOR) {
          navigate('/doctor');
        } else {
          navigate('/patient');
        }
      } else if (response.status === 404) {
        // Fallback: If the user exists in Auth but has no profile in PostgreSQL, automatically create one as a Patient.
        const defaultUserData = {
          uid: user.uid,
          fullName: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: UserRole.PATIENT
        };
        
        try {
          const signupResponse = await fetch('http://localhost:8000/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: defaultUserData.uid,
              email: defaultUserData.email,
              full_name: defaultUserData.fullName,
              role: defaultUserData.role
            })
          });

          if (!signupResponse.ok) throw new Error("Backend signup failed");

          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', defaultUserData.fullName);
          localStorage.setItem('userUid', user.uid);
          localStorage.removeItem('userPhoto');
          navigate('/patient');
        } catch (dbError) {
          console.error("Failed to auto-create missing profile:", dbError);
          alert("Database Error: Could not verify or create your user profile in Supabase.");
          auth.signOut();
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(`Sign in failed: ${error.message} (${error.code})`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!googleRole) {
      setShowRoleError(true);
      return;
    }
    setShowRoleError(false);
    setLoading(true);

    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        const user = result.user;
        
        // Save to localStorage
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName || 'Google User');
        localStorage.setItem('userUid', user.uid);
        if (user.photoURL) {
          localStorage.setItem('userPhoto', user.photoURL);
        } else {
          localStorage.removeItem('userPhoto');
        }

        try {
          // Check if user exists in our FastAPI/Supabase DB
          const checkResponse = await fetch(`http://localhost:8000/api/users/${user.uid}`);
          
          if (checkResponse.status === 404) {
            let medicalId = null;
            if (googleRole === UserRole.DOCTOR) {
              medicalId = window.prompt("Please enter your Medical ID / Hospital ID to complete doctor registration:");
              if (!medicalId) {
                auth.signOut();
                alert("Registration cancelled. A Medical ID is required for doctors.");
                return;
              }
            }

            const url = new URL('http://localhost:8000/api/users/signup');
            if (googleRole === UserRole.DOCTOR) {
              url.searchParams.append('hospital_id', medicalId);
            }

            const signupResponse = await fetch(url.toString(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                full_name: user.displayName || 'Google User',
                role: googleRole
              })
            });

            if (!signupResponse.ok) {
              throw new Error("Failed to initialize Google user profile on backend");
            }

            alert(`Welcome, ${user.displayName || 'Google User'}! Signed in successfully.`);
            navigate(googleRole === UserRole.DOCTOR ? '/doctor' : '/patient');
          } else if (checkResponse.ok) {
            // User already exists. Verify they are logging into the correct role.
            const existingUser = await checkResponse.json();
            const existingRole = existingUser.role;
            if (existingRole !== googleRole) {
              auth.signOut();
              alert(`Access Denied: Your account is registered as a ${existingRole}. You cannot log in as a ${googleRole} using the same email address.`);
              return; // Stop the login process
            } else {
              alert(`Welcome back, ${user.displayName || 'Google User'}!`);
              navigate(existingRole === UserRole.DOCTOR ? '/doctor' : '/patient');
            }
          } else {
            throw new Error("Could not verify profile from database");
          }
        } catch (dbError) {
          console.error("Error saving/verifying OAuth user to Supabase:", dbError);
          alert("Error verifying profile in database. Please check your connection.");
        }
      })
      .catch((error) => {
        console.error("Firebase OAuth Error:", error);
        // Ignore errors caused by the user closing the popup or concurrent requests
        if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
          alert(`Sign-in failed: ${error.message}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (isSigningUp) {
    return (
      <div className="app-container">
        <Signup onBack={() => setIsSigningUp(false)} />
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
            
            <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing In...' : 'Sign In to CarePulse'}
              {!loading && <ArrowRight size={18} />}
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
                      setGoogleRole(UserRole.DOCTOR);
                      setShowRoleError(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      border: '1.5px solid',
                      borderColor: googleRole === UserRole.DOCTOR ? 'var(--primary)' : '#e2e8f0',
                      background: googleRole === UserRole.DOCTOR ? 'white' : '#f1f5f9',
                      color: googleRole === UserRole.DOCTOR ? 'var(--primary)' : 'var(--text-light)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: googleRole === UserRole.DOCTOR ? '0 4px 8px rgba(14, 165, 233, 0.12)' : 'none'
                    }}
                  >
                    <ShieldCheck size={16} /> Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleRole(UserRole.PATIENT);
                      setShowRoleError(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      border: '1.5px solid',
                      borderColor: googleRole === UserRole.PATIENT ? 'var(--secondary)' : '#e2e8f0',
                      background: googleRole === UserRole.PATIENT ? 'white' : '#f1f5f9',
                      color: googleRole === UserRole.PATIENT ? 'var(--secondary)' : 'var(--text-light)',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: googleRole === UserRole.PATIENT ? '0 4px 8px rgba(16, 185, 129, 0.12)' : 'none'
                    }}
                  >
                    <User size={16} /> Patient
                  </button>
                </div>
                
                <button 
                  type="button"
                  className="btn-social"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: googleRole ? 'white' : '#f8fafc',
                    border: '1px solid',
                    borderColor: googleRole ? '#cbd5e1' : '#e2e8f0',
                    color: googleRole ? 'var(--text-dark)' : 'var(--text-light)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: googleRole ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
                    opacity: loading ? 0.7 : 1
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
            <a href="#" onClick={(e) => { e.preventDefault(); setIsSigningUp(true); }}>
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
