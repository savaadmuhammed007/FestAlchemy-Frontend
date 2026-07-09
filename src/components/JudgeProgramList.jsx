import React from 'react';
import { Award, Clock, CheckCircle } from 'lucide-react';

export default function JudgeProgramList({ programs, allMarksheets, onSelectProgram }) {
  // Group programs
  const pendingPrograms = [];
  const completedPrograms = [];

  programs.forEach(prog => {
    const progSheets = allMarksheets.filter(m => m.program === prog.id);
    const totalSheets = progSheets.length;
    const submittedSheets = progSheets.filter(m => m.submitted).length;

    const progWithCounts = {
      ...prog,
      total_sheets: totalSheets,
      submitted_sheets: submittedSheets
    };

    if (totalSheets > 0 && submittedSheets === totalSheets) {
      completedPrograms.push(progWithCounts);
    } else {
      pendingPrograms.push(progWithCounts);
    }
  });

  const renderProgramCard = (prog, isCompleted) => {
    return (
      <div 
        key={prog.id} 
        className="glass-panel glass-panel-hover" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          borderColor: isCompleted ? 'rgba(0, 230, 118, 0.15)' : 'var(--border-glass)',
          padding: '1.5rem',
          borderRadius: '16px'
        }}
      >
        <div>
          <span className="tag tag-primary" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
            {prog.category_name}
          </span>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            {prog.name}
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            {prog.total_sheets === 0 ? (
              <span className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                No participants called yet
              </span>
            ) : isCompleted ? (
              <span className="tag tag-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> All {prog.total_sheets} Submitted
              </span>
            ) : (
              <span className="tag tag-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {prog.submitted_sheets} / {prog.total_sheets} Evaluated
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Max Marks: <strong>{prog.max_marks}</strong> | Limit: {prog.participant_limit || 'Unlimited'}
          </p>
        </div>
        <button 
          onClick={() => onSelectProgram(prog, isCompleted)}
          className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} 
          style={{ width: '100%', marginTop: 'auto' }}
        >
          {isCompleted ? 'View Marks' : prog.total_sheets === 0 ? 'Open Evaluations' : 'Mark Participants'}
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Judge Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome back! Select a program below to evaluate called participants.
        </p>
      </div>

      {/* PENDING SECTION */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-display)', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--warning-neon)'
        }}>
          <Clock size={22} /> Pending Evaluations
        </h3>
        {pendingPrograms.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No pending evaluations. Great job!</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {pendingPrograms.map(p => renderProgramCard(p, false))}
          </div>
        )}
      </div>

      {/* COMPLETED SECTION */}
      <div>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-display)', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--success-neon)'
        }}>
          <CheckCircle size={22} /> Finalized Evaluations
        </h3>
        {completedPrograms.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No finalized evaluations yet.</p>
          </div>
        ) : (
          <div className="grid-cols-3">
            {completedPrograms.map(p => renderProgramCard(p, true))}
          </div>
        )}
      </div>
    </div>
  );
}
