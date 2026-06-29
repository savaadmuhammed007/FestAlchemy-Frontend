import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            textTransform: 'capitalize',
            color: 'var(--text-primary)',
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-md)', width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
