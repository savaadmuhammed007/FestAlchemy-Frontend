import { Clock, Trash2 } from 'lucide-react';

export default function SchedulePlanner({ programs, onOpenScheduleEdit, onOpenAutoSchedule, onResetSchedule }) {
  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Venue</th>
              <th>Scheduled Time</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="tag tag-primary">{p.category_name}</span></td>
                <td>{p.venue || <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Set</span>}</td>
                <td>{p.schedule ? new Date(p.schedule).toLocaleString() : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not Scheduled</span>}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onOpenScheduleEdit(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Edit Schedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
