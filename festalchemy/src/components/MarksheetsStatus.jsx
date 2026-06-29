import React from 'react';
import { ClipboardList } from 'lucide-react';

export default function MarksheetsStatus({ programs, onOpenMarksheets }) {
  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ClipboardList size={18} /> Marksheets Status Overview
      </h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event Program</th>
              <th>Category</th>
              <th>Judges Assigned</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="tag tag-primary">{p.category_name}</span></td>
                <td>{p.judges?.length || 0} judges</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onOpenMarksheets(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    View Sheets
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
