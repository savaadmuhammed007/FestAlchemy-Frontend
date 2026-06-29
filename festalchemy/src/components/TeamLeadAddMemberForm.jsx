import React from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';

export default function TeamLeadAddMemberForm({
  memberName,
  setMemberName,
  memberCategory,
  setMemberCategory,
  categories,
  availablePrograms,
  selectedPrograms,
  onCheckboxChange,
  onSubmit,
  onBack,
  submitting
}) {
  const generalCat = categories.find(c => c.name?.toLowerCase() === 'general');
  const generalCatId = generalCat ? generalCat.id : null;

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
        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Add Member</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter full name" 
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-control" 
              value={memberCategory} 
              onChange={e => setMemberCategory(e.target.value)}
              disabled={submitting}
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} (Prefix: {c.chest_prefix})</option>
              ))}
            </select>
          </div>

          {/* Show events available to register under the selected category */}
          {memberCategory && (
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Events to Register</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                {availablePrograms
                  .filter(p => p.category_id === parseInt(memberCategory) || p.category_id === generalCatId)
                  .map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: p.has_available_slot ? 'pointer' : 'not-allowed', color: p.has_available_slot ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedPrograms.includes(p.id)}
                        onChange={() => onCheckboxChange(p.id)}
                        disabled={submitting || !p.has_available_slot}
                        style={{ width: '18px', height: '18px', cursor: p.has_available_slot ? 'pointer' : 'not-allowed' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.8 }}>
                          ({p.type} | limit: {p.participant_limit || 'unlimited'})
                        </span>
                        {!p.has_available_slot && (
                          <span style={{ color: 'var(--danger-neon)', fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                            (Limit Reached)
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                {availablePrograms.filter(p => p.category_id === parseInt(memberCategory) || p.category_id === generalCatId).length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem' }}>No events found for this category.</p>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
            {submitting ? <RefreshCw className="spinning" size={18} /> : "Save Member & Assign Chest No"}
          </button>
        </form>
      </div>
    </div>
  );
}
