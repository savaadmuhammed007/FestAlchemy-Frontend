import React from 'react';
import { Clock } from 'lucide-react';

export default function SchedulePlanner({ programs, onOpenScheduleEdit }) {
  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} /> Schedule & Venue Planner
      </h3>
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
