import React from 'react';
import { FileText, Award, Users, ClipboardList } from 'lucide-react';

export default function ReportSelector({ onNavigate }) {
  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileText size={18} /> Reports Center
      </h3>
      
      <label className="form-label" style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Select a Report to Open</label>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.5rem' 
      }}>
        {/* Event Results Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/results')}
          style={{
            cursor: 'pointer',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          className="report-card-hover"
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            transition: 'background 0.2s'
          }}>
            <Award size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Event Results</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View rankings and scores by event</p>
          </div>
        </div>

        {/* Members List Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/members')}
          style={{
            cursor: 'pointer',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          className="report-card-hover"
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            transition: 'background 0.2s'
          }}>
            <Users size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Members List</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Participant details and team logs</p>
          </div>
        </div>

        {/* Marksheets Status Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/marksheets')}
          style={{
            cursor: 'pointer',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          className="report-card-hover"
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            transition: 'background 0.2s'
          }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Marksheets Status</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Track judge entry submissions</p>
          </div>
        </div>

        {/* Team Standings Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/teampoints')}
          style={{
            cursor: 'pointer',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
            background: 'var(--bg-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            transition: 'all 0.2s ease-in-out'
          }}
          className="report-card-hover"
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            transition: 'background 0.2s'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Team Standings</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall scoreboards and standings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
