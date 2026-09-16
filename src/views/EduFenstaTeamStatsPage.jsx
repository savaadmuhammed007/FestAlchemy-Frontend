import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import EduFenstaNav from '../components/EduFenstaNav';
import EduFenstaFooter from '../components/EduFenstaFooter';
import './EduFenstaHomePage.css';
import './EduFenstaTeamStatsPage.css';

import {
  Trophy,
  Crown,
  Medal,
  Users,
  BarChart2,
  Search,
  RefreshCw,
  Flame,
  X
} from 'lucide-react';

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, duration = 800, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const endVal = Number(end) || 0;
    if (endVal <= 0) { setCount(0); return; }

    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * endVal));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setCount(endVal);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
}

export default function EduFenstaTeamStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
      if (!res.ok) throw new Error('Failed to fetch team leaderboard');
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

  const fest = data?.fest_settings;
  const publishedCount = data?.programs_with_results?.length || 0;

  // ── Categories List ──
  const categoriesList = useMemo(() => {
    const cats = data?.categories || [];
    if (cats.length > 0) {
      return cats.map(c => c.name);
    }
    return ['Low Zone', 'Mid Zone', 'High Zone', 'General'];
  }, [data]);

  // ── Program Name to Category Map ──
  const progCategoryMap = useMemo(() => {
    const map = new Map();
    (data?.schedule || []).forEach(p => {
      if (p.name && p.category_name) {
        map.set(p.name.trim().toLowerCase(), p.category_name);
      }
    });
    (data?.recent_results || []).forEach(r => {
      if (r.program_name && r.category_name) {
        map.set(r.program_name.trim().toLowerCase(), r.category_name);
      }
    });
    (data?.programs_with_results || []).forEach(p => {
      if (p.name && p.category_name) {
        map.set(p.name.trim().toLowerCase(), p.category_name);
      }
    });
    return map;
  }, [data]);

  // ── Process Teams & Category Points ──
  const processedTeams = useMemo(() => {
    const rawLeaderboard = data?.leaderboard || [];
    if (!rawLeaderboard.length) return [];

    return rawLeaderboard.map((t, idx) => {
      const categoryPoints = {};
      categoriesList.forEach(cName => {
        categoryPoints[cName] = 0;
      });

      if (t.breakdown && typeof t.breakdown === 'object') {
        Object.entries(t.breakdown).forEach(([progName, resultsArr]) => {
          const catName = progCategoryMap.get(progName.trim().toLowerCase());
          let progPts = 0;
          if (Array.isArray(resultsArr)) {
            progPts = resultsArr.reduce((sum, r) => sum + (Number(r.pts) || 0), 0);
          } else if (typeof resultsArr === 'number') {
            progPts = resultsArr;
          }
          if (catName && categoryPoints[catName] !== undefined) {
            categoryPoints[catName] += progPts;
          }
        });
      }

      return {
        rank: idx + 1,
        id: t.id || t.team || idx,
        name: t.team_name || `Team ${idx + 1}`,
        categoryPoints,
        totalPoints: Number(t.total_points) || 0,
        breakdown: t.breakdown || {},
      };
    });
  }, [data, categoriesList, progCategoryMap]);

  // Filter teams by search
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return processedTeams;
    return processedTeams.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [processedTeams, searchQuery]);

  const top3 = processedTeams.slice(0, 3);
  const leaderTeam = processedTeams[0];

  return (
    <div className="edufensta-page eft-page">
      {/* ── Fixed EduFensta Navbar ── */}
      <EduFenstaNav activePage="standings" />

      {/* ── Hero Banner ── */}
      <section className="eft-hero">
        <div className="eft-hero__contours">
          <svg viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-50 100C200 90 400 160 700 140S1100 100 1500 175" stroke="#FF1A1A" strokeWidth="1" fill="none" opacity="0.4"/>
            <path d="M-50 200C300 180 500 240 800 210S1200 180 1500 260" stroke="#FF1A1A" strokeWidth="0.8" fill="none" opacity="0.25"/>
            <path d="M-50 300C250 280 450 340 750 320S1150 280 1500 350" stroke="#FF1A1A" strokeWidth="0.5" fill="none" opacity="0.15"/>
          </svg>
        </div>

        <div className="eft-hero__container">
          <div className="eft-hero__season-tag">
            <Flame size={14} />
            <span>EDUFENSTA — CHAMPIONSHIP STANDINGS</span>
          </div>

          <h1 className="eft-hero__title">
            WHO STANDS <span>TOGETHER</span>
          </h1>

          <p className="eft-hero__subtitle">
            {fest?.published_standings_limit > 0
              ? `Real-time points compilation after first ${fest.published_standings_limit} published events. Every mark forged with honor and brilliance.`
              : 'Live verified scoreboard, zone totals, and official team standings compiled directly from the judging floor.'}
          </p>

          <div className="efr-metrics">
            <div className="efr-metric-chip">
              <div className="efr-metric-chip__icon"><Users size={18} /></div>
              <div>
                <div className="efr-metric-chip__val">{processedTeams.length}</div>
                <div className="efr-metric-chip__lbl">Teams Competing</div>
              </div>
            </div>

            <div className="efr-metric-chip">
              <div className="efr-metric-chip__icon"><Trophy size={18} /></div>
              <div>
                <div className="efr-metric-chip__val">{publishedCount}</div>
                <div className="efr-metric-chip__lbl">Events Scored</div>
              </div>
            </div>

            {leaderTeam && (
              <div className="efr-metric-chip" style={{ borderColor: 'rgba(255, 215, 0, 0.4)' }}>
                <div className="efr-metric-chip__icon" style={{ color: '#ffd700' }}><Crown size={18} /></div>
                <div>
                  <div className="efr-metric-chip__val" style={{ color: '#ffd700' }}>{leaderTeam.name}</div>
                  <div className="efr-metric-chip__lbl">Championship Leader</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="eft-content">
        {loading && !data ? (
          <div className="efr-loading">
            <RefreshCw className="spinning" size={36} style={{ color: 'var(--ef-crimson)' }} />
            <p>Compiling live team points and standings…</p>
          </div>
        ) : error && !data ? (
          <div className="efr-empty">
            <h3 className="efr-empty__title">Connection Error</h3>
            <p className="efr-empty__desc">{error}</p>
            <button onClick={fetchData} className="efr-back-btn" style={{ marginTop: '1.5rem', alignSelf: 'center' }}>
              Retry Fetch
            </button>
          </div>
        ) : fest?.publish_team_standings === false ? (
          <div className="efr-empty">
            <Trophy size={48} className="efr-empty__icon" />
            <h3 className="efr-empty__title">Standings Temporarily Concealed</h3>
            <p className="efr-empty__desc">The central fest management has temporarily paused public standings until the grand finale reveal.</p>
          </div>
        ) : (
          <>
            {/* ── 1. Team Standings Cards (Adaptive 2-Team or 3-Podium) ── */}
            {processedTeams.length === 2 ? (
              <section className="eft-podium-section">
                <div className="eft-podium-header">
                  <div className="eft-podium-eyebrow">Championship Clash</div>
                  <h2 className="eft-podium-title">TEAM STANDINGS</h2>
                </div>

                <div className="eft-podium-grid eft-podium-grid--two-teams">
                  {/* #1 Leader */}
                  <div className="eft-podium-card eft-podium-card--1st eft-podium-card--dual">
                    <Crown size={32} className="eft-podium-crown" />
                    <div className="eft-podium-medal">
                      <Trophy size={32} />
                    </div>
                    <span className="eft-podium-rank" style={{ color: '#ffd700' }}>RANK #01</span>
                    <h3 className="eft-podium-name">{processedTeams[0].name}</h3>
                    <div className="eft-podium-pts">
                      <AnimatedCounter end={processedTeams[0].totalPoints} />
                      <span style={{ fontSize: '1.2rem', marginLeft: '6px', color: '#ffd700' }}>PTS</span>
                    </div>
                    <span className="eft-podium-badge" style={{ borderColor: '#ffd700', color: '#ffd700', background: 'rgba(255, 215, 0, 0.15)' }}>
                      CURRENT LEADER
                    </span>
                  </div>

                  {/* #2 Challenger */}
                  <div className="eft-podium-card eft-podium-card--2nd eft-podium-card--dual">
                    <div className="eft-podium-medal">
                      <Medal size={28} />
                    </div>
                    <span className="eft-podium-rank" style={{ color: '#c0c0c0' }}>RANK #02</span>
                    <h3 className="eft-podium-name">{processedTeams[1].name}</h3>
                    <div className="eft-podium-pts">
                      <AnimatedCounter end={processedTeams[1].totalPoints} />
                      <span style={{ fontSize: '1.2rem', marginLeft: '6px', color: '#c0c0c0' }}>PTS</span>
                    </div>
                    <span className="eft-podium-badge" style={{ borderColor: 'var(--ef-crimson)', color: 'var(--ef-crimson)', background: 'rgba(255, 26, 26, 0.12)' }}>
                      CHALLENGER
                    </span>
                  </div>
                </div>
              </section>
            ) : top3.length > 0 ? (
              <section className="eft-podium-section">
                <div className="eft-podium-header">
                  <div className="eft-podium-eyebrow">Front Runners</div>
                  <h2 className="eft-podium-title">TOP CONTENDERS</h2>
                </div>

                <div className="eft-podium-grid">
                  {/* #2 Runner Up */}
                  {top3[1] && (
                    <div className="eft-podium-card eft-podium-card--2nd">
                      <div className="eft-podium-medal">
                        <Medal size={26} />
                      </div>
                      <span className="eft-podium-rank">RANK #02</span>
                      <h3 className="eft-podium-name">{top3[1].name}</h3>
                      <div className="eft-podium-pts">
                        <AnimatedCounter end={top3[1].totalPoints} />
                        <span style={{ fontSize: '1.1rem', marginLeft: '4px', color: 'var(--ef-gray)' }}>PTS</span>
                      </div>
                      <span className="eft-podium-badge" style={{ borderColor: '#c0c0c0', color: '#c0c0c0', background: 'rgba(192, 192, 192, 0.1)' }}>
                        RUNNER UP
                      </span>
                    </div>
                  )}

                  {/* #1 Leader / Champion */}
                  {top3[0] && (
                    <div className="eft-podium-card eft-podium-card--1st">
                      <Crown size={30} className="eft-podium-crown" />
                      <div className="eft-podium-medal">
                        <Trophy size={32} />
                      </div>
                      <span className="eft-podium-rank" style={{ color: '#ffd700' }}>RANK #01</span>
                      <h3 className="eft-podium-name">{top3[0].name}</h3>
                      <div className="eft-podium-pts">
                        <AnimatedCounter end={top3[0].totalPoints} />
                        <span style={{ fontSize: '1.2rem', marginLeft: '6px', color: '#ffd700' }}>PTS</span>
                      </div>
                      <span className="eft-podium-badge" style={{ borderColor: '#ffd700', color: '#ffd700', background: 'rgba(255, 215, 0, 0.15)' }}>
                        CURRENT LEADER
                      </span>
                    </div>
                  )}

                  {/* #3 Third Place */}
                  {top3[2] && (
                    <div className="eft-podium-card eft-podium-card--3rd">
                      <div className="eft-podium-medal">
                        <Medal size={26} />
                      </div>
                      <span className="eft-podium-rank">RANK #03</span>
                      <h3 className="eft-podium-name">{top3[2].name}</h3>
                      <div className="eft-podium-pts">
                        <AnimatedCounter end={top3[2].totalPoints} />
                        <span style={{ fontSize: '1.1rem', marginLeft: '4px', color: 'var(--ef-gray)' }}>PTS</span>
                      </div>
                      <span className="eft-podium-badge" style={{ borderColor: '#cd7f32', color: '#cd7f32', background: 'rgba(205, 127, 50, 0.1)' }}>
                        SECOND RUNNER UP
                      </span>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {/* ── 2. Full Leaderboard Table Section ── */}
            <section className="eft-table-section">
              <div className="eft-table-bar">
                <h3 className="eft-table-heading">
                  <BarChart2 size={22} style={{ color: 'var(--ef-crimson)' }} />
                  Full Team Standings
                  {fest?.published_standings_limit > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ef-crimson)', background: 'rgba(255, 26, 26, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', marginLeft: '0.75rem' }}>
                      After {fest.published_standings_limit} Events
                    </span>
                  )}
                </h3>

                <div className="eft-table-search">
                  <Search size={16} className="eft-table-search-icon" />
                  <input
                    type="text"
                    placeholder="Search team…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ef-gray)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="efr-empty">
                  <Users size={40} className="efr-empty__icon" />
                  <h3 className="efr-empty__title">No Teams Found</h3>
                  <p className="efr-empty__desc">No team matched your search query "{searchQuery}".</p>
                </div>
              ) : (
                <div className="eft-table-wrap">
                  <table className="eft-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                        <th>Team</th>
                        {categoriesList.map(cat => (
                          <th key={cat} className="eft-th-center eft-desktop-col">{cat}</th>
                        ))}
                        <th className="eft-th-right" style={{ width: '120px' }}>Total Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((team) => {
                        const isLeader = team.rank === 1;

                        return (
                          <tr
                            key={team.id}
                            className={`eft-row ${isLeader ? 'eft-row--leader' : ''}`}
                          >
                            <td style={{ textAlign: 'center' }}>
                              <span className={`eft-rank-badge eft-rank-badge--${team.rank}`}>
                                {String(team.rank).padStart(2, '0')}
                              </span>
                            </td>
                            <td>
                              <div className="eft-team-cell">
                                <span className="eft-team-name">{team.name}</span>
                                {/* Mobile zone breakdown pills */}
                                <div className="eft-mobile-only eft-mobile-zones-bar">
                                  {categoriesList.map(cat => (
                                    <span key={cat} className="eft-mobile-zone-chip">
                                      <span className="eft-mobile-zone-label">{cat}:</span>
                                      <span className="eft-mobile-zone-val">{team.categoryPoints[cat] ?? 0}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            {categoriesList.map(cat => (
                              <td key={cat} className="eft-cat-pts eft-desktop-col">
                                {team.categoryPoints[cat] ?? 0}
                              </td>
                            ))}
                            <td className="eft-total-pts">
                              <AnimatedCounter end={team.totalPoints} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ── EduFensta Footer ── */}
      <EduFenstaFooter />
    </div>
  );
}
