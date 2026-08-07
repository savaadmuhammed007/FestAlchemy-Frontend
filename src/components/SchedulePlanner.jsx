import { useState } from 'react';
import { Clock, Trash2, Filter } from 'lucide-react';

export default function SchedulePlanner({ programs, stages = [], onOpenScheduleEdit, onOpenAutoSchedule, onResetSchedule }) {
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');

  // Derive unique stage list from stages prop or programs
  const availableStageNames = Array.from(new Set([
    ...stages.map(s => s.name),
    ...programs.map(p => p.venue).filter(Boolean)
  ]));

  const filteredPrograms = programs.filter(p => {
    if (selectedStageFilter === 'ALL') return true;
    if (selectedStageFilter === 'UNASSIGNED') return !p.venue;
    return p.venue === selectedStageFilter;
  });

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--primary-neon)' }} /> Schedule & Venue Planner
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={onResetSchedule} 
            className="btn" 
            style={{ 
              padding: '0.5rem 1rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(255, 23, 68, 0.1)',
              border: '1px solid rgba(255, 23, 68, 0.25)',
              color: '#ff1744'
            }}
          >
            <Trash2 size={16} /> Reset Scheduler
          </button>
          <button 
            onClick={onOpenAutoSchedule} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Clock size={16} /> Auto Schedule Planner
          </button>
        </div>
      </div>

      {/* Stage Filter Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1.25rem', 
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem', fontWeight: 600 }}>
          <Filter size={14} /> Stage Filter:
        </span>
        <button
          onClick={() => setSelectedStageFilter('ALL')}
          className={`btn ${selectedStageFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
        >
          All Stages ({programs.length})
        </button>
        {availableStageNames.map(sName => {
          const count = programs.filter(p => p.venue === sName).length;
          return (
            <button
              key={sName}
              onClick={() => setSelectedStageFilter(sName)}
              className={`btn ${selectedStageFilter === sName ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
            >
              {sName} ({count})
            </button>
          );
        })}
        <button
          onClick={() => setSelectedStageFilter('UNASSIGNED')}
          className={`btn ${selectedStageFilter === 'UNASSIGNED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px' }}
        >
          Unassigned ({programs.filter(p => !p.venue).length})
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Venue / Stage</th>
              <th>Scheduled Time</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="tag tag-primary">{p.category_name}</span></td>
                  <td>
                    {p.venue ? (
                      <span className="tag" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--primary-neon)', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                        {p.venue}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Set</span>
                    )}
                  </td>
                  <td>{p.schedule ? new Date(p.schedule).toLocaleString() : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Scheduled</span>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => onOpenScheduleEdit(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Edit Schedule
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No programs match the selected stage filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
