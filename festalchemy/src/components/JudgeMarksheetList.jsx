import React from 'react';
import { ChevronLeft, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function JudgeMarksheetList({
  selectedProgram,
  marksheets,
  evalLoading,
  isViewingCompleted,
  onBack,
  onOpenEvaluate
}) {
  const pendingSheets = marksheets
    .filter(s => !s.submitted)
    .sort((a, b) => (a.judge_code || '').localeCompare(b.judge_code || '', undefined, { numeric: true, sensitivity: 'base' }));
  const submittedSheets = isViewingCompleted
    ? marksheets
        .filter(s => s.submitted)
        .sort((a, b) => (a.judge_code || '').localeCompare(b.judge_code || '', undefined, { numeric: true, sensitivity: 'base' }))
    : [];

  const hasPending = pendingSheets.length > 0;
  const hasSubmitted = submittedSheets.length > 0;

  // Determine grid layout based on which sections contain items
  const showTwoColumns = hasPending && hasSubmitted;

  return (
    <div>
      <button 
        onClick={onBack} 
        className="btn btn-secondary" 
        style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
      >
        <ChevronLeft size={16} /> Back to Programs
      </button>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{selectedProgram.name} Evaluation</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Category: <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>{selectedProgram.category_name}</span> | 
          Max Marks: <strong>{selectedProgram.max_marks}</strong>
        </p>
      </div>

      {evalLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <RefreshCw className="spinning" size={30} style={{ color: 'var(--primary-neon)' }} />
        </div>
      ) : (
        <div className={showTwoColumns ? "grid-cols-2" : ""} style={showTwoColumns ? {} : { maxWidth: '600px', margin: '0 auto' }}>
          
          {/* PENDING SHEETS */}
          {hasPending && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning-neon)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} /> Pending Evaluations ({pendingSheets.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingSheets.map(sheet => (
                  <div 
                    key={sheet.id} 
                    className="glass-panel animate-fade-in" 
                    style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                        CODE: {sheet.judge_code}
                      </h4>
                      {sheet.score !== undefined && sheet.score !== null && sheet.score !== 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Draft Score: <strong style={{ color: 'var(--secondary-neon)' }}>{sheet.score}</strong>
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => onOpenEvaluate(sheet)}
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
                    >
                      Evaluate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED SHEETS */}
          {hasSubmitted && (
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--success-neon)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} /> Submitted Evaluations ({submittedSheets.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submittedSheets.map(sheet => (
                  <div 
                    key={sheet.id} 
                    className="glass-panel animate-fade-in" 
                    style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(0, 230, 118, 0.15)' }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                        CODE: {sheet.judge_code}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--success-neon)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                        Score: {sheet.score}
                      </p>
                    </div>
                    <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>Submitted</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NO MARKSHEETS AT ALL */}
          {!hasPending && !hasSubmitted && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'inline-block' }} />
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No evaluations generated yet. Wait for Admin to call lot codes.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
