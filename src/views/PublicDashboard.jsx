

import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { Award, Users, RefreshCw, Trophy, Medal, ChevronLeft, Search, Download, FileText, Menu, X } from 'lucide-react';




export default function PublicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('results');
  const [selectedProgramResults, setSelectedProgramResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsCategoryFilter, setResultsCategoryFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contentRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
      if (!res.ok) throw new Error("Failed to fetch public stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchProgramResults = async (progId) => {
    setResultsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/?program=${progId}&published_only=true`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const json = await res.json();
      setSelectedProgramResults({
        programId: progId,
        programName: data?.programs_with_results.find(p => p.id === progId)?.name || 'Event Results',
        categoryName: data?.programs_with_results.find(p => p.id === progId)?.category_name || '',
        results: json
      });
    } catch (err) {
      console.error(err);
    } finally {
      setResultsLoading(false);
    }
  };

  const goToSection = (key) => {
    setActiveSection(key);
    setSelectedProgramResults(null);
    setMobileMenuOpen(false);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <RefreshCw className="spinning" size={36} style={{ color: 'var(--accent)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading live scoreboard…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Connection Error</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  const { fest_settings, leaderboard, individual_leaderboard, programs_with_results } = data || {};

  const filteredPublishedPrograms = (programs_with_results || []).filter(prog => {
    if (resultsSearch && !prog.name.toLowerCase().includes(resultsSearch.toLowerCase())) return false;
    if (resultsCategoryFilter !== 'all' && prog.category_name !== resultsCategoryFilter) return false;
    return true;
  });

  const rankColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];

  const categoryCount = new Set(
    [
      ...(programs_with_results || []).map(p => p.category_name),
      ...(individual_leaderboard || []).map(c => c.category_name),
    ].filter(Boolean)
  ).size;

  const navBtnReset = { background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' };
  const isTabActive = (key) => activeSection === key && !selectedProgramResults;

  return (
    <div>

      {/* ─── Public Navbar (reuses the app's real .navbar / .nav-link classes) ─── */}
      <nav className="navbar" style={{ borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', position: 'sticky', top: 0 }}>
        <div className="nav-brand" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
          <Trophy size={22} style={{ color: 'var(--accent)' }} />
          <span className="gradient-text">{fest_settings?.fest_name || 'FestAlchemy'}</span>
        </div>

        {/* Desktop links */}
        <div className="nav-links desktop-only">
          <button onClick={scrollToTop} className="nav-link" style={navBtnReset}>Home</button>
          <button onClick={() => goToSection('standings')} className={`nav-link ${isTabActive('standings') ? 'active' : ''}`} style={navBtnReset}>Team Standings</button>
          <button onClick={() => goToSection('results')} className={`nav-link ${isTabActive('results') ? 'active' : ''}`} style={navBtnReset}>Results</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Point this at your actual login route / AuthContext flow */}
          <a href="/login" className="btn btn-primary desktop-only" style={{ fontSize: '0.8rem' }}>Login</a>
          <button
            className="theme-toggle mobile-only"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="glass-panel mobile-only public-mobile-menu" style={{ marginTop: '-1rem', marginBottom: '1.5rem', flexDirection: 'column', gap: '0.35rem' }}>
          <button onClick={scrollToTop} className="nav-link" style={{ ...navBtnReset, textAlign: 'left', width: '100%' }}>Home</button>
          <button onClick={() => goToSection('standings')} className={`nav-link ${isTabActive('standings') ? 'active' : ''}`} style={{ ...navBtnReset, textAlign: 'left', width: '100%' }}>Team Standings</button>
          <button onClick={() => goToSection('results')} className={`nav-link ${isTabActive('results') ? 'active' : ''}`} style={{ ...navBtnReset, textAlign: 'left', width: '100%' }}>Results</button>
          <a href="/login" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>Login</a>
        </div>
      )}

      {/* ─── Hero Banner ─── */}
      <div className="glass-panel hero-banner" style={{ marginBottom: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '3rem 1.5rem' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(var(--accent), transparent 70%)', filter: 'blur(40px)', opacity: '0.12', pointerEvents: 'none' }} />

        {fest_settings?.logo && (
          <img src={`${API_BASE_URL}${fest_settings.logo}`} alt="logo" style={{ maxHeight: '100px', marginBottom: '0.75rem', objectFit: 'contain' }} />
        )}

        <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
          {fest_settings?.fest_name || "FestAlchemy"} {fest_settings?.year || 2026}
        </h1>
        {fest_settings?.tagline && (
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, maxWidth: '500px', margin: '0 auto' }}>
            {fest_settings.tagline}
          </p>
        )}

        {/* Optional — only renders if your fest_settings model has these fields */}
        {(fest_settings?.start_date || fest_settings?.venue) && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {fest_settings?.start_date}{fest_settings?.end_date ? ` – ${fest_settings.end_date}` : ''}
            {fest_settings?.start_date && fest_settings?.venue ? '  •  ' : ''}
            {fest_settings?.venue}
          </p>
        )}

        <div className="btn-group-responsive" style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginTop: '1.75rem' }}>
          <button
            onClick={() => goToSection('results')}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.6rem', fontSize: '0.9rem' }}
          >
            <Award size={16} /> View Results
          </button>
          <button
            onClick={() => goToSection('standings')}
            className="btn btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.6rem', fontSize: '0.9rem' }}
          >
            <Trophy size={16} /> Team Standings
          </button>
        </div>
      </div>

      {/* ─── About / Live Stats ─── */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '2rem 1.75rem' }}>
        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span
              className="tag tag-primary"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.7rem', marginBottom: '0.85rem', display: 'inline-block' }}
            >
              Live &amp; Updating
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '0.6rem' }}>
              One scoreboard, every event
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px' }}>
              {fest_settings?.description ||
                "Every program, every point, tracked as it happens — from category heats to the final tally. Browse team standings, individual leaderboards, and published results as soon as judges submit them, all in one place."}
            </p>
          </div>

          <div className="db-stats-grid" style={{ flex: '1 1 320px', gap: '0.85rem' }}>
            {[
              { icon: <Users size={20} />, value: leaderboard?.length || 0, label: 'Teams', color: 'var(--accent)', soft: 'var(--accent-soft)' },
              { icon: <Award size={20} />, value: programs_with_results?.length || 0, label: 'Events Published', color: 'var(--success)', soft: 'var(--success-soft)' },
              { icon: <Medal size={20} />, value: categoryCount, label: 'Categories', color: 'var(--info)', soft: 'var(--info-soft)' },
            ].map((stat) => (
              <div key={stat.label} className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">{stat.label}</span>
                  <span className="db-stat-value">{stat.value}</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: stat.soft, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Section Tabs ─── */}
      <div ref={contentRef} className="dashboard-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'standings', label: 'Team Standings', icon: <Trophy size={16} /> },
          { key: 'results', label: 'Results', icon: <Award size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveSection(tab.key); setSelectedProgramResults(null); }}
            className={`btn ${activeSection === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content Panel ─── */}
      <div className="glass-panel">

        {/* ═══ TEAM STANDINGS ═══ */}
        {activeSection === 'standings' && (
          <div>
            <h2 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.35rem', flexWrap: 'wrap' }}>
              <Trophy size={22} style={{ color: 'var(--gold)' }} /> Live Team Standings
              {fest_settings?.published_standings_limit > 0 && (
                <span className="tag tag-primary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  After {fest_settings.published_standings_limit} Events
                </span>
              )}
            </h2>
            {fest_settings?.publish_team_standings === false ? (
              <div className="empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <Trophy size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>Team Standings Not Published Yet</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Overall team standings are currently hidden by event management. Check back soon for updated scores!
                </p>
              </div>
            ) : leaderboard?.length === 0 ? (
              <div className="empty-state"><p>No scores computed yet.</p></div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Rank</th>
                      <th>Team</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.map((team, idx) => {
                      const rank = idx + 1;
                      const isTop3 = rank <= 3;
                      const color = isTop3 ? rankColors[rank - 1] : 'var(--text-muted)';

                      return (
                        <tr key={team.id}>
                          <td>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.82rem',
                              background: isTop3 ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--bg-hover)',
                              color: color,
                              border: `2px solid ${isTop3 ? color : 'var(--border)'}`,
                            }}>
                              {rank}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '0.95rem' }}>{team.team_name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: isTop3 ? color : 'var(--text-primary)' }}>
                            {team.total_points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}



        {/* ═══ RESULTS ═══ */}
        {activeSection === 'results' && (
          <div>
            {/* If viewing a specific event's results */}
            {selectedProgramResults ? (
              <div>
                {/* Back button + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => setSelectedProgramResults(null)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '1.25rem' }}>
                      {selectedProgramResults.programName}
                    </h2>
                    {selectedProgramResults.categoryName && (
                      <span className="tag tag-primary" style={{ fontSize: '0.65rem', marginTop: '0.2rem', display: 'inline-block' }}>
                        {selectedProgramResults.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                {resultsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <RefreshCw className="spinning" size={28} style={{ color: 'var(--accent)' }} />
                  </div>
                ) : (
                  <div>
                    {/* Results Table */}
                    <div className="table-container" style={{ marginBottom: '1.25rem' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Rank</th>
                            <th>Participant</th>
                            <th className="desktop-only">Team</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Score</th>
                            <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProgramResults.results.map((res) => {
                            const isTop3 = res.rank <= 3;
                            const color = isTop3 ? rankColors[res.rank - 1] : 'var(--text-muted)';

                            return (
                              <tr key={res.id}>
                                <td>
                                  <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.8rem',
                                    background: isTop3 ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--bg-hover)',
                                    color: color,
                                    border: `2px solid ${isTop3 ? color : 'var(--border)'}`,
                                  }}>
                                    {res.rank}
                                  </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                  {res.member_name}
                                  <div className="mobile-only" style={{ display: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400, marginTop: '0.15rem' }}>
                                    {res.team_name}
                                  </div>
                                </td>
                                <td className="desktop-only" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{res.team_name}</td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                  {res.total_marks != null ? res.total_marks : '—'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {res.grade ? (
                                    <span className="tag tag-success" style={{ fontSize: '0.7rem' }}>{res.grade}</span>
                                  ) : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Poster Buttons */}
                    <div className="btn-group-responsive" style={{ display: 'flex', gap: '0.75rem' }}>
                      <a
                        href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgramResults.programId}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <FileText size={14} /> View Poster
                      </a>
                      <a
                        href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgramResults.programId}/?download=1`}
                        download
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Event list view */
              <div>
                <h2 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.35rem' }}>
                  <Award size={22} style={{ color: 'var(--accent)' }} /> Published Results
                </h2>

                {programs_with_results?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search events…"
                        value={resultsSearch}
                        onChange={e => setResultsSearch(e.target.value)}
                        style={{ paddingLeft: '2.2rem', height: '36px', fontSize: '0.85rem' }}
                      />
                    </div>
                    {/* Category pills */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setResultsCategoryFilter('all')}
                        className={`btn ${resultsCategoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)' }}
                      >
                        All
                      </button>
                      {Array.from(new Set(programs_with_results.map(p => p.category_name))).filter(Boolean).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setResultsCategoryFilter(cat)}
                          className={`btn ${resultsCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredPublishedPrograms.length === 0 ? (
                  <div className="empty-state">
                    <p>{programs_with_results?.length === 0 ? 'No results published yet.' : 'No matching events found.'}</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>Event</th>
                          <th className="desktop-only" style={{ width: '110px' }}>Category</th>
                          <th style={{ width: '100px', textAlign: 'right' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPublishedPrograms.map((prog, idx) => (
                          <tr
                            key={prog.id}
                            onClick={() => fetchProgramResults(prog.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>
                              {prog.name}
                              <div className="mobile-only" style={{ display: 'none', marginTop: '0.2rem' }}>
                                <span className="tag tag-primary" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                                  {prog.category_name}
                                </span>
                              </div>
                            </td>
                            <td className="desktop-only">
                              <span className="tag tag-primary" style={{ fontSize: '0.68rem' }}>{prog.category_name}</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                                View →
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}