import React from 'react';
import { Users } from 'lucide-react';

export default function TeamLeadMembersDashboard({ members, onOpenAssignPrograms }) {
  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={20} /> Team Members ({members.length})
      </h3>
      
      {members.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No members registered yet. Click "Add New Member" to begin.</p>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Chest No</th>
                <th>Name</th>
                <th>Category</th>
                <th>Registered Programs</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--secondary-neon)' }}>
                    {m.chest_no || 'TBD'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>
                    <span className="tag tag-primary">{m.category_name}</span>
                  </td>
                  <td>
                    {m.registered_programs_details.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {m.registered_programs_details.map(p => (
                          <span key={p.id} className="tag tag-success" style={{ fontSize: '0.7rem' }}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => onOpenAssignPrograms(m)}
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      Manage Events
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
