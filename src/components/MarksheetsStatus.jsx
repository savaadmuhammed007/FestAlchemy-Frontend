import React, { useState, useMemo } from 'react';
import { ClipboardList, Search, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MarksheetsStatus({ programs, onOpenMarksheets }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'has_marksheets' | 'lots_spun' | 'needs_judges'

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      // Search matching
      const q = search.trim().toLowerCase();
      if (q) {
        const nameMatch = p.name.toLowerCase().includes(q);
        const catMatch = (p.category_name || '').toLowerCase().includes(q);
        const venueMatch = (p.venue || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !venueMatch) return false;
      }

      // Filter matching
      const hasSheets = Boolean(p.has_marksheets);
      const isSpun = Boolean(p.lot_completed || p.lot_spun_at);
      const hasJudges = p.judges && p.judges.length > 0;

      if (filter === 'has_marksheets') return hasSheets;
      if (filter === 'lots_spun') return isSpun;
      if (filter === 'needs_judges') return !hasJudges;

      return true;
    });
  }, [programs, search, filter]);

  const stats = useMemo(() => {
    const withSheets = programs.filter(p => p.has_marksheets).length;
    const spun = programs.filter(p => p.lot_completed || p.lot_spun_at).length;
    const needsJudges = programs.filter(p => !p.judges || p.judges.length === 0).length;
    return { withSheets, spun, needsJudges };
  }, [programs]);

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={20} /> Marksheets Status Overview
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.35rem 0 0 0' }}>
            Inspect evaluation marksheets, judges, and stage appearance progress across events.
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search event name, category, venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.2rem', paddingRight: search ? '2.2rem' : '1rem', height: '38px', fontSize: '0.875rem' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            All Events ({programs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('has_marksheets')}
            className={`btn ${filter === 'has_marksheets' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            Has Marksheets ({stats.withSheets})
          </button>
          <button
            type="button"
            onClick={() => setFilter('lots_spun')}
            className={`btn ${filter === 'lots_spun' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            Lots Spun ({stats.spun})
          </button>
          <button
            type="button"
            onClick={() => setFilter('needs_judges')}
            className={`btn ${filter === 'needs_judges' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            Needs Judges ({stats.needsJudges})
          </button>
        </div>
      </div>

      {/* FILTER ACTIVE SUMMARY */}
      {(search || filter !== 'all') && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing <strong>{filteredPrograms.length}</strong> of <strong>{programs.length}</strong> events
            {search && <> matching "<strong>{search}</strong>"</>}
          </span>
          <button
            type="button"
            onClick={() => { setSearch(''); setFilter('all'); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-neon)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            Reset filters
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Event Program</th>
              <th>Category</th>
              <th>Lot Appearance</th>
              <th>Judges Assigned</th>
              <th>Marksheets</th>
              <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.map(p => {
              const isSpun = Boolean(p.lot_completed || p.lot_spun_at);
              const judgeCount = p.judges?.length || 0;
              const hasSheets = Boolean(p.has_marksheets);

              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ fontSize: '0.95rem' }}>{p.name}</div>
                    {p.venue && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Venue: {p.venue}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="tag tag-primary">{p.category_name}</span>
                  </td>
                  <td>
                    {isSpun ? (
                      <span className="tag tag-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Lots Spun
                      </span>
                    ) : (
                      <span className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                        Not Spun
                      </span>
                    )}
                  </td>
                  <td>
                    {judgeCount > 0 ? (
                      <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>
                        {judgeCount} Judge{judgeCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                        ⚠️ None
                      </span>
                    )}
                  </td>
                  <td>
                    {hasSheets ? (
                      <span className="tag tag-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Generated
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        No sheets yet
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => onOpenMarksheets(p)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      View Sheets
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredPrograms.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <Search size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                  <div>No programs found matching your search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
