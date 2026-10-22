import React, { useState, useMemo } from 'react';
import { Award, Clock, CheckCircle, RefreshCw, Search, X } from 'lucide-react';

export default function JudgeProgramList({ 
  programs, 
  allMarksheets, 
  onSelectProgram, 
  onRefresh, 
  isRefreshing,
  onSync,
  isSyncing,
  syncMessage
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    programs.forEach(p => {
      if (p.category_name) cats.add(p.category_name);
    });
    return Array.from(cats).sort();
  }, [programs]);

  // Filter programs based on search and category
  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return programs.filter(prog => {
      const matchName = !q || (prog.name && prog.name.toLowerCase().includes(q));
      const matchCat = !q || (prog.category_name && prog.category_name.toLowerCase().includes(q));
      const matchVenue = !q || (prog.venue && prog.venue.toLowerCase().includes(q));
      const matchesSearch = matchName || matchCat || matchVenue;

      const matchesCatFilter = selectedCategory === 'all' || prog.category_name === selectedCategory;
      return matchesSearch && matchesCatFilter;
    });
  }, [programs, searchQuery, selectedCategory]);

  // Group programs
  const pendingPrograms = [];
  const completedPrograms = [];

  filteredPrograms.forEach(prog => {
    const progSheets = allMarksheets.filter(m => m.program === prog.id);
    const totalSheets = progSheets.length;
    const submittedSheets = progSheets.filter(m => m.submitted).length;

    const progWithCounts = {
      ...prog,
      total_sheets: totalSheets,
      submitted_sheets: submittedSheets
    };

    if (totalSheets > 0 && submittedSheets === totalSheets) {
      completedPrograms.push(progWithCounts);
    } else {
      pendingPrograms.push(progWithCounts);
    }
  });

  const renderProgramCard = (prog, isCompleted) => {
    return (
      <div 
        key={prog.id} 
        className="glass-panel glass-panel-hover" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          borderColor: isCompleted ? 'rgba(0, 230, 118, 0.15)' : 'var(--border-glass)',
          padding: '1.5rem',
          borderRadius: '16px'
        }}
      >
        <div>
          <span className="tag tag-primary" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
            {prog.category_name}
          </span>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            {prog.name}
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            {prog.total_sheets === 0 ? (
              <span className="tag tag-warning" style={{ fontSize: '0.75rem' }}>
                {prog.registered_members_count > 0 
                  ? `Awaiting lot spin (${prog.registered_members_count} registered)`
                  : 'No participants called yet'}
              </span>
            ) : isCompleted ? (
              <span className="tag tag-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> All {prog.total_sheets} Submitted
              </span>
            ) : (
              <span className="tag tag-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {prog.submitted_sheets} / {prog.total_sheets} Evaluated
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Max Marks: <strong>{prog.max_marks}</strong> | Limit: {prog.participant_limit || 'Unlimited'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button 
            onClick={() => onSelectProgram(prog, isCompleted)}
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} 
            style={{ flex: 1 }}
          >
            {isCompleted ? 'View Marks' : prog.total_sheets === 0 ? 'Open Evaluations' : 'Mark Participants'}
          </button>
          {prog.total_sheets === 0 && onSync && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSync(prog.id); }}
              disabled={isSyncing}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sync spun lots for this event"
            >
              <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Judge Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Welcome back! Select a program below to evaluate called participants.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onSync && (
            <button
              onClick={() => onSync()}
              disabled={isSyncing}
              className="btn btn-primary"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.6rem 1.25rem',
                fontWeight: 600,
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.35)'
              }}
              title="Sync and generate marksheets for newly spun programs"
            >
              <RefreshCw size={16} className={isSyncing ? 'spinning' : ''} />
              {isSyncing ? 'Syncing Spun Lots...' : 'Sync Spun Lots'}
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem' }}
              title="Refresh programs and called participants"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} /> Refresh
            </button>
          )}
        </div>
        {syncMessage && (
          <div className="tag tag-success animate-fade-in" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', width: '100%', marginTop: '0.5rem' }}>
            ✓ {syncMessage}
          </div>
        )}
      </div>

      {/* SEARCH AND FILTER BAR */}
      {programs.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            marginBottom: '2rem', 
            padding: '1rem 1.25rem', 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
            <input
              type="text"
              placeholder="Search assigned events by name, category, or venue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ 
                paddingLeft: '2.4rem', 
                paddingRight: searchQuery ? '2.4rem' : '1rem', 
                height: '42px', 
                fontSize: '0.9rem' 
              }}
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
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%'
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`tag ${selectedCategory === 'all' ? 'tag-primary' : 'tag-neutral'}`}
                style={{ 
                  cursor: 'pointer', 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.78rem',
                  border: selectedCategory === 'all' ? '1px solid var(--primary-neon)' : '1px solid var(--border-glass)'
                }}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`tag ${selectedCategory === cat ? 'tag-primary' : 'tag-neutral'}`}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.78rem',
                    border: selectedCategory === cat ? '1px solid var(--primary-neon)' : '1px solid var(--border-glass)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Result Count Info */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Showing <strong>{filteredPrograms.length}</strong> of <strong>{programs.length}</strong> events
          </div>
        </div>
      )}

      {/* NO SEARCH RESULTS */}
      {programs.length > 0 && filteredPrograms.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', marginBottom: '2rem' }}>
          <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
          <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>No events found</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            No assigned programs match your search "{searchQuery}"{selectedCategory !== 'all' ? ` in category "${selectedCategory}"` : ''}.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <X size={15} /> Clear Filters
          </button>
        </div>
      )}

      {/* PENDING SECTION */}
      {filteredPrograms.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontFamily: 'var(--font-display)', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--warning-neon)'
          }}>
            <Clock size={22} /> Pending Evaluations ({pendingPrograms.length})
          </h3>
          {pendingPrograms.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No pending evaluations. Great job!</p>
            </div>
          ) : (
            <div className="grid-cols-3">
              {pendingPrograms.map(p => renderProgramCard(p, false))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED SECTION */}
      {filteredPrograms.length > 0 && (
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontFamily: 'var(--font-display)', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--success-neon)'
          }}>
            <CheckCircle size={22} /> Finalized Evaluations ({completedPrograms.length})
          </h3>
          {completedPrograms.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No finalized evaluations yet.</p>
            </div>
          ) : (
            <div className="grid-cols-3">
              {completedPrograms.map(p => renderProgramCard(p, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
