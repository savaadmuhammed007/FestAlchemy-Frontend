import React, { useState, useMemo } from 'react';
import { UserCheck, Search, Filter, Sparkles, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function JudgeAssignments({ programs, onOpenJudgeAssignment, onSyncAllMarksheets, syncingMarksheets }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'needs_judges_spun' | 'has_judges' | 'lots_spun'

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;

      const hasJudges = p.judges && p.judges.length > 0;
      const isSpun = Boolean(p.lot_completed || p.lot_spun_at);

      if (filter === 'needs_judges_spun') return isSpun && !hasJudges;
      if (filter === 'has_judges') return hasJudges;
      if (filter === 'lots_spun') return isSpun;
      return true;
    });
  }, [programs, search, filter]);

  const spunNeedsJudgesCount = useMemo(() => {
    return programs.filter(p => (p.lot_completed || p.lot_spun_at) && (!p.judges || p.judges.length === 0)).length;
  }, [programs]);

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} /> Judge Assignments & Marksheet Sync
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
            Assign judges to events. Marksheets automatically generate for all called participants even when assigned after lots are spun.
          </p>
        </div>

        {onSyncAllMarksheets && (
          <button
            onClick={onSyncAllMarksheets}
            disabled={syncingMarksheets}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary-neon)'
            }}
            title="Checks all events where lots were spun and ensures marksheets exist for all assigned judges"
          >
            <RefreshCw size={15} className={syncingMarksheets ? 'spinning' : ''} />
            {syncingMarksheets ? 'Syncing...' : 'Sync All Spun Marksheets'}
          </button>
        )}
      </div>

      {spunNeedsJudgesCount > 0 && (
        <div style={{
          padding: '0.85rem 1.2rem',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} style={{ color: 'var(--warning-neon)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <strong>{spunNeedsJudgesCount}</strong> event{spunNeedsJudgesCount > 1 ? 's have' : ' has'} lot codes already spun but no judges assigned yet!
            </span>
          </div>
          <button
            onClick={() => setFilter('needs_judges_spun')}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', borderColor: 'var(--warning-neon)', color: '#fbbf24' }}
          >
            Filter Spun Events Needing Judges
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search events or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            All ({programs.length})
          </button>
          <button
            onClick={() => setFilter('needs_judges_spun')}
            className={`btn ${filter === 'needs_judges_spun' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Spun & Needs Judges ({spunNeedsJudgesCount})
          </button>
          <button
            onClick={() => setFilter('lots_spun')}
            className={`btn ${filter === 'lots_spun' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Lots Spun ({programs.filter(p => p.lot_completed || p.lot_spun_at).length})
          </button>
          <button
            onClick={() => setFilter('has_judges')}
            className={`btn ${filter === 'has_judges' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Judges Assigned ({programs.filter(p => p.judges && p.judges.length > 0).length})
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Lot Calling Status</th>
              <th>Assigned Judges</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No events match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredPrograms.map(p => {
                const isSpun = Boolean(p.lot_completed || p.lot_spun_at);
                const hasJudges = p.judges && p.judges.length > 0;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.registered_members_count || 0} participants registered
                      </div>
                    </td>
                    <td>
                      <span className="tag tag-primary">{p.category_name}</span>
                    </td>
                    <td>
                      {isSpun ? (
                        <span className="tag tag-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                          <CheckCircle size={12} /> Lots Spun {p.lot_completed ? '(Complete)' : '(In Progress)'}
                        </span>
                      ) : (
                        <span className="tag tag-secondary" style={{ fontSize: '0.75rem' }}>
                          Lots Not Spun
                        </span>
                      )}
                    </td>
                    <td>
                      {!hasJudges ? (
                        <span className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                          ⚠️ None (Assign to enable judging)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {p.judges_details?.map(j => (
                            <span key={j.id} className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                              {j.full_name || j.username}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenJudgeAssignment(p)}
                        className={`btn ${!hasJudges && isSpun ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        {hasJudges ? 'Edit Judges' : 'Assign Judges'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
