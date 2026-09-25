import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export default function LoginGate({ onLogin, onSignUp }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-gate-wrapper">
      <div className="login-gate-card">
        {/* Brand / Enterprise Header */}
        <div className="login-gate-header">
          <div className="login-brand-icon">
            <Shield size={24} />
          </div>
          <h2>Task Management System</h2>
          <p>
            {isSignUp
              ? 'Create a new account to access the task dashboard'
              : 'Enter your credentials to access the Task Management Portal'}
          </p>
        </div>

        {/* Status Telemetry Strip */}
        <div className="login-telemetry-strip">
          <div className="telemetry-item">
            <span className="telemetry-dot online" />
            <span>Database: Connected</span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-dot online" />
            <span>Security: Active</span>
          </div>
        </div>

        {/* Error Feedback Alert */}
        {errorMsg && (
          <div className="login-alert login-alert-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="login-gate-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-tactical btn-tactical-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account & Enter' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="login-gate-footer">
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            {isSignUp
              ? 'Already registered? Click here to Sign In'
              : 'Need a new account? Click here to Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
