import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Award, RefreshCw, CheckCircle, Trash, Edit, Search, Filter, 
  MoreVertical, FileText, Download, Check
} from 'lucide-react';
import { UIContext } from '../App';
import { API_BASE_URL } from '../context/AuthContext';

export default function ScoringResults({
  programs,
  resultsProgramId,
  setResultsProgramId,
  onFetchResults,
  onComputeResults,
  resultsLoading,
  computedResults,
  publishStatus,
  onTogglePublish,
  onDeleteResult,
  onOpenModal,
  teams = [],
  token
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast, confirm } = useContext(UIContext);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all', 'pending', 'inprogress', 'submitted', 'published'
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [results, setResults] = useState([]);
  const [onlyPublished, setOnlyPublished] = useState(true);
  const [afterCount, setAfterCount] = useState('');

  // Close menus on click outside
  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null);
    document.addEventListener('click', handleCloseMenu);
    return () => document.removeEventListener('click', handleCloseMenu);
  }, []);

  // Fetch all results to calculate standings dynamically on frontend
  const fetchResultsData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setResults(json);
      }
    } catch (err) {
      console.error("Error fetching all results:", err);
    }
  };

  useEffect(() => {
    fetchResultsData();
  }, [programs, token, publishStatus]);

  // Determine target programs based on whether we filter only published or all calculated results
  const targetPrograms = useMemo(() => {
    const list = programs.filter(p => onlyPublished ? p.is_published : p.has_results);
    return [...list].sort((a, b) => a.id - b.id);
  }, [programs, onlyPublished]);

  const maxLimit = targetPrograms.length;

  // Sync afterCount with maxLimit when maxLimit changes
  useEffect(() => {
    setAfterCount(maxLimit.toString());
  }, [maxLimit]);

  // Get active program IDs based on the limited afterCount
  const activeProgramIds = useMemo(() => {
    const limitVal = parseInt(afterCount, 10);
    const sliced = (!isNaN(limitVal) && limitVal >= 0) 
      ? targetPrograms.slice(0, limitVal) 
      : targetPrograms;
    return new Set(sliced.map(p => p.id));
  }, [targetPrograms, afterCount]);

  // Dynamic status counts
  const pendingCount = programs.filter(p => !p.has_results).length;
  const inProgressCount = 0; // Standard default as shown in layout
  const submittedCount = programs.filter(p => p.has_results && !p.is_published).length;
  const publishedCount = programs.filter(p => p.is_published).length;

  // Extract unique categories for secondary filtering
  const uniqueCategories = Array.from(new Set(programs.map(p => p.category_name))).filter(Boolean);

  // Filter programs based on tabs, dropdown, and search query
  const filteredPrograms = programs.filter(p => {
    // 1. Search Query
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 2. Status Tab
    if (activeStatusTab === 'pending' && p.has_results) return false;
    if (activeStatusTab === 'inprogress') return false; // Default to empty
    if (activeStatusTab === 'submitted' && (!p.has_results || p.is_published)) return false;
    if (activeStatusTab === 'published' && !p.is_published) return false;

    // 3. Category Dropdown
    if (categoryFilter !== 'all' && p.category_name !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Calculate live team standings dynamically
  const computedStandings = useMemo(() => {
    const pointsMap = {};
    // Initialize all teams to 0
    teams.forEach(t => {
      pointsMap[t.name] = 0;
    });

    // Sum points from results
    results.forEach(r => {
      if (!activeProgramIds.has(r.program)) return;
      if (r.team_name) {
        pointsMap[r.team_name] = (pointsMap[r.team_name] || 0) + r.points;
      }
    });

    // Convert map to sorted list
    const sorted = Object.entries(pointsMap)
      .map(([teamName, points]) => ({ team_name: teamName, total_points: points }))
      .sort((a, b) => b.total_points - a.total_points);

    // Assign ranks with dense tie handling
    let currentRank = 0;
    let previousPoints = null;
    return sorted.map((team) => {
      if (previousPoints === null || team.total_points !== previousPoints) {
        currentRank++;
      }
      previousPoints = team.total_points;

      let rankText = `${currentRank}th`;
      if (currentRank === 1) rankText = '🥇 1st';
      else if (currentRank === 2) rankText = '🥈 2nd';
      else if (currentRank === 3) rankText = '🥉 3rd';

      return {
        ...team,
        rank: currentRank,
        rankText: rankText
      };
    });
  }, [results, activeProgramIds, teams]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Place', 'Team', 'Points'];
    const rows = computedStandings.map((t) => {
      const rankSuffix = t.rank === 1 ? '1st' : t.rank === 2 ? '2nd' : t.rank === 3 ? '3rd' : `${t.rank}th`;
      return [
        rankSuffix,
        t.team_name,
        `${t.total_points}`
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `team_standings_after_${afterCount}_events.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF Standings Report
  const handlePrintStandings = () => {
    const printWindow = window.open('', '_blank');
    const rowsHtml = computedStandings.map((t) => `
      <tr>
        <td>${t.rankText}</td>
        <td>${t.team_name}</td>
        <td>${t.total_points}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Team Standings Report</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #333; }
            h2 { margin-bottom: 5px; text-align: center; }
            h4 { text-align: center; color: #666; margin-top: 0; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
          </style>
        </head>
        <body>
          <h2>Overall Team Standings</h2>
          <h4>Generated after ${publishedCount} published events</h4>
          <table>
            <thead>
              <tr>
                <th>Place</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Publish all computed but draft results
  const handlePublishAll = async () => {
    const unpublished = programs.filter(p => p.has_results && !p.is_published);
    if (unpublished.length === 0) {
      showToast("No unpublished results to publish.", "warning");
      return;
    }
    const confirmed = await confirm("Publish Results", `Are you sure you want to publish results for all ${unpublished.length} programs?`);
    if (!confirmed) {
      return;
    }
    for (const prog of unpublished) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/results/toggle_publish/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ program_id: prog.id })
        });
      } catch (err) {
        console.error(err);
      }
    }
    showToast("All results published successfully!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div>
      {!resultsProgramId ? (
        <div>
          {/* Main Headers */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Results</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>Manage and reorder competition results, and view team points</p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* LEFT COLUMN: Competitions Board */}
            <div style={{ flex: 1.6, minWidth: '350px' }} className="glass-panel">
              {/* Pills Filters Row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {/* Pending Pill */}
                <button 
                  onClick={() => setActiveStatusTab(activeStatusTab === 'pending' ? 'all' : 'pending')}
                  className={`pill-filter pill-pending ${activeStatusTab === 'pending' ? 'active' : ''}`}
                >
                  <span>Pending</span>
                  <span className="pill-count">{pendingCount}</span>
                </button>

                {/* In Progress Pill */}
                <button 
                  onClick={() => setActiveStatusTab(activeStatusTab === 'inprogress' ? 'all' : 'inprogress')}
                  className={`pill-filter pill-inprogress ${activeStatusTab === 'inprogress' ? 'active' : ''}`}
                >
                  <span>In Progress</span>
                  <span className="pill-count">{inProgressCount}</span>
                </button>

                {/* Submitted Pill */}
                <button 
                  onClick={() => setActiveStatusTab(activeStatusTab === 'submitted' ? 'all' : 'submitted')}
                  className={`pill-filter pill-submitted ${activeStatusTab === 'submitted' ? 'active' : ''}`}
                >
                  <span>Submitted</span>
                  <span className="pill-count">{submittedCount}</span>
                </button>

                {/* Published Pill */}
                <button 
                  onClick={() => setActiveStatusTab(activeStatusTab === 'published' ? 'all' : 'published')}
                  className={`pill-filter pill-published ${activeStatusTab === 'published' ? 'active' : ''}`}
                >
                  <span>Published</span>
                  <span className="pill-count">{publishedCount}</span>
                </button>
              </div>

              {/* Search & Actions Row */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search results..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.875rem' }}
                  />
                </div>
                
                {/* Secondary Category Filter Dropdown */}
                <div style={{ position: 'relative', width: '160px' }}>
                  <Filter size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select
                    className="form-control"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ paddingLeft: '2rem', height: '38px', fontSize: '0.85rem' }}
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handlePublishAll}
                  className="btn btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', fontSize: '0.85rem', padding: '0 1rem' }}
                >
                  <CheckCircle size={14} /> Publish All
                </button>
              </div>

              {/* Competitions Table */}
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '0.92rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Competition</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '60px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.map((p, idx) => {
                      let statusText = 'Pending';
                      let statusClass = 'tag-secondary';
                      if (p.is_published) {
                        statusText = 'Published';
                        statusClass = 'tag-success';
                      } else if (p.has_results) {
                        statusText = 'Submitted';
                        statusClass = 'tag-warning';
                      }

                      return (
                        <tr key={p.id}>
                          <td style={{ color: 'var(--text-muted)' }}>#{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{p.category_name}</div>
                          </td>
                          <td>
                            <span className={`tag ${statusClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                              {statusText}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap', position: 'relative' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              {p.is_published ? (
                                <button
                                  onClick={() => {
                                    setResultsProgramId(p.id.toString());
                                    onFetchResults(p.id.toString());
                                  }}
                                  className="btn btn-secondary"
                                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', height: '30px' }}
                                >
                                  View
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setResultsProgramId(p.id.toString());
                                    onFetchResults(p.id.toString());
                                  }}
                                  className="btn btn-primary"
                                  style={{ 
                                    fontSize: '0.78rem', 
                                    padding: '0.35rem 0.7rem', 
                                    background: 'var(--accent)', 
                                    borderColor: 'var(--accent)',
                                    color: '#ffffff',
                                    height: '30px'
                                  }}
                                >
                                  Compute
                                </button>
                              )}

                              {p.has_results && (
                                <div style={{ position: 'relative' }}>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(activeMenuId === p.id ? null : p.id);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.4rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', height: '30px', display: 'flex', alignItems: 'center' }}
                                  >
                                    <MoreVertical size={16} />
                                  </button>

                                  {activeMenuId === p.id && (
                                    <div style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: '100%',
                                      zIndex: 10,
                                      background: 'var(--bg-overlay)',
                                      border: '1px solid var(--border-glass)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                      minWidth: '110px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      padding: '0.25rem'
                                    }}>
                                      <button
                                        onClick={() => {
                                          onTogglePublish(p.id.toString());
                                          setActiveMenuId(null);
                                        }}
                                        className="btn-menu-item"
                                        style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.78rem', background: 'transparent', border: 'none', color: p.is_published ? 'var(--danger-neon)' : 'var(--success-neon)', width: '100%', cursor: 'pointer' }}
                                      >
                                        {p.is_published ? 'Unpublish' : 'Publish'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPrograms.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No events match criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Team Standings */}
            <div style={{ flex: 1, minWidth: '300px' }} className="glass-panel">
              {/* Standings Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  fontSize: '0.8rem', 
                  background: 'var(--bg-overlay)', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-secondary)' 
                }}>
                  <span>After</span>
                  <input
                    type="number"
                    min="0"
                    max={maxLimit}
                    value={afterCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setAfterCount('');
                        return;
                      }
                      const num = parseInt(val, 10);
                      if (!isNaN(num) && num >= 0) {
                        setAfterCount(Math.min(num, maxLimit).toString());
                      }
                    }}
                    style={{
                      width: '45px',
                      height: '20px',
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      outline: 'none',
                      padding: 0
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    onClick={handlePrintStandings} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Export Standings to PDF"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button 
                    onClick={handleExportCSV} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Export Standings to CSV"
                  >
                    <Download size={12} /> CSV
                  </button>
                </div>
              </div>

              {/* Only Published Filter Checkbox */}
              <div 
                onClick={() => setOnlyPublished(!onlyPublished)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer', 
                  marginBottom: '1.5rem',
                  userSelect: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-glass)',
                  background: onlyPublished ? 'var(--danger-neon)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}>
                  {onlyPublished && <Check size={12} style={{ color: '#fff' }} />}
                </div>
                <span>Only Published</span>
              </div>

              {/* Standings list table */}
              <div className="table-container" id="standings-print-area">
                <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Place</th>
                      <th>Team</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedStandings.map((team) => {
                      return (
                        <tr key={team.team_name}>
                          <td>
                            {team.rank <= 3 ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: '#1a1a1a',
                                background: team.rank === 1 ? '#ffd700' : team.rank === 2 ? '#c0c0c0' : '#cd7f32',
                                boxShadow: '0 0 6px ' + (team.rank === 1 ? 'rgba(255,215,0,0.4)' : team.rank === 2 ? 'rgba(192,192,192,0.4)' : 'rgba(205,127,50,0.4)')
                              }}>
                                {team.rank}
                              </span>
                            ) : (
                              <span style={{ paddingLeft: '0.4rem', color: 'var(--text-muted)' }}>
                                {team.rankText}
                              </span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{team.team_name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {team.total_points}
                          </td>
                        </tr>
                      );
                    })}
                    {computedStandings.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No team scores recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Computed Event Rankings View (Remains unchanged/same layout) */
        <div>
          <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <button 
                onClick={() => { setResultsProgramId(''); }} 
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                &larr; Back to Program List
              </button>
              
              <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                <h3 style={{ color: 'var(--secondary-neon)', fontFamily: 'var(--font-display)', margin: 0 }}>
                  {programs.find(p => p.id.toString() === resultsProgramId)?.name || 'Selected Program'}
                </h3>
                <span className="tag tag-primary" style={{ fontSize: '0.65rem', marginTop: '0.25rem', display: 'inline-block' }}>
                  {programs.find(p => p.id.toString() === resultsProgramId)?.category_name || ''}
                </span>
              </div>
              
              <button 
                onClick={onComputeResults} 
                className="btn btn-primary" 
                disabled={resultsLoading}
              >
                {resultsLoading ? <RefreshCw className="spinning" size={16} /> : <Award size={16} />} Compute Rankings
              </button>
            </div>
          </div>

          {resultsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <RefreshCw className="spinning" size={30} style={{ color: 'var(--primary-neon)' }} />
            </div>
          ) : computedResults.length > 0 && (
            <div className="glass-panel animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    Computed Event Rankings
                    <span className={`tag ${publishStatus ? 'tag-success' : 'tag-warning'}`} style={{ fontSize: '0.7rem' }}>
                      Team Points: {publishStatus ? 'Added' : 'Draft'}
                    </span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Calculated points and weights successfully.</p>
                </div>
                
                <button 
                  onClick={() => onTogglePublish(resultsProgramId)} 
                  className={`btn ${publishStatus ? 'btn-success' : 'btn-secondary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={16} /> {publishStatus ? 'Published to Leaderboard' : 'Draft (Click to Publish)'}
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Rank</th>
                      <th>Chest No</th>
                      <th>Participant</th>
                      <th>Team</th>
                      <th>Avg Score</th>
                      <th>Grade</th>
                      <th>Points Awarded</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedResults.map((r, idx) => (
                      <tr key={r.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 'bold' }}>#{r.rank}</td>
                        <td style={{ color: 'var(--secondary-neon)', fontWeight: 'bold' }}>{r.member_chest_no || 'N/A'}</td>
                        <td style={{ fontWeight: 600 }}>{r.member_name}</td>
                        <td>{r.team_name}</td>
                        <td>{r.total_marks}</td>
                        <td>{r.grade || 'N/A'}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--success-neon)' }}>{r.points} pts</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => onOpenModal('edit-result', r)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit Result"><Edit size={14} /></button>
                            <button onClick={() => onDeleteResult('results', r.id)} className="btn btn-danger" style={{ padding: '0.3rem' }} title="Delete Result"><Trash size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
