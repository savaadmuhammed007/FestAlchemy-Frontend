import React from 'react';
import { 
  Users, Trophy, Flag, FileText, Award, Gavel, RefreshCw, Shield
} from 'lucide-react';

// Color mapper for categories to match the image aesthetics
const getCategoryColor = (name, index) => {
  const colors = [
    '#f97316', // orange/red
    '#0d9488', // teal
    '#0284c7', // light blue
    '#eab308', // gold/yellow
    '#f97316', // orange
    '#dc2626', // red
    '#4f46e5', // indigo
  ];
  const nameLower = name.toLowerCase();
  if (nameLower.includes('junior')) return '#ea580c'; // Junior: Dark orange
  if (nameLower.includes('senior')) return '#0d9488'; // Senior: Teal
  if (nameLower.includes('high school')) return '#0f766e'; // High School: Dark Teal
  if (nameLower.includes('higher secondary')) return '#d97706'; // Higher Secondary: Dark Gold
  if (nameLower.includes('lower primary')) return '#f97316'; // Lower Primary: Orange
  if (nameLower.includes('upper primary')) return '#ea580c'; // Upper Primary: Dark Orange
  return colors[index % colors.length];
};

// SVG Radar Chart Component for Participants by Team
function RadarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', color: 'var(--text-muted)' }}>
        No team data available
      </div>
    );
  }

  const cx = 175;
  const cy = 135;
  const r = 90;
  const N = data.length;
  const maxVal = Math.max(...data.map(d => d.member_count), 5);

  const getCoordinates = (index, value) => {
    const angle = (index * 2 * Math.PI) / N - Math.PI / 2;
    const factor = value / maxVal;
    const x = cx + r * factor * Math.cos(angle);
    const y = cy + r * factor * Math.sin(angle);
    return { x, y, angle };
  };

  // Web lines
  const webPolygons = [0.2, 0.4, 0.6, 0.8, 1.0];
  const webs = webPolygons.map((p) => {
    const coords = [];
    for (let i = 0; i < N; i++) {
      const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
      const x = cx + r * p * Math.cos(angle);
      const y = cy + r * p * Math.sin(angle);
      coords.push(`${x},${y}`);
    }
    return coords.join(' ');
  });

  // Data polygon coordinates
  const dataPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(i, d.member_count);
    return `${x},${y}`;
  }).join(' ');

  // Vertices for dots and labels
  const vertices = data.map((d, i) => {
    const { x, y, angle } = getCoordinates(i, d.member_count);
    const lx = cx + (r + 18) * Math.cos(angle);
    const ly = cy + (r + 12) * Math.sin(angle);

    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    else if (Math.cos(angle) < -0.1) textAnchor = 'end';

    return { x, y, lx, ly, textAnchor, label: d.team_name, val: d.member_count };
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '280px' }}>
      <svg width="350" height="270" viewBox="0 0 350 270" style={{ overflow: 'visible' }}>
        {/* Concentric webs */}
        {webs.map((pointsStr, idx) => (
          <polygon
            key={idx}
            points={pointsStr}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={idx === webPolygons.length - 1 ? "none" : "3,3"}
          />
        ))}

        {/* Axes lines */}
        {Array.from({ length: N }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
            />
          );
        })}

        {/* Shaded data area */}
        {data.length > 2 ? (
          <polygon
            points={dataPoints}
            fill="rgba(99, 102, 241, 0.25)"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        ) : (
          <polyline
            points={dataPoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
        )}

        {/* Value dots & Labels */}
        {vertices.map((v, i) => (
          <g key={i}>
            <circle
              cx={v.x}
              cy={v.y}
              r="4.5"
              fill="var(--accent)"
              stroke="var(--bg-raised)"
              strokeWidth="1.5"
            />
            <text
              x={v.lx}
              y={v.ly}
              textAnchor={v.textAnchor}
              dominantBaseline="middle"
              fill="var(--text-secondary)"
              fontSize="0.75rem"
              fontWeight="600"
            >
              {v.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DashboardOverview({ statsLoading, stats, onNavigate }) {
  // Sort and calculate tie-aware ranks for Leaderboard
  const rawLeaderboard = stats?.team_leaderboard || [];
  let currentRank = 1;
  let previousPoints = null;
  const rankedTeams = rawLeaderboard.map((team, idx) => {
    if (previousPoints !== null && team.total_points < previousPoints) {
      currentRank = idx + 1;
    }
    previousPoints = team.total_points;
    return { ...team, rank: currentRank };
  });

  // Calculate max member count for Category Bar Chart
  const categoryData = stats?.participants_by_category || [];
  const maxCatCount = Math.max(...categoryData.map(c => c.member_count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ─── Dashboard Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Real-time operations dashboard - manage competitions, teams, judges, and results
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-secondary" 
          title="Refresh Statistics"
          style={{ padding: '0.5rem', width: '36px', height: '36px', borderRadius: 'var(--radius-md)' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {statsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <RefreshCw className="spinning" size={32} style={{ color: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="db-layout">
          
          {/* ─── Left Section (Stats Grid + Charts) ─── */}
          <div className="db-left-section">
            
            {/* 3x2 stats cards */}
            <div className="db-stats-grid">
              
              {/* Card 1: Participants */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Participants</span>
                  <span className="db-stat-value">{stats?.members_count || 0}</span>
                  <span className="db-stat-sub">Registered</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--info)' }}>
                  <Users size={20} />
                </div>
              </div>

              {/* Card 2: Competitions */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Competitions</span>
                  <span className="db-stat-value">{stats?.programs_count || 0}</span>
                  <span className="db-stat-sub">
                    {stats?.active_programs_count || 0} Active / {stats?.final_programs_count || 0} Final
                  </span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)' }}>
                  <Trophy size={20} />
                </div>
              </div>

              {/* Card 3: Teams */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Teams</span>
                  <span className="db-stat-value">{stats?.teams_count || 0}</span>
                  <span className="db-stat-sub">Participating</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                  <Users size={20} />
                </div>
              </div>

              {/* Card 4: Categories */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Categories</span>
                  <span className="db-stat-value">{stats?.categories_count || 0}</span>
                  <span className="db-stat-sub">Event groups</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
                  <FileText size={20} />
                </div>
              </div>

              {/* Card 5: Stages */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Stages</span>
                  <span className="db-stat-value">{stats?.stages_count || 0}</span>
                  <span className="db-stat-sub">Active stages</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                  <Flag size={20} />
                </div>
              </div>

              {/* Card 6: Judges */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Judges</span>
                  <span className="db-stat-value">{stats?.judges_count || 0}</span>
                  <span className="db-stat-sub">Registered</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                  <Gavel size={20} />
                </div>
              </div>

            </div>

            {/* Charts section */}
            <div className="db-charts-grid">
              
              {/* Chart 1: Participants by Team */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '370px' }}>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <Users size={16} style={{ color: 'var(--accent)' }} />
                  Participants by Team
                </h3>
                <div className="divider" style={{ margin: '0' }} />
                <RadarChart data={stats?.participants_by_team} />
              </div>

              {/* Chart 2: Participants by Category */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '370px' }}>
                <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <FileText size={16} style={{ color: 'var(--accent)' }} />
                  Participants by Category
                </h3>
                <div className="divider" style={{ margin: '0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                  {categoryData.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-muted)' }}>
                      No category data available
                    </div>
                  ) : (
                    categoryData.map((c, idx) => {
                      const color = getCategoryColor(c.category_name, idx);
                      const widthPercent = (c.member_count / maxCatCount) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ 
                              background: `${color}15`, 
                              color: color, 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '4px' 
                            }}>
                              {c.category_name}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {c.member_count}
                            </span>
                          </div>
                          <div style={{ background: 'var(--bg-overlay)', height: '14px', borderRadius: '4px', overflow: 'hidden', width: '100%', position: 'relative' }}>
                            <div style={{ 
                              background: color, 
                              width: `${widthPercent}%`, 
                              height: '100%', 
                              borderRadius: '4px',
                              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ─── Right Section (Team Leaderboard) ─── */}
          <div className="glass-panel db-leaderboard-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Trophy size={16} style={{ color: 'var(--gold)' }} />
                Team Leaderboard
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Points from published results
              </span>
            </div>
            
            <div className="divider" style={{ margin: '0' }} />
            
            <div className="db-leaderboard-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {rankedTeams.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--text-muted)' }}>
                  No published scores yet
                </div>
              ) : (
                rankedTeams.map((team, idx) => (
                  <div 
                    key={idx} 
                    className={`db-leaderboard-item ${
                      team.rank === 1 ? 'db-leaderboard-rank-1' : 
                      team.rank === 2 ? 'db-leaderboard-rank-2' : 
                      team.rank === 3 ? 'db-leaderboard-rank-3' : ''
                    }`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={`db-rank-circle ${
                        team.rank === 1 ? 'db-rank-circle-1' : 
                        team.rank === 2 ? 'db-rank-circle-2' : 
                        team.rank === 3 ? 'db-rank-circle-3' : 'db-rank-circle-default'
                      }`}>
                        {team.rank}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {team.team_name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {team.total_points} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>pts</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ─── Bottom Status & Actions Panel ─── */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)' }}>
          System Status & Fast Actions
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          Perform standard workflows directly or choose options from the admin sidebar layout.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('/admin/setup')} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
            Manage Events
          </button>
          <button onClick={() => onNavigate('/admin/calling')} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
            Open Spin Lot Panel
          </button>
          <button onClick={() => onNavigate('/admin/rankings')} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
            Scoring & Rankings
          </button>
        </div>
      </div>

    </div>
  );
}
