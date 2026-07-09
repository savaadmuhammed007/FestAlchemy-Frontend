import React from 'react';
import { Edit, Trash, PlusCircle, Calendar, Layers } from 'lucide-react';

export default function ProgramsSetup({ categories, programs, onOpenModal, onDelete }) {
  return (
    <div className="grid-cols-2">
      {/* CATEGORIES */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Layers size={18} /> Categories</h3>
          <button onClick={() => onOpenModal('add-category')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <PlusCircle size={16} /> Add Category
          </button>
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Chest Prefix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className="tag tag-primary">{c.chest_prefix}</span></td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onOpenModal('edit-category', c)} className="btn btn-secondary" style={{ padding: '0.3rem' }}><Edit size={14} /></button>
                    <button onClick={() => onDelete('categories', c.id)} className="btn btn-danger" style={{ padding: '0.3rem' }}><Trash size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROGRAMS */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} /> Programs</h3>
          <button onClick={() => onOpenModal('add-program')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <PlusCircle size={16} /> Add Program
          </button>
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Max Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>
                    {p.name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category_name}</div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.type} | {p.stage_type}</td>
                  <td>{p.max_marks}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onOpenModal('edit-program', p)} className="btn btn-secondary" style={{ padding: '0.3rem' }}><Edit size={14} /></button>
                    <button onClick={() => onDelete('programs', p.id)} className="btn btn-danger" style={{ padding: '0.3rem' }}><Trash size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
