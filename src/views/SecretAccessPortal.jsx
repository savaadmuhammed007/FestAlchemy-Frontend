import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccessControl } from '../context/AccessControlContext';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Settings, 
  LayoutDashboard, 
  Globe, 
  Sliders,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export default function SecretAccessPortal() {
  const { isUnlocked, unlock, lock, masterPasscode, updatePasscode, whatsappContact } = useAccessControl();
  const navigate = useNavigate();

  const [passcode, setPasscode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [phoneInput, setPhoneInput] = useState(whatsappContact.phone || '');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSettings, setShowSettings] = useState(false);

  const handleUnlock = (e) => {
    e?.preventDefault();
    const res = unlock(passcode);
    if (res.success) {
      setMessage({ text: 'Access Granted! System unlocked for this browser.', type: 'success' });
    } else {
      setMessage({ text: res.error || 'Incorrect passcode', type: 'error' });
    }
  };

  const handleQuickUnlock = () => {
    unlock(masterPasscode);
    setMessage({ text: '⚡ Instant Operator Access Granted!', type: 'success' });
  };

  const handleLock = () => {
    lock();
    setMessage({ text: '🔒 System locked. All URLs will now show Access Denied.', type: 'info' });
  };

  const handleUpdateCode = (e) => {
    e.preventDefault();
    if (updatePasscode(newCode)) {
      setMessage({ text: `Passcode successfully updated to: ${newCode}`, type: 'success' });
      setNewCode('');
    } else {
      setMessage({ text: 'Passcode must be at least 4 characters.', type: 'error' });
    }
  };

  const handleSavePhone = (e) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 7) {
      whatsappContact.phone = cleanPhone;
      localStorage.setItem('fa_whatsapp_phone', cleanPhone);
      setMessage({ text: `WhatsApp contact number updated to: +${cleanPhone}`, type: 'success' });
    } else {
      setMessage({ text: 'Please enter a valid phone number with country code (e.g. 919876543210)', type: 'error' });
    }
  };

  return (
    <div className="secret-portal-wrapper">
      <div className="sp-bg-elements">
        <div className="sp-glow-circle sp-glow-circle--1" />
        <div className="sp-glow-circle sp-glow-circle--2" />
        <div className="sp-grid" />
      </div>

      <div className="sp-container">
        {/* Header */}
        <div className="sp-header">
          <div className="sp-badge">
            <Sparkles size={14} style={{ color: '#fbbf24' }} />
            <span>OPERATOR MASTER GATEWAY</span>
          </div>
          <h1 className="sp-title">Private Owner Portal</h1>
          <p className="sp-subtitle">
            This private URL allows you to toggle system access lockdown and enter all festival dashboards.
          </p>
        </div>

        {/* Status Card */}
        <div className={`sp-card sp-status-card ${isUnlocked ? 'sp-status-card--unlocked' : 'sp-status-card--locked'}`}>
          <div className="sp-status-left">
            <div className="sp-status-icon-wrap">
              {isUnlocked ? (
                <Unlock size={28} className="sp-status-icon-unlocked" />
              ) : (
                <Lock size={28} className="sp-status-icon-locked" />
              )}
            </div>
            <div>
              <div className="sp-status-label">CURRENT SYSTEM STATE</div>
              <div className="sp-status-heading">
                {isUnlocked ? 'UNLOCKED · Full Access Active' : 'LOCKED · Access Denied Gate Active'}
              </div>
              <div className="sp-status-desc">
                {isUnlocked 
                  ? 'All public and admin URLs are accessible on this browser.'
                  : 'Visitors on all routes are redirected to the Access Denied page.'}
              </div>
            </div>
          </div>

          <div className="sp-status-actions">
            {isUnlocked ? (
              <button onClick={handleLock} className="btn-sp-lock">
                <Lock size={15} /> Lock System Now
              </button>
            ) : (
              <button onClick={handleQuickUnlock} className="btn-sp-quick-unlock">
                <Unlock size={15} /> Instant Unlock
              </button>
            )}
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`sp-alert sp-alert--${message.type}`}>
            {message.type === 'success' && <CheckCircle2 size={16} />}
            {message.type === 'error' && <AlertTriangle size={16} />}
            {message.type === 'info' && <Lock size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="sp-grid-layout">
          {/* Unlock / Authenticate Section */}
          {!isUnlocked && (
            <div className="sp-card sp-form-card">
              <h3 className="sp-card-title">
                <Key size={18} style={{ color: '#818cf8' }} /> Enter Master Passcode
              </h3>
              <p className="sp-card-sub">
                Enter your owner passcode to unlock full access across all routes.
              </p>

              <form onSubmit={handleUnlock} className="sp-form">
                <div className="sp-field">
                  <label>MASTER PASSCODE</label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter owner master code"
                    className="sp-input"
                    autoFocus
                  />
                </div>

                <div className="sp-form-row">
                  <button type="submit" className="btn-sp-primary">
                    <Unlock size={16} /> Authenticate & Unlock
                  </button>
                  <button type="button" onClick={handleQuickUnlock} className="btn-sp-secondary">
                    ⚡ 1-Click Bypass
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Navigation Portal (When Unlocked or Quick Jump) */}
          <div className="sp-card sp-nav-card">
            <h3 className="sp-card-title">
              <LayoutDashboard size={18} style={{ color: '#38bdf8' }} /> Direct Page Shortcuts
            </h3>
            <p className="sp-card-sub">
              Quickly jump into any portal once unlocked:
            </p>

            <div className="sp-links-list">
              <Link to="/ilalhabeeb" className="sp-nav-btn">
                <div className="sp-nav-btn-info">
                  <Globe size={18} style={{ color: '#818cf8' }} />
                  <div>
                    <strong>Main Festival Portal</strong>
                    <span>/ilalhabeeb</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/login" className="sp-nav-btn">
                <div className="sp-nav-btn-info">
                  <ShieldCheck size={18} style={{ color: '#f59e0b' }} />
                  <div>
                    <strong>Login Screen</strong>
                    <span>/login</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/admin" className="sp-nav-btn">
                <div className="sp-nav-btn-info">
                  <Sliders size={18} style={{ color: '#ef4444' }} />
                  <div>
                    <strong>Admin Control Room</strong>
                    <span>/admin</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/results" className="sp-nav-btn">
                <div className="sp-nav-btn-info">
                  <Sparkles size={18} style={{ color: '#22c55e' }} />
                  <div>
                    <strong>Results & Publishing</strong>
                    <span>/results</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </Link>

              <Link to="/demo" className="sp-nav-btn">
                <div className="sp-nav-btn-info">
                  <Sparkles size={18} style={{ color: '#ec4899' }} />
                  <div>
                    <strong>Product Interactive Demo</strong>
                    <span>/demo</span>
                  </div>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* WhatsApp & Passcode Settings Toggle */}
        <div className="sp-card sp-settings-card">
          <div className="sp-settings-header" onClick={() => setShowSettings(!showSettings)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Settings size={18} style={{ color: '#94a3b8' }} />
              <div>
                <strong style={{ color: '#f1f5f9' }}>Access Control Configuration</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure WhatsApp number & Master Passcode</div>
              </div>
            </div>
            <button type="button" className="btn-sp-toggle-settings">
              {showSettings ? 'Hide Settings' : 'Edit Settings'}
            </button>
          </div>

          {showSettings && (
            <div className="sp-settings-body">
              {/* WhatsApp Config */}
              <form onSubmit={handleSavePhone} className="sp-config-block">
                <h4>
                  <MessageCircle size={16} style={{ color: '#25D366' }} /> WhatsApp Contact Button Target
                </h4>
                <p>Change the phone number linked to the WhatsApp button on the Access Denied page.</p>
                <div className="sp-config-row">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter phone with country code (e.g. 919995000000)"
                    className="sp-input"
                  />
                  <button type="submit" className="btn-sp-save">Save Number</button>
                </div>
                <div className="sp-hint">
                  Current target URL: <a href={whatsappContact.url} target="_blank" rel="noreferrer" style={{ color: '#86efac' }}>{whatsappContact.url}</a>
                </div>
              </form>

              <hr className="sp-divider" />

              {/* Passcode Config */}
              <form onSubmit={handleUpdateCode} className="sp-config-block">
                <h4>
                  <Key size={16} style={{ color: '#818cf8' }} /> Change Master Passcode
                </h4>
                <p>Update the master passcode required to bypass the lockdown.</p>
                <div className="sp-config-row">
                  <input
                    type="password"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Enter new master passcode"
                    className="sp-input"
                  />
                  <button type="submit" className="btn-sp-save">Update Code</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Back Link */}
        <div className="sp-footer">
          <Link to="/access-denied" className="sp-footer-link">
            &larr; View Public Access Denied Page
          </Link>
        </div>
      </div>

      <style>{`
        .secret-portal-wrapper {
          min-height: 100vh;
          width: 100%;
          background: #0b0d14;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 3rem 1.5rem;
          box-sizing: border-box;
          position: relative;
          overflow-x: hidden;
        }

        .sp-bg-elements {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .sp-glow-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.2;
        }

        .sp-glow-circle--1 {
          width: 500px;
          height: 500px;
          background: #6366f1;
          top: -100px;
          left: -100px;
        }

        .sp-glow-circle--2 {
          width: 450px;
          height: 450px;
          background: #38bdf8;
          bottom: -80px;
          right: -80px;
        }

        .sp-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .sp-container {
          position: relative;
          z-index: 1;
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .sp-header {
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .sp-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.25);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 0.85rem;
        }

        .sp-title {
          font-size: 2.4rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sp-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .sp-card {
          background: rgba(18, 22, 34, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 1.8rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .sp-status-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .sp-status-card--unlocked {
          border-color: rgba(34, 197, 94, 0.35);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(18, 22, 34, 0.85));
        }

        .sp-status-card--locked {
          border-color: rgba(239, 68, 68, 0.35);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(18, 22, 34, 0.85));
        }

        .sp-status-left {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .sp-status-icon-wrap {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sp-status-card--unlocked .sp-status-icon-wrap {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.35);
        }

        .sp-status-card--locked .sp-status-icon-wrap {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
        }

        .sp-status-icon-unlocked {
          color: #4ade80;
        }

        .sp-status-icon-locked {
          color: #f87171;
        }

        .sp-status-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #64748b;
        }

        .sp-status-heading {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 2px 0 4px 0;
        }

        .sp-status-desc {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .btn-sp-lock {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          padding: 0.65rem 1.2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-sp-lock:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .btn-sp-quick-unlock {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: #000000;
          padding: 0.7rem 1.4rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
          transition: all 0.2s;
        }

        .btn-sp-quick-unlock:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .sp-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.2rem;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .sp-alert--success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .sp-alert--error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .sp-alert--info {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #c7d2fe;
        }

        .sp-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .sp-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.4rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sp-card-sub {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0 0 1.25rem 0;
        }

        .sp-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sp-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .sp-field label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .sp-input {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.92rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .sp-input:focus {
          border-color: #6366f1;
        }

        .sp-form-row {
          display: flex;
          gap: 0.75rem;
        }

        .btn-sp-primary {
          flex: 2;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          color: #ffffff;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          transition: all 0.2s;
        }

        .btn-sp-primary:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-1px);
        }

        .btn-sp-secondary {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-sp-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .sp-links-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .sp-nav-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 0.75rem 1rem;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.2s;
        }

        .sp-nav-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateX(3px);
        }

        .sp-nav-btn-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .sp-nav-btn-info div {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .sp-nav-btn-info strong {
          font-size: 0.88rem;
          color: #f1f5f9;
        }

        .sp-nav-btn-info span {
          font-size: 0.74rem;
          color: #64748b;
        }

        .sp-settings-card {
          padding: 1.25rem 1.5rem;
        }

        .sp-settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .btn-sp-toggle-settings {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .sp-settings-body {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .sp-config-block h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .sp-config-block p {
          margin: 0 0 0.75rem 0;
          font-size: 0.82rem;
          color: #94a3b8;
        }

        .sp-config-row {
          display: flex;
          gap: 0.75rem;
        }

        .sp-config-row .sp-input {
          flex: 1;
        }

        .btn-sp-save {
          background: #6366f1;
          border: none;
          color: #ffffff;
          padding: 0.75rem 1.2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .sp-hint {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.45rem;
          word-break: break-all;
        }

        .sp-divider {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          margin: 0;
        }

        .sp-footer {
          text-align: center;
          margin-top: 1rem;
        }

        .sp-footer-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s;
        }

        .sp-footer-link:hover {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
