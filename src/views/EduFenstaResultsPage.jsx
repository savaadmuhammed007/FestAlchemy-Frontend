import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import EduFenstaNav from '../components/EduFenstaNav';
import EduFenstaFooter from '../components/EduFenstaFooter';
import './EduFenstaHomePage.css';
import './EduFenstaResultsPage.css';

import {
  Award,
  RefreshCw,
  Search,
  ChevronLeft,
  Download,
  FileText,
  Trophy,
  Filter,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function EduFenstaResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

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
      if (!res.ok) throw new Error('Failed to fetch festival data');
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
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-open program from navigation state (e.g. clicking on a card from EduFenstaHomePage)
  useEffect(() => {
    if (data && location.state?.openProgram && !selectedProgram) {
      fetchProgramResults(location.state.openProgram);
      window.history.replaceState({}, '');
    }
  }, [data, location.state]);

  const fetchProgramResults = async (prog) => {
    setResultsLoading(true);
    setSelectedProgram(prog);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/results/?program=${prog.id}&published_only=true`);
      if (!res.ok) throw new Error('Failed to fetch marksheet');
      const json = await res.json();
      setProgramResults(json);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error fetching marksheet:', err);
    } finally {
      setResultsLoading(false);
    }
  };

  const goBack = () => {
    setSelectedProgram(null);
    setProgramResults(null);
  };

  const publishedPrograms = data?.programs_with_results || [];

  // Get categories
  const categories = useMemo(() => {
    const raw = publishedPrograms.map(p => p.category_name).filter(Boolean);
    if (raw.length > 0) {
      return [...new Set(raw)];
    }
    const catsFromData = (data?.categories || []).map(c => c.name);
    if (catsFromData.length > 0) return catsFromData;
    return ['Low Zone', 'Mid Zone', 'High Zone', 'General'];
  }, [publishedPrograms, data]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return publishedPrograms.filter(prog => {
      if (searchQuery && !prog.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (categoryFilter !== 'all' && prog.category_name !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [publishedPrograms, searchQuery, categoryFilter]);

  return (
    <div className="edufensta-page efr-page">
      {/* ── Fixed EduFensta Navbar ── */}
      <EduFenstaNav activePage="results" />

      {/* ── Hero Banner ── */}
      <section className="efr-hero">
        <div className="efr-hero__contours">
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-50 100C200 90 400 160 700 140S1100 100 1500 175" stroke="#FF1A1A" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M-50 200C300 180 500 240 800 210S1200 180 1500 260" stroke="#FF1A1A" strokeWidth="0.8" fill="none" opacity="0.25"/>
            <path d="M-50 300C250 280 450 340 750 320S1150 280 1500 350" stroke="#FF1A1A" strokeWidth="0.5" fill="none" opacity="0.15"/>
          </svg>
        </div>

        <div className="efr-hero__container">
          <div className="efr-hero__season-tag">
            <Sparkles size={14} />
            <span>EDUFENSTA — OFFICIAL RESULTS</span>
          </div>

          <h1 className="efr-hero__title">
            EVENT <span>RESULTS</span>
          </h1>

          <p className="efr-hero__subtitle">
            Live compiled rankings, verified marksheets, and official championship posters directly from Al Asas Academy.
          </p>

          <div className="efr-metrics">
            <div className="efr-metric-chip">
              <div className="efr-metric-chip__icon"><Trophy size={18} /></div>
              <div>
                <div className="efr-metric-chip__val">{publishedPrograms.length}</div>
                <div className="efr-metric-chip__lbl">Events Declared</div>
              </div>
            </div>

            <div className="efr-metric-chip">
              <div className="efr-metric-chip__icon"><Filter size={18} /></div>
              <div>
                <div className="efr-metric-chip__val">{categories.length}</div>
                <div className="efr-metric-chip__lbl">Categories</div>
              </div>
            </div>

            <div className="efr-metric-chip">
              <div className="efr-live-pulse" />
              <div>
                <div className="efr-metric-chip__val" style={{ fontSize: '1rem', color: '#10b981' }}>LIVE</div>
                <div className="efr-metric-chip__lbl">Auto-Sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="efr-content">
        {loading && !data ? (
          <div className="efr-loading">
            <RefreshCw className="spinning" size={36} style={{ color: 'var(--ef-crimson)' }} />
            <p>Fetching declared events and marksheets…</p>
          </div>
        ) : error && !data ? (
          <div className="efr-empty">
            <h3 className="efr-empty__title">Connection Error</h3>
            <p className="efr-empty__desc">{error}</p>
            <button onClick={fetchData} className="efr-back-btn" style={{ marginTop: '1.5rem', alignSelf: 'center' }}>
              Retry Fetch
            </button>
          </div>
        ) : selectedProgram ? (
          /* ─── Detail View: Program Results & Marksheet ─── */
          <div className="efr-detail">
            <button onClick={goBack} className="efr-back-btn">
              <ChevronLeft size={18} />
              <span>Back to All Events</span>
            </button>

            {/* Event Header Card */}
            <div className="efr-detail__header-card">
              <div className="efr-detail__info">
                <div className="efr-detail__badges">
                  {selectedProgram.category_name && (
                    <span className="efr-card__cat-badge">{selectedProgram.category_name}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--ef-gray)' }}>EVENT #{selectedProgram.id}</span>
                </div>
                <h2 className="efr-detail__title">{selectedProgram.name}</h2>
                <p className="efr-detail__subtitle">Official Result Declared & Verified by Fest Committee</p>
              </div>

              <div className="efr-detail__actions">
                <a
                  href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgram.id}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="efr-btn-poster efr-btn-poster--primary"
                >
                  <FileText size={16} />
                  <span>View Poster</span>
                </a>
                <a
                  href={`${API_BASE_URL}/api/v1/results/poster/${selectedProgram.id}/?download=1`}
                  download
                  className="efr-btn-poster efr-btn-poster--secondary"
                >
                  <Download size={16} />
                  <span>Download Poster</span>
                </a>
              </div>
            </div>

            {resultsLoading ? (
              <div className="efr-loading">
                <RefreshCw className="spinning" size={32} style={{ color: 'var(--ef-crimson)' }} />
                <p>Loading certified marksheet…</p>
              </div>
            ) : programResults && programResults.length > 0 ? (
              <>
                {/* Top 3 Champions Cards */}
                <div className="efr-winners-grid">
                  {programResults.slice(0, 3).map((res) => {
                    const rankNum = res.rank;
                    return (
                      <div key={res.id} className={`efr-winner-card efr-winner-card--r${rankNum}`}>
                        <div className="efr-winner-rank-badge">
                          #{rankNum}
                        </div>
                        <h4 className="efr-winner-name">{res.member_name}</h4>
                        <div className="efr-winner-team">{res.team_name}</div>
                        {res.member_chest_no && (
                          <div className="efr-winner-chest">CHEST NO: #{res.member_chest_no}</div>
                        )}
                        {res.grade && (
                          <span className="efr-winner-grade">GRADE: {res.grade}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Complete Tabular Marksheet */}
                {/* Complete Tabular Marksheet */}
                <div className="efr-table-wrap">
                  <div className="efr-table-title">
                    <CheckCircle2 size={20} style={{ color: 'var(--ef-crimson)' }} />
                    <span>Official Program Marksheet</span>
                  </div>
                  <div className="efr-table-scroll-container">
                    <table className="efr-table">
                      <thead>
                        <tr>
                          <th style={{ width: '56px', textAlign: 'center' }}>Rank</th>
                          <th>Participant</th>
                          <th className="efr-desktop-only">Team</th>
                          <th style={{ width: '75px', textAlign: 'center' }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programResults.map((res) => {
                          const isWinner = res.rank <= 3;
                          return (
                            <tr key={res.id} className={isWinner ? 'efr-row--winner' : ''}>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`efr-rank-pill efr-rank-pill--${res.rank}`}>
                                  {res.rank}
                                </span>
                              </td>
                              <td>
                                <div className="efr-participant-cell">
                                  <div className="efr-participant-name-row">
                                    <span className="efr-participant-name">
                                      {res.member_name}
                                    </span>
                                    {res.member_chest_no && (
                                      <span className="efr-participant-chest">
                                        #{res.member_chest_no}
                                      </span>
                                    )}
                                  </div>
                                  <div className="efr-mobile-only efr-mobile-team-sub">
                                    {res.team_name}
                                  </div>
                                </div>
                              </td>
                              <td className="efr-desktop-only">
                                <span className="efr-team-text">
                                  {res.team_name}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {res.grade ? (
                                  <span className="efr-winner-grade efr-grade-pill">
                                    {res.grade}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--ef-gray)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="efr-empty">
                <Award size={48} className="efr-empty__icon" />
                <h3 className="efr-empty__title">No Verified Scores Available</h3>
                <p className="efr-empty__desc">Results for this program have not yet been published by the judging panel.</p>
              </div>
            )}
          </div>
        ) : (
          /* ─── List View: All Declared Programs ─── */
          <div>
            {/* Filter Bar */}
            <div className="efr-filter-bar">
              <div className="efr-search-box">
                <Search size={18} className="efr-search-icon" />
                <input
                  type="text"
                  placeholder="Search program by name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="efr-search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="efr-search-clear">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="efr-cat-pills">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`efr-cat-pill ${categoryFilter === 'all' ? 'efr-cat-pill--active' : ''}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`efr-cat-pill ${categoryFilter === cat ? 'efr-cat-pill--active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Cards Grid */}
            {filteredPrograms.length === 0 ? (
              <div className="efr-empty">
                <Award size={48} className="efr-empty__icon" />
                <h3 className="efr-empty__title">
                  {publishedPrograms.length === 0 ? 'No Results Published Yet' : 'No Matching Programs Found'}
                </h3>
                <p className="efr-empty__desc">
                  {publishedPrograms.length === 0
                    ? 'Published event results and verified marksheets will appear here live as each competition wraps up.'
                    : 'Try changing your search term or selecting another category filter above.'}
                </p>
              </div>
            ) : (
              <div className="efr-grid">
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="efr-card"
                    onClick={() => fetchProgramResults(prog)}
                  >
                    <div className="efr-card__top">
                      {prog.category_name ? (
                        <span className="efr-card__cat-badge">{prog.category_name}</span>
                      ) : (
                        <span className="efr-card__cat-badge">EVENT</span>
                      )}
                      <span className="efr-card__action-tag">
                        MARKSHEET <ChevronRight size={14} />
                      </span>
                    </div>

                    <h3 className="efr-card__title">{prog.name}</h3>
                    <div className="efr-card__divider" />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ef-gray)' }}>
                        Official Declared
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ef-crimson)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        VIEW RANKS &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── EduFensta Footer ── */}
      <EduFenstaFooter />
    </div>
  );
}
