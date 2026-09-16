import React, { useState, useMemo } from 'react';
import { Edit, Trash, PlusCircle, Calendar, Layers, Search, Filter, X, RotateCcw } from 'lucide-react';

export default function ProgramsSetup({ categories = [], programs = [], onOpenModal, onDelete }) {
  // Programs search & filter state
  const [progSearch, setProgSearch] = useState('');
  const [progCategoryFilter, setProgCategoryFilter] = useState('');
  const [progStageFilter, setProgStageFilter] = useState('');
  const [progTypeFilter, setProgTypeFilter] = useState('');

  // Categories search state
  const [catSearch, setCatSearch] = useState('');

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter(c => 
      c.name?.toLowerCase().includes(q) || 
      (c.chest_prefix && c.chest_prefix.toLowerCase().includes(q))
    );
  }, [categories, catSearch]);

  // Program count per category map for quick display
  const programCountByCategory = useMemo(() => {
    const counts = {};
    programs.forEach(p => {
      const catId = p.category;
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [programs]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      // 1. Search Query (Matches Program Name or Category Name)
      if (progSearch.trim()) {
        const q = progSearch.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCategory = p.category_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }

      // 2. Category Filter
      if (progCategoryFilter) {
        if (String(p.category) !== String(progCategoryFilter)) return false;
      }

      // 3. Stage Type Filter
      if (progStageFilter) {
        if (p.stage_type !== progStageFilter) return false;
      }

      // 4. Program Type Filter
      if (progTypeFilter) {
        if (p.type !== progTypeFilter) return false;
      }

      return true;
    });
  }, [programs, progSearch, progCategoryFilter, progStageFilter, progTypeFilter]);

  // Check if any program filter is active
  const hasActiveFilters = Boolean(
    progSearch.trim() || progCategoryFilter || progStageFilter || progTypeFilter
  );

  const handleClearFilters = () => {
    setProgSearch('');
    setProgCategoryFilter('');
    setProgStageFilter('');
    setProgTypeFilter('');
  };

  const handleToggleCategoryFilter = (catId) => {
    if (String(progCategoryFilter) === String(catId)) {
      setProgCategoryFilter('');
    } else {
      setProgCategoryFilter(String(catId));
    }
  };

  return (
    <div className="grid-cols-2">
      {/* CATEGORIES PANEL */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.15rem' }}>
            <Layers size={18} style={{ color: 'var(--accent)' }} /> Categories
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
              {filteredCategories.length}
            </span>
          </h3>
          <button onClick={() => onOpenModal('add-category')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <PlusCircle size={16} /> Add Category
          </button>
        </div>

        {/* Category Quick Search (shown when more than 3 categories) */}
        {categories.length > 3 && (
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Filter categories..."
              value={catSearch}
              onChange={e => setCatSearch(e.target.value)}
              style={{ paddingLeft: '2rem', paddingRight: catSearch ? '2rem' : '0.75rem', height: '34px', fontSize: '0.8rem' }}
            />
            {catSearch && (
              <button
                type="button"
                onClick={() => setCatSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                title="Clear category search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

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
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    {catSearch ? "No categories match your search." : "No categories added yet."}
                  </td>
                </tr>
              ) : (
                filteredCategories.map(c => {
                  const isSelected = String(progCategoryFilter) === String(c.id);
                  const count = programCountByCategory[c.id] || 0;
                  return (
                    <tr 
                      key={c.id}
                      style={{
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : undefined,
                        borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span>{c.name}</span>
                          {isSelected && (
                            <span className="tag tag-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                              Filtered
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {count} {count === 1 ? 'program' : 'programs'}
                        </div>
                      </td>
                      <td><span className="tag tag-primary">{c.chest_prefix}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggleCategoryFilter(c.id)}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            title={isSelected ? 'Clear filter' : 'Filter programs by this category'}
                          >
                            <Filter size={12} />
                            {isSelected ? 'Filtered' : 'Filter'}
                          </button>
                          <button onClick={() => onOpenModal('edit-category', c)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Category">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => onDelete('categories', c.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Category">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROGRAMS PANEL */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.15rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent)' }} /> Programs
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-overlay)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
              {filteredPrograms.length}
              {hasActiveFilters && filteredPrograms.length !== programs.length ? ` of ${programs.length}` : ''}
            </span>
          </h3>
          <button onClick={() => onOpenModal('add-program')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <PlusCircle size={16} /> Add Program
          </button>
        </div>

        {/* Programs Search & Filter Controls */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.65rem', 
          marginBottom: '1.25rem', 
          padding: '0.85rem', 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderRadius: '10px', 
          border: '1px solid var(--border)' 
        }}>
          {/* Search Input Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search programs by name or category..."
              value={progSearch}
              onChange={e => setProgSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: progSearch ? '2.2rem' : '0.75rem', height: '36px', fontSize: '0.85rem' }}
            />
            {progSearch && (
              <button
                type="button"
                onClick={() => setProgSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', alignItems: 'center' }}>
            {/* Category Filter */}
            <select
              className="form-control"
              value={progCategoryFilter}
              onChange={e => setProgCategoryFilter(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.5rem' }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {programCountByCategory[c.id] ? `(${programCountByCategory[c.id]})` : ''}
                </option>
              ))}
            </select>

            {/* Stage Type Filter */}
            <select
              className="form-control"
              value={progStageFilter}
              onChange={e => setProgStageFilter(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.5rem' }}
            >
              <option value="">All Stages</option>
              <option value="onstage">Onstage</option>
              <option value="offstage">Offstage</option>
            </select>

            {/* Program Type Filter */}
            <select
              className="form-control"
              value={progTypeFilter}
              onChange={e => setProgTypeFilter(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.5rem' }}
            >
              <option value="">All Types</option>
              <option value="single">Single</option>
              <option value="group">Group</option>
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn btn-secondary"
                style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.6rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Reset all filters"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active filters:</span>
              {progSearch && (
                <span className="tag tag-primary" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  "{progSearch}"
                  <X size={11} style={{ cursor: 'pointer' }} onClick={() => setProgSearch('')} />
                </span>
              )}
              {progCategoryFilter && (
                <span className="tag tag-info" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Category: {categories.find(c => String(c.id) === String(progCategoryFilter))?.name || progCategoryFilter}
                  <X size={11} style={{ cursor: 'pointer' }} onClick={() => setProgCategoryFilter('')} />
                </span>
              )}
              {progStageFilter && (
                <span className="tag tag-warning" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textTransform: 'capitalize' }}>
                  Stage: {progStageFilter}
                  <X size={11} style={{ cursor: 'pointer' }} onClick={() => setProgStageFilter('')} />
                </span>
              )}
              {progTypeFilter && (
                <span className="tag tag-success" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textTransform: 'capitalize' }}>
                  Type: {progTypeFilter}
                  <X size={11} style={{ cursor: 'pointer' }} onClick={() => setProgTypeFilter('')} />
                </span>
              )}
            </div>
          )}
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
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Filter size={24} style={{ opacity: 0.35, display: 'block', margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                      No programs found
                    </div>
                    <div style={{ fontSize: '0.8rem', marginBottom: hasActiveFilters ? '0.75rem' : 0 }}>
                      {hasActiveFilters ? "No programs match your search or filter criteria." : "No programs have been added yet."}
                    </div>
                    {hasActiveFilters && (
                      <button onClick={handleClearFilters} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}>
                        <RotateCcw size={12} /> Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPrograms.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '2px' }}>
                        {p.category_name || 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <span className={`tag ${p.type === 'group' ? 'tag-warning' : 'tag-primary'}`} style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                          {p.type}
                        </span>
                        <span className={`tag ${p.stage_type === 'offstage' ? 'tag-info' : 'tag-success'}`} style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                          {p.stage_type}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.max_marks}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => onOpenModal('edit-program', p)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Program">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => onDelete('programs', p.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Program">
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
