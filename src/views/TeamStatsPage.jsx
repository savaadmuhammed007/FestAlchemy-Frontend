import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { Trophy, Medal, Users, RefreshCw, ArrowLeft, Crown, Flame, ChevronUp, ChevronDown, BarChart2, Award } from 'lucide-react';

export default function TeamStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
      if (!res.ok) throw new Error('Failed to fetch team stats');
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
  const leaderboard = data?.leaderboard || [];
  const publishedCount = data?.programs_with_results?.length || 0;

  const rankMeta = [
    { color: 'var(--gold)', label: '1st', icon: <Crown size={18} /> },
    { color: 'var(--silver)', label: '2nd', icon: <Medal size={18} /> },
    { color: 'var(--bronze)', label: '3rd', icon: <Medal size={18} /> },
  ];

  if (loading && !data) {
    return (
      <div className="ts-loading">
        <RefreshCw className="spinning" size={36} style={{ color: 'var(--accent)' }} />
        <p>Loading team standings…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="ts-error-box">
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button onClick={fetchData} className="ts-retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="ts-page">

      {/* ─── Page Header ─── */}
      <div className="ts-page-header">
        <Link to="/ilalhabeeb" className="ts-back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="ts-page-title-area">
          <div className="ts-title-badge">
            <Flame size={14} />
            <span>Live Scoreboard</span>
          </div>
          <h1 className="ts-page-title">
            Team Standings
            {fest?.published_standings_limit > 0 && (
              <span className="tag tag-primary" style={{ fontSize: '0.8rem', marginLeft: '0.75rem', verticalAlign: 'middle' }}>
                After {fest.published_standings_limit} Results
              </span>
            )}
          </h1>
          <p className="ts-page-subtitle">
            {fest?.published_standings_limit > 0
              ? `${fest?.fest_name || 'FestAlchemy'} ${fest?.year || new Date().getFullYear()} — Team points calculated after first ${fest.published_standings_limit} published events.`
              : `${fest?.fest_name || 'FestAlchemy'} ${fest?.year || new Date().getFullYear()} — Real-time team points and individual performer rankings.`}
          </p>
        </div>

        {/* Quick stats row */}
        <div className="ts-quick-stats">
          <div className="ts-qs-item">
            <Users size={18} />
            <span className="ts-qs-val">{leaderboard.length}</span>
            <span className="ts-qs-label">Teams</span>
          </div>
          <div className="ts-qs-item">
            <Trophy size={18} />
            <span className="ts-qs-val">{publishedCount}</span>
            <span className="ts-qs-label">Events Scored</span>
          </div>
          {fest?.published_standings_limit > 0 && (
            <div className="ts-qs-item">
              <Award size={18} />
              <span className="ts-qs-val">After {fest.published_standings_limit}</span>
              <span className="ts-qs-label">Results</span>
            </div>
          )}
          {leaderboard.length > 0 && (
            <div className="ts-qs-item ts-qs-item--highlight">
              <Crown size={18} />
              <span className="ts-qs-val">{leaderboard[0]?.team_name}</span>
              <span className="ts-qs-label">Leading</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Top 3 Podium ─── */}
      {leaderboard.length >= 1 && (
        <div className="ts-podium-section">
          <div className="ts-podium-grid">
            {/* 2nd */}
            {leaderboard[1] && (
              <div className="ts-podium-card ts-podium-card--2nd">
                <div className="ts-podium-medal" style={{ background: 'rgba(148,163,184,0.15)', color: 'var(--silver)', borderColor: 'rgba(148,163,184,0.4)' }}>
                  <Medal size={22} />
                </div>
                <span className="ts-podium-rank">#2</span>
                <h3 className="ts-podium-name">{leaderboard[1].team_name}</h3>
                <span className="ts-podium-pts" style={{ color: 'var(--silver)' }}>{leaderboard[1].total_points} pts</span>
              </div>
            )}
            {/* 1st */}
            {leaderboard[0] && (
              <div className="ts-podium-card ts-podium-card--1st">
                <div className="ts-podium-crown-badge">
                  <Crown size={24} />
                </div>
                <div className="ts-podium-medal" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', borderColor: 'rgba(245,158,11,0.4)' }}>
                  <Trophy size={24} />
                </div>
                <span className="ts-podium-rank">#1</span>
                <h3 className="ts-podium-name">{leaderboard[0].team_name}</h3>
                <span className="ts-podium-pts" style={{ color: 'var(--gold)' }}>{leaderboard[0].total_points} pts</span>
                <span className="ts-podium-leader-tag">👑 Leading</span>
              </div>
            )}
            {/* 3rd */}
            {leaderboard[2] && (
              <div className="ts-podium-card ts-podium-card--3rd">
                <div className="ts-podium-medal" style={{ background: 'rgba(217,119,6,0.15)', color: 'var(--bronze)', borderColor: 'rgba(217,119,6,0.4)' }}>
                  <Medal size={22} />
                </div>
                <span className="ts-podium-rank">#3</span>
                <h3 className="ts-podium-name">{leaderboard[2].team_name}</h3>
                <span className="ts-podium-pts" style={{ color: 'var(--bronze)' }}>{leaderboard[2].total_points} pts</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Full Team Leaderboard Table ─── */}
      <div className="ts-section">
        <div className="ts-section-header">
          <h2 className="ts-section-title">
            <BarChart2 size={20} />
            Full Team Leaderboard
            {fest?.published_standings_limit > 0 && (
              <span className="tag tag-primary" style={{ fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                After {fest.published_standings_limit} Events
              </span>
            )}
          </h2>
        </div>

        {fest?.publish_team_standings === false ? (
          <div className="ts-empty-state">
            <Trophy size={40} />
            <h3>Team Standings Not Published Yet</h3>
            <p>Overall team standings are currently hidden by event management. Check back soon!</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="ts-empty-state">
            <BarChart2 size={40} />
            <h3>No Scores Yet</h3>
            <p>Team scores will appear here once judging begins.</p>
          </div>
        ) : (
          <div className="ts-table-wrap">
            <table className="ts-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Rank</th>
                  <th>Team</th>
                  <th style={{ textAlign: 'right', width: '120px' }}>Points</th>
                  <th style={{ width: '60px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((team, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const color = isTop3 ? rankMeta[rank - 1].color : 'var(--text-muted)';
                  const isExpanded = expandedTeam === team.id;
                  const breakdown = team.breakdown || {};
                  const hasBreakdown = Object.keys(breakdown).length > 0;

                  return (
                    <React.Fragment key={team.id}>
                      <tr
                        className={`ts-table-row ${isTop3 ? 'ts-table-row--top' : ''} ${isExpanded ? 'ts-table-row--expanded' : ''}`}
                        onClick={() => hasBreakdown && setExpandedTeam(isExpanded ? null : team.id)}
                        style={{ cursor: hasBreakdown ? 'pointer' : 'default' }}
                      >
                        <td>
                          <div className="ts-rank-badge" style={{
                            background: isTop3 ? `color-mix(in srgb, ${color} 14%, transparent)` : 'var(--bg-hover)',
                            color: color,
                            borderColor: isTop3 ? color : 'var(--border)',
                          }}>
                            {rank}
                          </div>
                        </td>
                        <td>
                          <span className="ts-team-name">{team.team_name}</span>
                        </td>
                        <td className="ts-points-cell" style={{ color: isTop3 ? color : 'var(--text-primary)' }}>
                          {team.total_points}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {hasBreakdown && (
                            isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasBreakdown && (
                        <tr className="ts-breakdown-row">
                          <td colSpan={4}>
                            <div className="ts-breakdown-content">
                              <span className="ts-breakdown-label">Points Breakdown</span>
                              <div className="ts-breakdown-items">
                                {Object.entries(breakdown).map(([key, val]) => (
                                  <div key={key} className="ts-breakdown-chip">
                                    <span className="ts-breakdown-chip-name">{key}</span>
                                    <span className="ts-breakdown-chip-val">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
