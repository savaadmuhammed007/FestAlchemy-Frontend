import React from 'react';
import { FileText, Award, Users, ClipboardList, Clock, Medal, Shuffle } from 'lucide-react';

export default function ReportSelector({ onNavigate }) {
  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} style={{ color: 'var(--primary-neon)' }} /> Reports Center
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Official festival reports, calling sheets, and participant signature verification documents
          </p>
        </div>
        <button 
          onClick={() => onNavigate('/admin/reports/lots')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
        >
          <Shuffle size={16} /> Print Spinned Lots (Sign Sheet)
        </button>
      </div>
      
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

        {/* Top Performers Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/performers')}
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
            <Medal size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Top Performers</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Individual leaderboard by category</p>
          </div>
        </div>

        {/* Fest Schedule Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/schedule')}
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
            <Clock size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>Fest Schedule</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Printable schedules grouped by day</p>
          </div>
        </div>

        {/* Spinned Lots Card */}
        <div 
          onClick={() => onNavigate('/admin/reports/lots')}
          style={{
            cursor: 'pointer',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1.5px solid var(--primary-neon)',
            background: 'rgba(99, 102, 241, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
            transition: 'all 0.2s ease-in-out'
          }}
          className="report-card-hover"
        >
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '2px 7px',
            borderRadius: '10px',
            background: 'var(--primary-neon)',
            color: '#fff'
          }}>
            Ready to Print & Sign
          </span>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-neon)',
            transition: 'background 0.2s'
          }}>
            <Shuffle size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Spinned Lots</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Printable lot call sheets with candidate sign column</p>
          </div>
        </div>
      </div>
    </div>
  );
}
