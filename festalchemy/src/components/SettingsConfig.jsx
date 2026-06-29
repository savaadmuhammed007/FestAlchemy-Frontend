import React from 'react';
import { Settings, Users, Save, PlusCircle, Trash, CheckSquare, Edit } from 'lucide-react';

export default function SettingsConfig({
  settingsSubTab,
  festName,
  setFestName,
  festYear,
  setFestYear,
  festTagline,
  setFestTagline,
  point1st,
  setPoint1st,
  point2nd,
  setPoint2nd,
  point3rd,
  setPoint3rd,
  onSaveFestSettings,
  teams,
  judges,
  onOpenModal,
  onDeleteItem
}) {
  return (
    <div>
      {settingsSubTab === 'general' ? (
        /* ─── GENERAL SETTINGS SECTION ─── */
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} style={{ color: 'var(--primary-neon)' }} /> Fest Configuration Settings
          </h3>
          <form onSubmit={onSaveFestSettings}>
            <div className="form-group">
              <label className="form-label">Fest Name</label>
              <input type="text" className="form-control" value={festName} onChange={e => setFestName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input type="number" className="form-control" value={festYear} onChange={e => setFestYear(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input type="text" className="form-control" value={festTagline} onChange={e => setFestTagline(e.target.value)} />
            </div>
            
            <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontFamily: 'var(--font-display)' }}>Rank Base Weights</h4>
            <div className="grid-cols-3">
              <div className="form-group">
                <label className="form-label">1st Rank</label>
                <input type="number" className="form-control" value={point1st} onChange={e => setPoint1st(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">2nd Rank</label>
                <input type="number" className="form-control" value={point2nd} onChange={e => setPoint2nd(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">3rd Rank</label>
                <input type="number" className="form-control" value={point3rd} onChange={e => setPoint3rd(e.target.value)} />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Save size={16} /> Save Configuration</button>
          </form>
        </div>
      ) : (
        /* ─── USER & ACCESS SECTION ─── */
        <div className="grid-cols-2">
          {/* TEAMS PANEL */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} style={{ color: 'var(--primary-neon)' }} /> Teams</h3>
              <button onClick={() => onOpenModal('add-team')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <PlusCircle size={14} /> Register Team & Lead
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Team Lead</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.teamlead_username || 'TBD'}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => onOpenModal('edit-team', t)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Team"><Edit size={14} /></button>
                        <button onClick={() => onDeleteItem('teams', t.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Team"><Trash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* JUDGES PANEL */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={18} style={{ color: 'var(--primary-neon)' }} /> Judges</h3>
              <button onClick={() => onOpenModal('add-judge')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <PlusCircle size={14} /> Add Judge User
              </button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map(j => (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>{j.first_name} {j.last_name}</td>
                      <td>{j.username}</td>
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => onOpenModal('edit-judge', j)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Judge"><Edit size={14} /></button>
                        <button onClick={() => onDeleteItem('users', j.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Judge"><Trash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
