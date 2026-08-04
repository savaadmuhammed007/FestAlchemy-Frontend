import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { Award, RefreshCw, ArrowLeft, Search, ChevronLeft, Download, FileText, Trophy, Medal, Sparkles, Filter } from 'lucide-react';

export default function ResultsPage() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programResults, setProgramResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
      if (!res.ok) throw new Error('Failed to fetch results data');
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

  // Auto-open program from navigation state (e.g. clicking result card on HomePage)
  useEffect(() => {
    if (data && location.state?.openProgram && !selectedProgram) {
      fetchProgramResults(location.state.openProgram);
      // Clear the state so it doesn't re-trigger on data refresh
      window.history.replaceState({}, '');
    }
  }, [data]);

  const fetchProgramResults = async (prog) => {
    setResultsLoading(true);
    setSelectedProgram(prog);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/?program=${prog.id}&published_only=true`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const json = await res.json();
      setProgramResults(json);
    } catch (err) {
      console.error(err);
    } finally {
      setResultsLoading(false);
    }
  };

  const goBack = () => {
    setSelectedProgram(null);
    setProgramResults(null);
  };

  const fest = data?.fest_settings;
  const publishedPrograms = data?.programs_with_results || [];

  // Unique categories
  const categories = [...new Set(publishedPrograms.map(p => p.category_name).filter(Boolean))];

  // Filter programs
  const filteredPrograms = publishedPrograms.filter(prog => {
    if (searchQuery && !prog.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (categoryFilter !== 'all' && prog.category_name !== categoryFilter) return false;
    return true;
  });

  const rankMeta = [
    { color: 'var(--gold)', bg: 'rgba(245,158,11,0.12)' },
    { color: 'var(--silver)', bg: 'rgba(148,163,184,0.12)' },
    { color: 'var(--bronze)', bg: 'rgba(217,119,6,0.12)' },
  ];

  if (loading && !data) {
    return (
      <div className="rs-loading">
        <RefreshCw className="spinning" size={36} style={{ color: 'var(--accent)' }} />
        <p>Loading published results…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rs-error-box">
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button onClick={fetchData} className="rs-retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="rs-page">

      {/* ─── Page Header ─── */}
      <div className="rs-page-header">
        <Link to="/" className="rs-back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="rs-page-title-area">
          <div className="rs-title-badge">
            <Sparkles size={14} />
            <span>Official Results</span>
          </div>
          <h1 className="rs-page-title">Event Results</h1>
          <p className="rs-page-subtitle">
            {fest?.fest_name || 'FestAlchemy'} {fest?.year || new Date().getFullYear()} — Browse all published event results, rankings, and grades.
          </p>
        </div>

        <div className="rs-header-stats">
          <div className="rs-hs-item">
            <Award size={18} />
            <span className="rs-hs-val">{publishedPrograms.length}</span>
            <span className="rs-hs-label">Events Published</span>
          </div>
          <div className="rs-hs-item">
            <Filter size={18} />
            <span className="rs-hs-val">{categories.length}</span>
            <span className="rs-hs-label">Categories</span>
          </div>
        </div>
      </div>

      {/* ─── Detail View: Specific Program Results ─── */}
      {selectedProgram ? (
        <div className="rs-detail-section">
          <button onClick={goBack} className="rs-back-btn">
            <ChevronLeft size={18} />
            <span>Back to All Results</span>
          </button>

          <div className="rs-detail-header">
            <h2 className="rs-detail-title">{selectedProgram.name}</h2>
            {selectedProgram.category_name && (
              <span className="rs-detail-cat-pill">{selectedProgram.category_name}</span>
            )}
          </div>

          {resultsLoading ? (
            <div className="rs-detail-loading">
              <RefreshCw className="spinning" size={28} style={{ color: 'var(--accent)' }} />
            </div>
          ) : programResults && programResults.length > 0 ? (
            <>
              {/* Top 3 Winners Showcase */}
              <div className="rs-winners-showcase">
                {programResults.slice(0, 3).map((res) => {
                  const isTop3 = res.rank <= 3;
                  const meta = rankMeta[res.rank - 1] || {};
                  return (
                    <div key={res.id} className={`rs-winner-card rs-winner-card--r${res.rank}`}>
                      <div className="rs-winner-rank-circle" style={{
                        background: meta.bg || 'var(--bg-hover)',
                        color: meta.color || 'var(--text-muted)',
                        borderColor: meta.color || 'var(--border)',
                      }}>
                        #{res.rank}
                      </div>
                      <h4 className="rs-winner-name">{res.member_name}</h4>
                      <span className="rs-winner-team">{res.team_name}</span>
                      {res.member_chest_no && <span className="rs-winner-chest">Chest #{res.member_chest_no}</span>}
                      <div className="rs-winner-score-row">
                        {res.total_marks != null && (
                          <span className="rs-winner-score">{res.total_marks} marks</span>
                        )}
                        {res.grade && (
                          <span className="rs-winner-grade">{res.grade}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Results Table */}
              <div className="rs-table-wrap">
                <table className="rs-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Participant</th>
                      <th className="rs-desktop-only">Team</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Score</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programResults.map((res) => {
                      const isTop3 = res.rank <= 3;
                      const meta = rankMeta[res.rank - 1] || {};
                      const color = meta.color || 'var(--text-muted)';
                      return (
                        <tr key={res.id} className={isTop3 ? 'rs-row--top' : ''}>
                          <td>
                            <div className="rs-rank-badge" style={{
                              background: isTop3 ? meta.bg : 'var(--bg-hover)',
                              color: color,
                              borderColor: isTop3 ? color : 'var(--border)',
                            }}>
                              {res.rank}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{res.member_name}</span>
                            {res.member_chest_no && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                                #{res.member_chest_no}
                              </span>
                            )}
                            <div className="rs-mobile-only" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                              {res.team_name}
                            </div>
                          </td>
                          <td className="rs-desktop-only" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {res.team_name}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>
                            {res.total_marks != null ? res.total_marks : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {res.grade ? (
                              <span className="rs-grade-tag">{res.grade}</span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Poster Buttons */}
              <div className="rs-poster-actions">
                <a
                  href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgram.id}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="rs-poster-btn rs-poster-btn--primary"
                >
                  <FileText size={16} />
                  <span>View Poster</span>
                </a>
                <a
                  href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgram.id}/?download=1`}
                  download
                  className="rs-poster-btn rs-poster-btn--secondary"
                >
                  <Download size={16} />
                  <span>Download Poster</span>
                </a>
              </div>
            </>
          ) : (
            <div className="rs-empty-state">
              <Award size={40} />
              <p>No results data available for this event.</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── List View: All Published Programs ─── */
        <div className="rs-list-section">

          {publishedPrograms.length > 0 && (
            <div className="rs-filters">
              <div className="rs-search-box">
                <Search size={16} className="rs-search-icon" />
                <input
                  type="text"
                  placeholder="Search events…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rs-search-input"
                />
              </div>
              <div className="rs-cat-pills">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`rs-cat-pill ${categoryFilter === 'all' ? 'rs-cat-pill--active' : ''}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`rs-cat-pill ${categoryFilter === cat ? 'rs-cat-pill--active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPrograms.length === 0 ? (
            <div className="rs-empty-state">
              <Award size={40} />
              <h3>{publishedPrograms.length === 0 ? 'No Results Published Yet' : 'No Matching Events'}</h3>
              <p>{publishedPrograms.length === 0 ? 'Published event results will appear here as judging completes.' : 'Try adjusting your search or filter.'}</p>
            </div>
          ) : (
            <div className="rs-events-grid">
              {filteredPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="rs-event-card"
                  onClick={() => fetchProgramResults(prog)}
                >
                  <div className="rs-event-card-top">
                    <Award size={20} className="rs-event-icon" />
                    <span className="rs-event-cat">{prog.category_name}</span>
                  </div>
                  <h3 className="rs-event-name">{prog.name}</h3>
                  <div className="rs-event-card-bottom">
                    <span className="rs-event-view-link">
                      View Results →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
