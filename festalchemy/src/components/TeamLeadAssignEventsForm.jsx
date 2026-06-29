import React from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';

export default function TeamLeadAssignEventsForm({
  selectedMember,
  availablePrograms,
  selectedPrograms,
  onCheckboxChange,
  onSubmit,
  onBack,
  submitting
}) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        className="btn btn-secondary" 
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
      >
        <ChevronLeft size={16} /> Back
      </button>
      
      <div className="glass-panel">
        <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Manage Registrations</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Member: <strong>{selectedMember?.name}</strong> | Category: <span className="tag tag-primary">{selectedMember?.category_name}</span>
        </p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Programs</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
              {availablePrograms.map(p => {
                const isAlreadyRegistered = selectedMember?.registered_programs.includes(p.id);
                const canRegister = p.has_available_slot || isAlreadyRegistered;
                
                return (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: canRegister ? 'pointer' : 'not-allowed', color: canRegister ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedPrograms.includes(p.id)}
                      onChange={() => onCheckboxChange(p.id)}
                      disabled={submitting || !canRegister}
                      style={{ width: '18px', height: '18px', cursor: canRegister ? 'pointer' : 'not-allowed' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.8 }}>
                        ({p.type} | limit: {p.participant_limit || 'unlimited'})
                      </span>
                      {!canRegister && (
                        <span style={{ color: 'var(--danger-neon)', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                          (Limit Reached)
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
              {availablePrograms.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem' }}>No events found for this category.</p>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? <RefreshCw className="spinning" size={18} /> : "Update Registrations"}
          </button>
        </form>
      </div>
    </div>
  );
}
