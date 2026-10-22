import React, { useState, useMemo } from 'react';
import { ChevronLeft, RefreshCw, AlertCircle, CheckCircle, Clock, Search, X } from 'lucide-react';

export default function JudgeMarksheetList({
  selectedProgram,
  marksheets,
  evalLoading,
  isViewingCompleted,
  onRefresh,
  onBack,
  onOpenEvaluate,
  onSync,
  isSyncing,
  syncMessage
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'submitted'

  const sortCodes = (a, b) => {
    const codeA = (a.judge_code || '').trim();
    const codeB = (b.judge_code || '').trim();
    const isInvalidA = !codeA || codeA === 'N/A';
    const isInvalidB = !codeB || codeB === 'N/A';
    if (isInvalidA && isInvalidB) return (a.id || 0) - (b.id || 0);
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    
    // If both are pure alphabetic lot codes (e.g. A..Z, AA..AZ)
    const isAlphaA = /^[A-Za-z]+$/.test(codeA);
    const isAlphaB = /^[A-Za-z]+$/.test(codeB);
    if (isAlphaA && isAlphaB) {
      if (codeA.length !== codeB.length) {
        return codeA.length - codeB.length;
      }
      return codeA.localeCompare(codeB, undefined, { sensitivity: 'base' });
    }

    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  };

  const totalPending = useMemo(() => marksheets.filter(s => !s.submitted).length, [marksheets]);
  const totalSubmitted = useMemo(() => marksheets.filter(s => s.submitted).length, [marksheets]);

  const filteredSheets = useMemo(() => {
    return marksheets.filter(sheet => {
      // Status filter
      if (statusFilter === 'pending' && sheet.submitted) return false;
      if (statusFilter === 'submitted' && !sheet.submitted) return false;

      // Search query filter (matches judge_code e.g. "A", "Code A", score, or "pending"/"submitted")
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const code = (sheet.judge_code || '').toLowerCase();
        const fullCodeText = `code ${code}`;
        const scoreStr = sheet.score !== undefined && sheet.score !== null ? String(sheet.score) : '';
        const statusStr = sheet.submitted ? 'submitted' : 'pending';

        const matchesCode = code.includes(query) || fullCodeText.includes(query);
        const matchesScore = scoreStr.includes(query);
        const matchesStatus = statusStr.includes(query);

        return matchesCode || matchesScore || matchesStatus;
      }

      return true;
    });
  }, [marksheets, statusFilter, searchQuery]);

  const pendingSheets = useMemo(() => {
    return filteredSheets.filter(s => !s.submitted).sort(sortCodes);
  }, [filteredSheets]);

  const submittedSheets = useMemo(() => {
    return filteredSheets.filter(s => s.submitted).sort(sortCodes);
  }, [filteredSheets]);

  const hasPending = pendingSheets.length > 0;
  const hasSubmitted = submittedSheets.length > 0;
  const hasAnyResults = hasPending || hasSubmitted;

  // Determine grid layout based on which sections contain items
  const showTwoColumns = hasPending && hasSubmitted;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button 
          onClick={onBack} 
          className="btn btn-secondary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
        >
          <ChevronLeft size={16} /> Back to Programs
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onSync && (
            <button
              onClick={() => onSync(selectedProgram.id)}
              disabled={isSyncing}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600 }}
              title="Sync spun lot marksheets for this program"
            >
              <RefreshCw size={15} className={isSyncing ? 'spinning' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Spun Lots'}
            </button>
          )}
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              className="btn btn-secondary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
              title="Refresh participants for this program"
            >
              <RefreshCw size={15} className={evalLoading ? 'spinning' : ''} /> Refresh
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>{selectedProgram.name} Evaluation</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Category: <span className="tag tag-primary" style={{ fontSize: '0.75rem' }}>{selectedProgram.category_name}</span> | 
              Max Marks: <strong>{selectedProgram.max_marks}</strong> |
              Total Called: <strong>{marksheets.length}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="tag tag-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} /> {totalPending} Pending
            </span>
            <span className="tag tag-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={13} /> {totalSubmitted} Submitted
            </span>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS BAR */}
        {marksheets.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search participant code (e.g. A, B, C)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.2rem', paddingRight: searchQuery ? '2.2rem' : '1rem', height: '38px', fontSize: '0.875rem' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
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

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
              >
                All ({marksheets.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
              >
                Pending ({totalPending})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('submitted')}
                className={`btn ${statusFilter === 'submitted' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
              >
                Submitted ({totalSubmitted})
              </button>
            </div>
          </div>
        )}
      </div>

      {evalLoading && marksheets.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <RefreshCw className="spinning" size={30} style={{ color: 'var(--primary-neon)' }} />
        </div>
      ) : (
        <div>
          {/* SEARCH ACTIVE NOTICE */}
          {(searchQuery || statusFilter !== 'all') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>
                Showing <strong>{filteredSheets.length}</strong> of <strong>{marksheets.length}</strong> participants
                {searchQuery && <> matching "<strong>{searchQuery}</strong>"</>}
                {statusFilter !== 'all' && <> with status <strong>{statusFilter}</strong></>}
              </span>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-neon)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                  Reset filters
                </button>
              )}
            </div>
          )}

          <div className={showTwoColumns ? "grid-cols-2" : ""} style={showTwoColumns ? {} : { maxWidth: '600px', margin: '0 auto' }}>
            
            {/* PENDING SHEETS */}
            {hasPending && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning-neon)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} /> Pending Evaluations ({pendingSheets.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingSheets.map(sheet => (
                    <div 
                      key={sheet.id} 
                      className="glass-panel animate-fade-in" 
                      style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                          CODE: {sheet.judge_code}
                        </h4>
                        {sheet.score !== undefined && sheet.score !== null && sheet.score !== 0 && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Draft Score: <strong style={{ color: 'var(--secondary-neon)' }}>{sheet.score}</strong>
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => onOpenEvaluate(sheet)}
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}
                      >
                        Evaluate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETED SHEETS */}
            {hasSubmitted && (
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--success-neon)', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} /> Submitted Evaluations ({submittedSheets.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {submittedSheets.map(sheet => (
                    <div 
                      key={sheet.id} 
                      className="glass-panel animate-fade-in" 
                      style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(0, 230, 118, 0.15)' }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                          CODE: {sheet.judge_code}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--success-neon)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                          Score: {sheet.score}
                        </p>
                      </div>
                      <span className="tag tag-success" style={{ fontSize: '0.75rem' }}>Submitted</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NO MATCHES FOR SEARCH */}
            {marksheets.length > 0 && !hasAnyResults && (
              <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <Search size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'inline-block' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
                  No participants found matching "{searchQuery}"
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
                  Try searching for a different code like "A", "B", "C", or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <X size={15} /> Clear Filters
                </button>
              </div>
            )}

            {/* NO MARKSHEETS AT ALL */}
            {marksheets.length === 0 && (
              <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', textAlign: 'center', gridColumn: '1 / -1' }}>
                <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'inline-block' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
                  No participants called yet
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                  {selectedProgram?.registered_members_count > 0
                    ? `There are ${selectedProgram.registered_members_count} participants registered for this event. As soon as the stage lot is spun in the Calling tab, anonymous participant codes will appear here automatically.`
                    : 'No participants have been registered or called for this program yet.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                  {onSync && (
                    <button
                      onClick={() => onSync(selectedProgram.id)}
                      disabled={isSyncing}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontWeight: 600 }}
                    >
                      <RefreshCw size={16} className={isSyncing ? 'spinning' : ''} /> 
                      {isSyncing ? 'Syncing Lots...' : 'Sync Spun Lots Now'}
                    </button>
                  )}
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.2rem' }}
                    >
                      <RefreshCw size={16} className={evalLoading ? 'spinning' : ''} /> Check for Called Participants
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
