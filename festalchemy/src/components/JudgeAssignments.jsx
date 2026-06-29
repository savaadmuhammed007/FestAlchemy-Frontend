import React from 'react';
import { UserCheck } from 'lucide-react';

export default function JudgeAssignments({ programs, onOpenJudgeAssignment }) {
  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <UserCheck size={18} /> Judge Assignments
      </h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Assigned Judges</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="tag tag-primary">{p.category_name}</span></td>
                <td>
                  {p.judges_details?.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {p.judges_details?.map(j => (
                        <span key={j.id} className="tag tag-warning" style={{ fontSize: '0.7rem' }}>{j.full_name}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onOpenJudgeAssignment(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Assign Judges
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
