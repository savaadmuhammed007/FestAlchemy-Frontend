import React, { useState, useContext, useMemo } from 'react';
import { Search, Filter, Trash, Users, UserPlus, Shield, ChevronLeft, RefreshCw, CheckSquare, Square } from 'lucide-react';
import { UIContext } from '../App';
import { API_BASE_URL } from '../context/AuthContext';

export default function MemberRegistry({
  members,
  teams,
  categories,
  programs,
  token,
  onRefreshData
}) {
  const { showToast, confirm } = useContext(UIContext);
  const [view, setView] = useState('list'); // list | add | edit
  const [selectedMember, setSelectedMember] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Form states
  const [memberName, setMemberName] = useState('');
  const [memberTeam, setMemberTeam] = useState('');
  const [memberCategory, setMemberCategory] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get General Category ID (fallback for cross-events)
  const generalCatId = useMemo(() => {
    const gen = categories.find(c => c.name.toLowerCase().includes('general') || c.name.toLowerCase().includes('open'));
    return gen ? gen.id : null;
  }, [categories]);

  const handleOpenAdd = () => {
    setMemberName('');
    setMemberTeam('');
    setMemberCategory('');
    setSelectedPrograms([]);
    setErrorMsg('');
    setSuccessMsg('');
    setView('add');
  };

  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    // Preset pre-existing registrations
    const programIds = member.registered_programs_details?.map(p => p.id) || [];
    setSelectedPrograms(programIds);
    setErrorMsg('');
    setSuccessMsg('');
    setView('edit');
  };

  const handleCheckboxChange = (programId) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      } else {
        return [...prev, programId];
      }
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberTeam || !memberCategory) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: memberName.trim(),
          team: parseInt(memberTeam),
          category: parseInt(memberCategory),
          registered_programs: selectedPrograms
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to register member.");

      setSuccessMsg(`Member registered successfully! Assigned Chest No: ${json.chest_no || 'TBD'}`);
      onRefreshData();
      setTimeout(() => setView('list'), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/${selectedMember.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registered_programs: selectedPrograms
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update member registrations.");

      setSuccessMsg("Program registrations updated successfully!");
      onRefreshData();
      setTimeout(() => setView('list'), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id, name) => {
    const confirmed = await confirm("Delete Participant", `Are you sure you want to delete member: ${name}?`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/members/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        showToast("Participant deleted successfully.", "success");
        onRefreshData();
      } else {
        showToast("Failed to delete member.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting participant.", "error");
    }
  };

  // Helper to render check card with perfect contrast and borders
  const renderCheckCard = (p, themeClass = 'accent', currentTeamId, excludeMemberId = null) => {
    const isChecked = selectedPrograms.includes(p.id);
    
    // Check team registration limits
    const isLimited = p.participant_limit > 0;
    const teamCount = isLimited && currentTeamId
      ? members.filter(m => 
          m.team === parseInt(currentTeamId) && 
          m.id !== excludeMemberId &&
          m.registered_programs_details?.some(prog => prog.id === p.id)
        ).length
      : 0;
    
    const limitReached = isLimited && teamCount >= p.participant_limit;
    const isDisabled = limitReached && !isChecked;

    // Theme-compatible styles
    let backgroundStyle = 'rgba(255,255,255,0.01)';
    let borderStyle = '1px solid var(--border)';
    let checkColor = 'var(--text-muted)';
    let textColor = 'var(--text-secondary)';
    let cursorStyle = 'pointer';
    let opacityStyle = 1;
    let boxShadowStyle = 'none';

    if (isDisabled) {
      backgroundStyle = 'rgba(255,255,255,0.02)';
      borderStyle = '1px dotted var(--border)';
      textColor = 'var(--text-muted)';
      cursorStyle = 'not-allowed';
      opacityStyle = 0.6;
    } else if (isChecked) {
      textColor = '#ffffff';
      backgroundStyle = 'var(--accent)';
      borderStyle = '1px solid var(--accent)';
      checkColor = '#ffffff';
      boxShadowStyle = 'var(--shadow-md)';
    }

    return (
      <label 
        key={p.id} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          cursor: cursorStyle, 
          color: textColor,
          background: backgroundStyle,
          border: borderStyle,
          boxShadow: boxShadowStyle,
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          transition: 'all 0.2s var(--ease)',
          userSelect: 'none',
          opacity: opacityStyle
        }}
        className={isDisabled ? "" : "glass-panel-hover"}
      >
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={() => {
            if (!isDisabled) {
              handleCheckboxChange(p.id);
            }
          }}
          disabled={submitting || isDisabled}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          {isChecked ? (
            <CheckSquare size={18} style={{ color: checkColor, flexShrink: 0 }} />
          ) : (
            <Square size={18} style={{ color: isDisabled ? 'rgba(255,255,255,0.1)' : 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>{p.name}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', color: isChecked ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)' }}>
                {p.stage_type.toUpperCase()} • {p.type.toUpperCase()}
              </span>
              {isLimited && (
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: isChecked ? 'rgba(255, 255, 255, 0.9)' : (limitReached ? 'var(--danger)' : 'var(--text-muted)') }}>
                  {limitReached ? `Limit Reached (${teamCount}/${p.participant_limit})` : `Team Limit: ${p.participant_limit}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </label>
    );
  };

  // Filter members list
  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.chest_no && m.chest_no.toString().includes(searchQuery));
    const matchesTeam = filterTeam ? m.team === parseInt(filterTeam) : true;
    const matchesCategory = filterCategory ? m.category === parseInt(filterCategory) : true;
    return matchesSearch && matchesTeam && matchesCategory;
  });

  return (
    <div>
      {/* Notifications */}
      {errorMsg && (
        <div className="glass-panel" style={{ background: 'rgba(255, 23, 68, 0.1)', borderColor: 'rgba(255, 23, 68, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#ff1744' }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="glass-panel" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.25)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', color: '#00e676' }}>
          {successMsg}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          LIST VIEW
      ──────────────────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield style={{ color: 'var(--primary-neon)' }} /> Official Member Registry
            </h3>
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              <UserPlus size={16} /> Add Member
            </button>
          </div>

          {/* Search bar & filter pills row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by name or chest number..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            
            {/* Team filter pills */}
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>
                Filter by Team:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFilterTeam('')}
                  className={`btn ${filterTeam === '' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: 'var(--radius-full)',
                    boxShadow: filterTeam === '' ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none'
                  }}
                >
                  All Teams
                </button>
                {teams.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilterTeam(t.id.toString())}
                    className={`btn ${filterTeam === t.id.toString() ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: 'var(--radius-full)',
                      boxShadow: filterTeam === t.id.toString() ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none'
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter pills */}
            <div>
              <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>
                Filter by Category:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFilterCategory('')}
                  className={`btn ${filterCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.35rem 0.85rem', 
                    borderRadius: 'var(--radius-full)',
                    background: filterCategory === '' ? 'var(--info)' : 'var(--bg-overlay)',
                    borderColor: filterCategory === '' ? 'var(--info)' : 'var(--border)',
                    color: filterCategory === '' ? '#ffffff' : 'var(--text-secondary)',
                    boxShadow: filterCategory === '' ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCategory(c.id.toString())}
                    className={`btn ${filterCategory === c.id.toString() ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: 'var(--radius-full)',
                      background: filterCategory === c.id.toString() ? 'var(--info)' : 'var(--bg-overlay)',
                      borderColor: filterCategory === c.id.toString() ? 'var(--info)' : 'var(--border)',
                      color: filterCategory === c.id.toString() ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: filterCategory === c.id.toString() ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none'
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
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
                  <th>Event Registrations</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--secondary-neon)' }}>{m.chest_no || 'TBD'}</td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.team_name}</td>
                    <td><span className="tag tag-primary">{m.category_name}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {m.registered_programs_details?.map(p => (
                          <span key={p.id} className="tag tag-success" style={{ fontSize: '0.7rem' }}>{p.name}</span>
                        )) || []}
                        {(!m.registered_programs_details || m.registered_programs_details.length === 0) && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registrations</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(m)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Manage Events
                        </button>
                        <button onClick={() => handleDeleteMember(m.id, m.name)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                      No members registered in the registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          ADD MEMBER VIEW
      ──────────────────────────────────────────────────────── */}
      {view === 'add' && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <button onClick={() => setView('list')} className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronLeft size={16} /> Back to Registry
          </button>
          
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus style={{ color: 'var(--primary-neon)' }} /> Add Member & Registrations
            </h3>
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter member's full name"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Card Selector Grid for Team (High-Contrast Theme-Compliant) */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Team</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {teams.map(t => {
                    const isSelected = memberTeam === t.id.toString();
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMemberTeam(t.id.toString())}
                        disabled={submitting}
                        className="btn"
                        style={{
                          background: isSelected ? 'var(--accent-soft)' : 'var(--bg-overlay)',
                          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                          color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? '700' : '500',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Selector Grid for Category (High-Contrast Theme-Compliant) */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Select Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {categories.map(c => {
                    const isSelected = memberCategory === c.id.toString();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setMemberCategory(c.id.toString())}
                        disabled={submitting}
                        className="btn"
                        style={{
                          background: isSelected ? 'var(--info-soft)' : 'var(--bg-overlay)',
                          border: isSelected ? '2px solid var(--info)' : '1px solid var(--border)',
                          color: isSelected ? 'var(--info)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? '700' : '500',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.2)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show categorized events (Category-Specific vs General) */}
              {memberCategory && (
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '1rem' }}>Choose Event Registrations</label>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem', 
                    maxHeight: '350px', 
                    overflowY: 'auto', 
                    padding: '1rem', 
                    background: 'rgba(0,0,0,0.18)', 
                    borderRadius: '10px',
                    border: '1px solid var(--border)'
                  }}>
                    {/* 1. Category Specific Events */}
                    {(() => {
                      const activeCat = categories.find(c => c.id === parseInt(memberCategory));
                      const activeCatName = activeCat ? activeCat.name : "Category";
                      const specificPrograms = programs.filter(p => p.category === parseInt(memberCategory));
                      
                      if (specificPrograms.length === 0) return null;
                      return (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                            {activeCatName} Category Specific Events
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                            {specificPrograms.map(p => renderCheckCard(p, 'accent', memberTeam, null))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 2. General / Open Category Events */}
                    {(() => {
                      const generalCat = categories.find(c => c.id === generalCatId);
                      const generalCatName = generalCat ? generalCat.name : "General/Open";
                      const generalPrograms = programs.filter(p => p.category === generalCatId);
                      
                      if (generalPrograms.length === 0 || generalCatId === parseInt(memberCategory)) return null;
                      return (
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                            {generalCatName} Category Events
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                            {generalPrograms.map(p => renderCheckCard(p, 'info', memberTeam, null))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* No programs found at all */}
                    {programs.filter(p => p.category === parseInt(memberCategory) || p.category === generalCatId).length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem' }}>No events found for this category.</p>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '0.85rem' }} disabled={submitting}>
                {submitting ? <RefreshCw className="spinning" size={18} /> : "Register Member & Assign Chest No"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          EDIT MEMBER REGISTRATIONS VIEW
      ──────────────────────────────────────────────────────── */}
      {view === 'edit' && selectedMember && (
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <button onClick={() => setView('list')} className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronLeft size={16} /> Back to Registry
          </button>
          
          <div className="glass-panel">
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ color: 'var(--secondary-neon)' }} /> Manage Event Registrations
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Manually add or remove registered programs for: <strong>{selectedMember.name}</strong> (Chest: {selectedMember.chest_no || 'TBD'})
            </p>

            <div className="grid-cols-2" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Team</span>
                <div style={{ fontWeight: 600 }}>{selectedMember.team_name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category Limit</span>
                <div style={{ fontWeight: 600 }}>{selectedMember.category_name}</div>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '1rem' }}>Registered Programs & Events</label>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.5rem', 
                  maxHeight: '350px', 
                  overflowY: 'auto', 
                  padding: '1rem', 
                  background: 'rgba(0,0,0,0.18)', 
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  {/* 1. Category Specific Events */}
                  {(() => {
                    const specificPrograms = programs.filter(p => p.category === selectedMember.category);
                    
                    if (specificPrograms.length === 0) return null;
                    return (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                          {selectedMember.category_name} Category Specific Events
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                          {specificPrograms.map(p => renderCheckCard(p, 'accent', selectedMember.team, selectedMember.id))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. General / Open Category Events */}
                  {(() => {
                    const generalCat = categories.find(c => c.id === generalCatId);
                    const generalCatName = generalCat ? generalCat.name : "General/Open";
                    const generalPrograms = programs.filter(p => p.category === generalCatId);
                    
                    if (generalPrograms.length === 0 || generalCatId === selectedMember.category) return null;
                    return (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>
                          {generalCatName} Category Events
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                          {generalPrograms.map(p => renderCheckCard(p, 'info', selectedMember.team, selectedMember.id))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* No programs found at all */}
                  {programs.filter(p => p.category === selectedMember.category || p.category === generalCatId).length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem', gridColumn: '1 / -1' }}>No events found for this category.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '0.85rem' }} disabled={submitting}>
                {submitting ? <RefreshCw className="spinning" size={18} /> : "Save Registration Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
