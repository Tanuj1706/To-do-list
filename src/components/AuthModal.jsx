import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, Database, KeyRound, AlertCircle } from 'lucide-react';
import { isConfigured } from '../lib/supabase';

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  onUseDemo
}) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUpMode) {
        await onSignUp(email, password);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-hud-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{isSignUpMode ? 'CREATE OPERATOR ACCOUNT' : 'SECURITY CHECKPOINT // LOGIN'}</h2>
            <p>{isConfigured ? 'CONNECTED TO SUPABASE DATABASE' : 'OFFLINE DEMO ENVIRONMENT ACTIVE'}</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.65rem 0.85rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fca5a5', fontSize: '0.78rem' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Operator Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.25rem' }}
                  placeholder="engineer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
                <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Access Code / Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.25rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-tactical btn-tactical-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <KeyRound size={14} />
              <span>{loading ? 'PROCESSING AUTH...' : (isSignUpMode ? 'REGISTER ACCOUNT' : 'AUTHENTICATE & ENTER')}</span>
            </button>

            {/* Toggle Sign Up / Login */}
            <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setErrorMsg('');
                }}
              >
                {isSignUpMode ? 'Already have an account? Sign In' : 'Need a new account? Register here'}
              </button>
            </div>

            {/* 1-Click Offline Demo Button */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>
                INSTANT ACCESS OPTION
              </div>
              <button
                type="button"
                className="btn-tactical btn-tactical-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  onUseDemo();
                  onClose();
                }}
              >
                <ShieldCheck size={14} color="#e59500" />
                <span>TRY DEMO MODE (INSTANT LOCAL ACCESS)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
