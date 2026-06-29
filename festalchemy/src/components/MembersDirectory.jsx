import React from 'react';
import { Search, Filter, Trash, Users } from 'lucide-react';

export default function MembersDirectory({
  filteredMembers,
  memberSearch,
  setMemberSearch,
  memberFilterTeam,
  setMemberFilterTeam,
  memberFilterCategory,
  setMemberFilterCategory,
  teams,
  categories,
  onDelete
}) {
  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} /> Registered Members Directory
        </h3>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Total Listed: <strong>{filteredMembers.length}</strong>
        </span>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or chest number..." 
            value={memberSearch}
            onChange={e => setMemberSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        
        <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
          <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select 
            className="form-control" 
            value={memberFilterTeam} 
            onChange={e => setMemberFilterTeam(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          >
            <option value="">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
          <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select 
            className="form-control" 
            value={memberFilterCategory} 
            onChange={e => setMemberFilterCategory(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Chest No</th>
              <th>Member Name</th>
              <th>Team</th>
              <th>Category</th>
              <th>Registered Events</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 'bold', color: 'var(--secondary-neon)' }}>{m.chest_no || 'TBD'}</td>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>{m.team_name}</td>
                <td><span className="tag tag-primary">{m.category_name}</span></td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {m.registered_programs_details.map(p => (
                      <span key={p.id} className="tag tag-success" style={{ fontSize: '0.7rem' }}>{p.name}</span>
                    ))}
                    {m.registered_programs_details.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registrations</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => onDelete('members', m.id)} className="btn btn-danger" style={{ padding: '0.3rem' }}><Trash size={14} /></button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colspan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No members found matching the search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
