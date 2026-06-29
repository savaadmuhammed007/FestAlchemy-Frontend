import React from 'react';
import { Sliders } from 'lucide-react';

export default function GradeSettings({ programs, onOpenGrades }) {
  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sliders size={18} /> Grading Rules Per Program
      </h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event Program</th>
              <th>Category</th>
              <th>Active Grading Rules</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><span className="tag tag-primary">{p.category_name}</span></td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {p.max_marks > 0 ? (
                      <span className="tag tag-primary" style={{ fontSize: '0.7rem' }}>Max: {p.max_marks} marks</span>
                    ) : null}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onOpenGrades(p)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Configure Grades
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
