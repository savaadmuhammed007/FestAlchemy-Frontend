import React from 'react';
import { ChevronLeft, AlertCircle, CheckCircle, Save, Send } from 'lucide-react';

export default function JudgeEvaluationForm({
  selectedProgram,
  activeMarksheet,
  score,
  setScore,
  submitError,
  submitSuccess,
  submitting,
  onBack,
  onSave
}) {
  const percentage = selectedProgram?.max_marks 
    ? Math.min((parseFloat(score || 0) / selectedProgram.max_marks) * 100, 100) 
    : 0;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        className="btn btn-secondary" 
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
      >
        <ChevronLeft size={16} /> Back to List
      </button>

      <div className="glass-panel" style={{ border: '1px solid var(--primary-neon)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="tag tag-primary" style={{ marginBottom: '0.5rem' }}>{selectedProgram.name}</span>
          
          {/* Impartial Blind Judging: Display Judge Code (Lot Code) instead of participant names */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>EVALUATION PORTAL</h2>
          <div className="scratch-card-reveal" style={{ fontSize: '2rem', padding: '0.8rem 2rem' }}>
            CODE: {activeMarksheet.judge_code}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Blind Judging Mode: Participant names are hidden. Please score based on the assigned performance code.
          </p>
        </div>

        {submitError && (
          <div className="glass-panel" style={{ background: 'rgba(255, 23, 68, 0.1)', borderColor: 'rgba(255, 23, 68, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#ff1744', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="glass-panel" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#00e676', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <CheckCircle size={18} />
            <span>{submitSuccess}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="form-label" htmlFor="score" style={{ margin: 0 }}>
              Enter Score (Max {selectedProgram.max_marks})
            </label>
            {score !== '' && !isNaN(parseFloat(score)) && (
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                {percentage.toFixed(0)}% of Max
              </span>
            )}
          </div>
          
          <input 
            type="number" 
            step="0.1"
            id="score"
            className="form-control" 
            placeholder={`0.0 - ${selectedProgram.max_marks}`}
            value={score}
            onChange={e => setScore(e.target.value)}
            disabled={submitting}
            style={{ fontSize: '1.75rem', padding: '0.75rem', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}
          />

          {/* Interactive Range Slider */}
          <input
            type="range"
            min="0"
            max={selectedProgram.max_marks}
            step="0.1"
            value={score === '' || isNaN(parseFloat(score)) ? 0 : score}
            onChange={e => setScore(e.target.value)}
            disabled={submitting}
            className="score-slider"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percentage}%, var(--bg-hover) ${percentage}%, var(--bg-hover) 100%)`
            }}
          />

          {/* Quick Snap Points */}
          <div style={{ marginTop: '0.5rem' }}>
            <span className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.4rem', display: 'block' }}>
              Quick Snap Milestones:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['50%', '75%', '90%', '100%'].map(label => {
                const pct = parseInt(label) / 100;
                const snapVal = (selectedProgram.max_marks * pct).toFixed(1);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setScore(snapVal)}
                    disabled={submitting}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}
                  >
                    {label} ({snapVal})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            onClick={() => onSave(false)}
            className="btn btn-secondary" 
            style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={submitting}
          >
            <Save size={18} /> Save Draft
          </button>
          <button 
            onClick={() => onSave(true)}
            className="btn btn-primary" 
            style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={submitting}
          >
            <Send size={18} /> Finalize Submit
          </button>
        </div>
      </div>
    </div>
  );
}
