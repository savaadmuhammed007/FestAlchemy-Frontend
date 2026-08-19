import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccessControl } from '../context/AccessControlContext';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  MessageCircle, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Sparkles,
  AlertOctagon,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AccessDeniedPage() {
  const { unlock, whatsappContact, isUnlocked } = useAccessControl();
  const navigate = useNavigate();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // If already unlocked, provide a button to enter
  const handleEnterApp = () => {
    navigate('/ilalhabeeb');
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const result = unlock(passcode);
    if (result.success) {
      setSuccessMsg('Access Authorized! Initializing portal...');
      setTimeout(() => {
        navigate('/ilalhabeeb');
      }, 1000);
    } else {
      setErrorMsg(result.error || 'Invalid master passcode');
    }
  };

  return (
    <div className="access-denied-wrapper">
      {/* Background ambient lighting effects */}
      <div className="ad-bg-mesh">
        <div className="ad-glow-orb ad-glow-orb--crimson" />
        <div className="ad-glow-orb ad-glow-orb--indigo" />
        <div className="ad-grid-overlay" />
      </div>

      <div className="ad-container">
        {/* Top Header / Brand */}
        <div className="ad-brand-row">
          <div className="ad-brand-badge">
            <img src="/logo.png" alt="FestAlchemy" className="ad-logo" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="ad-brand-name">FestAlchemy</span>
            <span className="ad-status-pill">
              <span className="ad-status-dot" /> LOCKED
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="ad-card">
          {/* Security Icon Box */}
          <div className="ad-icon-box">
            <div className="ad-icon-pulse" />
            <ShieldAlert size={42} className="ad-icon-svg" />
          </div>

          <div className="ad-code-badge">
            <AlertOctagon size={13} />
            <span>HTTP 403 · FORBIDDEN ACCESS</span>
          </div>

          <h1 className="ad-title">
            Access <span className="ad-title-highlight">Denied</span>
          </h1>

          <p className="ad-description">
            This festival portal is currently restricted and in private lockdown mode. 
            Public browsing has been temporarily paused by the festival management.
          </p>

          {/* Quick status if already authorized */}
          {isUnlocked && (
            <div className="ad-already-unlocked-box">
              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              <span>You have active owner credentials unlocked on this browser.</span>
              <button onClick={handleEnterApp} className="btn-ad-enter">
                Enter Festival <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* WhatsApp Contact Section */}
          <div className="ad-contact-section">
            <div className="ad-contact-label">
              <span>Need clearance or festival information?</span>
            </div>

            <a
              href={whatsappContact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-whatsapp-btn"
            >
              <div className="ad-wa-icon-wrap">
                <MessageCircle size={20} className="ad-wa-icon" />
              </div>
              <div className="ad-wa-text-wrap">
                <span className="ad-wa-title">Contact Administrator on WhatsApp</span>
                <span className="ad-wa-sub">Click to send direct message & request access</span>
              </div>
              <ExternalLink size={16} className="ad-wa-arrow" />
            </a>
          </div>

          {/* System Terminal Specs Card */}
          <div className="ad-terminal-card">
            <div className="ad-terminal-header">
              <div className="ad-terminal-dots">
                <span className="ad-dot ad-dot--red" />
                <span className="ad-dot ad-dot--yellow" />
                <span className="ad-dot ad-dot--green" />
              </div>
              <span className="ad-terminal-title">
                <Terminal size={12} /> SEC-GATE // GATEWAY-LOCK
              </span>
            </div>
            <div className="ad-terminal-body">
              <div className="ad-term-row">
                <span className="ad-term-key">TIMESTAMP:</span>
                <span className="ad-term-val">{currentTime}</span>
              </div>
              <div className="ad-term-row">
                <span className="ad-term-key">STATUS:</span>
                <span className="ad-term-val ad-term-val--denied">RESTRICTED_ACCESS_ONLY</span>
              </div>
              <div className="ad-term-row">
                <span className="ad-term-key">SECURITY CLEARANCE:</span>
                <span className="ad-term-val">OPERATOR_LEVEL_4</span>
              </div>
              <div className="ad-term-row">
                <span className="ad-term-key">ENCRYPTION:</span>
                <span className="ad-term-val">FESTALCH-TLS1.3-ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Operator / Staff Entrance Buttons */}
          <div className="ad-footer-actions">
            <button 
              onClick={() => setShowUnlockModal(true)} 
              className="ad-operator-btn"
            >
              <KeyRound size={14} />
              <span>Staff / Owner Unlock Passcode</span>
            </button>

            <Link to="/secret-access" className="ad-secret-link">
              <Lock size={12} />
              <span>Private Operator Gateway</span>
            </Link>
          </div>
        </div>

        {/* Subtle footer */}
        <div className="ad-page-footer">
          <span>&copy; {new Date().getFullYear()} FestAlchemy · All rights reserved. Secure Event Gateway.</span>
        </div>
      </div>

      {/* Interactive Passcode Modal */}
      {showUnlockModal && (
        <div className="ad-modal-backdrop" onClick={() => setShowUnlockModal(false)}>
          <div className="ad-modal-box" onClick={(e) => e.stopPropagation()}>
            <button 
              className="ad-modal-close" 
              onClick={() => setShowUnlockModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="ad-modal-header">
              <div className="ad-modal-icon">
                <Lock size={22} style={{ color: '#818cf8' }} />
              </div>
              <div>
                <h3 className="ad-modal-title">Master Passcode Clearance</h3>
                <p className="ad-modal-sub">Enter system owner master code to unlock all routes</p>
              </div>
            </div>

            <form onSubmit={handleUnlockSubmit} className="ad-modal-form">
              <div className="ad-input-group">
                <label className="ad-input-label">OPERATOR PASSCODE</label>
                <div className="ad-input-wrap">
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter operator passcode"
                    className="ad-input-field"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="ad-eye-btn"
                    tabIndex={-1}
                  >
                    {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="ad-modal-error">
                  <AlertOctagon size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="ad-modal-success">
                  <CheckCircle2 size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="ad-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="btn-ad-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-ad-submit"
                >
                  <Sparkles size={14} />
                  <span>Authenticate & Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded CSS for Access Denied View */}
      <style>{`
        .access-denied-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #090a0f;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 2rem 1rem;
          box-sizing: border-box;
          overflow: hidden;
        }

        .ad-bg-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .ad-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
        }

        .ad-glow-orb--crimson {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #ef4444 0%, rgba(239, 68, 68, 0) 70%);
          top: -100px;
          right: -80px;
          animation: floatOrb 12s ease-in-out infinite alternate;
        }

        .ad-glow-orb--indigo {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
          bottom: -120px;
          left: -100px;
          animation: floatOrb 14s ease-in-out infinite alternate-reverse;
        }

        .ad-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.1); }
        }

        .ad-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .ad-brand-row {
          display: flex;
          justify-content: center;
        }

        .ad-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(12px);
          padding: 0.45rem 1rem;
          border-radius: 9999px;
        }

        .ad-logo {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          object-fit: cover;
        }

        .ad-brand-name {
          font-weight: 700;
          font-size: 0.95rem;
          background: linear-gradient(135deg, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .ad-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
        }

        .ad-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .ad-card {
          width: 100%;
          background: rgba(18, 20, 29, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem 2.2rem;
          backdrop-filter: blur(24px);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        .ad-icon-box {
          position: relative;
          width: 84px;
          height: 84px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(99, 102, 241, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .ad-icon-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 28px;
          background: rgba(239, 68, 68, 0.2);
          filter: blur(8px);
          z-index: -1;
          animation: iconGlow 3s ease-in-out infinite alternate;
        }

        @keyframes iconGlow {
          0% { opacity: 0.4; transform: scale(0.96); }
          100% { opacity: 0.9; transform: scale(1.05); }
        }

        .ad-icon-svg {
          color: #f87171;
          filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.5));
        }

        .ad-code-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #f87171;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.3rem 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        .ad-title {
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0 0 0.75rem 0;
          color: #ffffff;
        }

        .ad-title-highlight {
          background: linear-gradient(135deg, #ef4444, #f43f5e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ad-description {
          color: #94a3b8;
          font-size: 0.96rem;
          line-height: 1.55;
          margin: 0 0 1.75rem 0;
          max-width: 480px;
        }

        .ad-already-unlocked-box {
          width: 100%;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: #bbf7d0;
        }

        .btn-ad-enter {
          background: #22c55e;
          color: #000000;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.2s ease;
        }

        .btn-ad-enter:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        /* WhatsApp Contact Banner */
        .ad-contact-section {
          width: 100%;
          margin-bottom: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ad-contact-label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
          text-align: left;
        }

        .ad-whatsapp-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(18, 140, 126, 0.15));
          border: 1px solid rgba(37, 211, 102, 0.35);
          border-radius: 16px;
          padding: 0.9rem 1.2rem;
          color: #ffffff;
          text-decoration: none;
          box-sizing: border-box;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.1);
        }

        .ad-whatsapp-btn:hover {
          background: linear-gradient(135deg, rgba(37, 211, 102, 0.25), rgba(18, 140, 126, 0.25));
          border-color: rgba(37, 211, 102, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37, 211, 102, 0.22);
        }

        .ad-wa-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: 0 0 16px rgba(37, 211, 102, 0.5);
        }

        .ad-wa-text-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .ad-wa-title {
          font-weight: 700;
          font-size: 0.96rem;
          color: #ffffff;
        }

        .ad-wa-sub {
          font-size: 0.78rem;
          color: #86efac;
          margin-top: 2px;
        }

        .ad-wa-arrow {
          color: #86efac;
          opacity: 0.8;
          transition: transform 0.2s;
        }

        .ad-whatsapp-btn:hover .ad-wa-arrow {
          transform: translate(2px, -2px);
          opacity: 1;
        }

        /* Terminal card */
        .ad-terminal-card {
          width: 100%;
          background: rgba(10, 12, 18, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 0.9rem 1.1rem;
          margin-bottom: 1.5rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace, Consolas;
          box-sizing: border-box;
          text-align: left;
        }

        .ad-terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.45rem;
          margin-bottom: 0.65rem;
        }

        .ad-terminal-dots {
          display: flex;
          gap: 0.35rem;
        }

        .ad-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .ad-dot--red { background: #ef4444; }
        .ad-dot--yellow { background: #f59e0b; }
        .ad-dot--green { background: #22c55e; }

        .ad-terminal-title {
          font-size: 0.68rem;
          color: #64748b;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .ad-terminal-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .ad-term-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.73rem;
        }

        .ad-term-key {
          color: #64748b;
        }

        .ad-term-val {
          color: #cbd5e1;
        }

        .ad-term-val--denied {
          color: #f87171;
          font-weight: 700;
        }

        /* Footer buttons */
        .ad-footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .ad-operator-btn {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #a5b4fc;
          padding: 0.5rem 0.9rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: all 0.2s ease;
        }

        .ad-operator-btn:hover {
          background: rgba(99, 102, 241, 0.22);
          color: #ffffff;
          border-color: rgba(99, 102, 241, 0.5);
        }

        .ad-secret-link {
          color: #64748b;
          text-decoration: none;
          font-size: 0.76rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: color 0.2s ease;
        }

        .ad-secret-link:hover {
          color: #94a3b8;
          text-decoration: underline;
        }

        .ad-page-footer {
          font-size: 0.75rem;
          color: #475569;
          text-align: center;
        }

        /* Passcode Modal */
        .ad-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
        }

        .ad-modal-box {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: #131722;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 1.8rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(99, 102, 241, 0.15);
          animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.94) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .ad-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ad-modal-close:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .ad-modal-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.4rem;
        }

        .ad-modal-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ad-modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .ad-modal-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 3px 0 0 0;
        }

        .ad-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ad-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          text-align: left;
        }

        .ad-input-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .ad-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ad-input-field {
          width: 100%;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ad-input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }

        .ad-eye-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          display: flex;
        }

        .ad-eye-btn:hover {
          color: #cbd5e1;
        }

        .ad-modal-error {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          font-size: 0.8rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
        }

        .ad-modal-success {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #86efac;
          font-size: 0.8rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
        }

        .ad-modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-ad-cancel {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 0.7rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-ad-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-ad-submit {
          flex: 2;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border: none;
          color: #ffffff;
          padding: 0.7rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          transition: all 0.2s;
        }

        .btn-ad-submit:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-1px);
        }

        .ad-modal-hint {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
        }

        .ad-modal-hint code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: #a5b4fc;
        }

        @media (max-width: 480px) {
          .ad-card {
            padding: 1.8rem 1.3rem;
          }
          .ad-title {
            font-size: 1.8rem;
          }
          .ad-footer-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          .ad-operator-btn, .ad-secret-link {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
