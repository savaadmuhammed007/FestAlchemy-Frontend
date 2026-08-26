import React, { useState, useMemo } from 'react';
import { 
  Users, Trophy, Flag, FileText, Award, Gavel, RefreshCw, Shield, 
  Sparkles, Activity, PieChart as PieIcon, BarChart2, Radio, CheckCircle2, 
  Clock, TrendingUp, Zap, Target, Layers, ChevronRight, Crown, Medal
} from 'lucide-react';

// ─── Color Palettes & Helpers ─────────────────────────────────
const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber / Gold
  '#ec4899', // Pink / Rose
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
];

const getCategoryColor = (name = '', index = 0) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('junior')) return '#f97316';
  if (nameLower.includes('senior')) return '#06b6d4';
  if (nameLower.includes('high school')) return '#10b981';
  if (nameLower.includes('higher secondary')) return '#8b5cf6';
  if (nameLower.includes('lower primary')) return '#f59e0b';
  if (nameLower.includes('upper primary')) return '#ec4899';
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

const TEAM_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'
];

// ─── Interactive Floating Tooltip ────────────────────────────
function ChartTooltip({ visible, x, y, title, subtitle, items = [], color = '#6366f1' }) {
  if (!visible) return null;
  return (
    <div 
      className="db-chart-tooltip"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
        opacity: visible ? 1 : 0,
        borderColor: `${color}60`
      }}
    >
      <div className="db-tooltip-header">
        <span className="db-tooltip-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <span>{title}</span>
      </div>
      {subtitle && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{subtitle}</div>}
      {items.map((item, idx) => (
        <div key={idx} className="db-tooltip-row">
          <span>{item.label}</span>
          <span className="db-tooltip-val" style={{ color: item.color || 'var(--text-primary)' }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Interactive SVG Radar Matrix Chart ───────────────────────
function RadarChartMatrix({ data, totalParticipants, leaderboard = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '270px', color: 'var(--text-muted)' }}>
        No team participation data available
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
    const factor = Math.max(value / maxVal, 0.05);
    const x = cx + r * factor * Math.cos(angle);
    const y = cy + r * factor * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric polygon web rings
  const webPolygons = [0.25, 0.5, 0.75, 1.0];
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
    const lx = cx + (r + 20) * Math.cos(angle);
    const ly = cy + (r + 14) * Math.sin(angle);

    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.15) textAnchor = 'start';
    else if (Math.cos(angle) < -0.15) textAnchor = 'end';

    // Find points from leaderboard
    const teamLb = leaderboard.find(t => t.team_name.toLowerCase() === d.team_name.toLowerCase());
    const points = teamLb ? teamLb.total_points : 0;
    const pct = totalParticipants > 0 ? ((d.member_count / totalParticipants) * 100).toFixed(1) : 0;

    return { 
      x, y, lx, ly, textAnchor, 
      label: d.team_name, 
      val: d.member_count, 
      points, 
      pct, 
      color: TEAM_COLORS[i % TEAM_COLORS.length] 
    };
  });

  const activeItem = hoveredIdx !== null ? vertices[hoveredIdx] : null;

  return (
    <div 
      className="db-radar-wrap"
      onMouseLeave={() => setHoveredIdx(null)}
      style={{ position: 'relative', height: '280px' }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 350 270" 
        style={{ overflow: 'visible', maxWidth: '380px' }}
      >
        <defs>
          <linearGradient id="radarAreaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Center Glow Aura */}
        <circle cx={cx} cy={cy} r={r} fill="url(#radarCenterGlow)" />

        {/* Concentric webs with threshold percentages */}
        {webs.map((pointsStr, idx) => (
          <polygon
            key={idx}
            points={pointsStr}
            fill="none"
            stroke="var(--border)"
            strokeWidth={idx === webs.length - 1 ? "1.5" : "1"}
            strokeDasharray={idx === webs.length - 1 ? "none" : "3,3"}
            opacity={0.7}
          />
        ))}

        {/* Web tier marks */}
        <text x={cx + 4} y={cy - r * 0.5} fill="var(--text-muted)" fontSize="8" fontWeight="600">50%</text>
        <text x={cx + 4} y={cy - r + 8} fill="var(--text-muted)" fontSize="8" fontWeight="600">100%</text>

        {/* Radial Axes lines */}
        {Array.from({ length: N }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / N - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const isHovered = hoveredIdx === i;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={isHovered ? "var(--accent)" : "var(--border)"}
              strokeWidth={isHovered ? "1.75" : "1"}
              strokeDasharray={isHovered ? "none" : "2,2"}
              transition="all 0.3s ease"
            />
          );
        })}

        {/* Shaded polygon area */}
        {data.length > 2 ? (
          <polygon
            points={dataPoints}
            fill="url(#radarAreaGradient)"
            stroke="var(--accent)"
            strokeWidth="2.5"
            className="db-radar-poly"
          />
        ) : (
          <polyline
            points={dataPoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
        )}

        {/* Center Pivot Point */}
        <circle cx={cx} cy={cy} r="3" fill="var(--accent)" opacity="0.8" />

        {/* Value Dots & Labels */}
        {vertices.map((v, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <g 
              key={i} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.closest('.db-radar-wrap').getBoundingClientRect();
                setTooltipPos({ 
                  x: rect.left - parentRect.left + 10, 
                  y: rect.top - parentRect.top - 10 
                });
                setHoveredIdx(i);
              }}
            >
              {/* Highlight Halo on Hover */}
              {isHovered && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r="12"
                  fill={`${v.color}25`}
                  filter="url(#glowEffect)"
                />
              )}
              {/* Point Circle */}
              <circle
                cx={v.x}
                cy={v.y}
                r={isHovered ? "6.5" : "4.5"}
                fill={isHovered ? "#ffffff" : v.color}
                stroke={isHovered ? v.color : "var(--bg-raised)"}
                strokeWidth="2"
                className="db-radar-dot"
              />
              {/* Axis Label */}
              <text
                x={v.lx}
                y={v.ly}
                textAnchor={v.textAnchor}
                dominantBaseline="middle"
                fill={isHovered ? "var(--accent)" : "var(--text-secondary)"}
                fontSize={isHovered ? "0.78rem" : "0.72rem"}
                fontWeight={isHovered ? "800" : "600"}
                style={{ transition: 'all 0.2s ease' }}
              >
                {v.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Floating Tooltip */}
      <ChartTooltip
        visible={hoveredIdx !== null && activeItem !== null}
        x={tooltipPos.x}
        y={tooltipPos.y}
        title={activeItem?.label || ''}
        color={activeItem?.color || '#6366f1'}
        items={[
          { label: 'Participants', value: `${activeItem?.val || 0} members`, color: 'var(--accent)' },
          { label: 'Squad Share', value: `${activeItem?.pct || 0}%`, color: 'var(--info)' },
          { label: 'Current Points', value: `${activeItem?.points || 0} pts`, color: 'var(--gold)' }
        ]}
      />
    </div>
  );
}

// ─── Team Bar Chart Matrix ────────────────────────────────────
function TeamBarChart({ data, totalParticipants, leaderboard = [] }) {
  const maxVal = Math.max(...data.map(d => d.member_count), 1);
  const sorted = [...data].sort((a, b) => b.member_count - a.member_count);

  return (
    <div className="db-bar-list" style={{ minHeight: '260px', padding: '0.5rem 0' }}>
      {sorted.map((item, idx) => {
        const color = TEAM_COLORS[idx % TEAM_COLORS.length];
        const pct = totalParticipants > 0 ? ((item.member_count / totalParticipants) * 100).toFixed(1) : 0;
        const widthPct = (item.member_count / maxVal) * 100;
        const teamLb = leaderboard.find(t => t.team_name.toLowerCase() === item.team_name.toLowerCase());
        const points = teamLb ? teamLb.total_points : 0;

        return (
          <div key={idx} className="db-bar-item-wrap">
            <div className="db-bar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  background: `${color}20`, 
                  color: color, 
                  fontSize: '0.7rem', 
                  fontWeight: 800,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                  {item.team_name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {pct}% share
                </span>
                <span style={{ 
                  background: 'var(--bg-overlay)', 
                  border: '1px solid var(--border)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)' 
                }}>
                  {item.member_count} <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>members</span>
                </span>
              </div>
            </div>
            <div className="db-bar-track">
              <div 
                className="db-bar-fill" 
                style={{ 
                  width: `${widthPct}%`, 
                  background: `linear-gradient(90deg, ${color}88, ${color})` 
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Team Squad Efficiency Chart (Points per Member) ─────────
function TeamEfficiencyChart({ data, leaderboard = [] }) {
  if (!data || data.length === 0 || !leaderboard || leaderboard.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', color: 'var(--text-muted)' }}>
        Efficiency metrics require active scores and roster data
      </div>
    );
  }

  // Combine points and members
  const combined = data.map(team => {
    const lb = leaderboard.find(t => t.team_name.toLowerCase() === team.team_name.toLowerCase());
    const points = lb ? lb.total_points : 0;
    const members = Math.max(team.member_count, 1);
    const efficiency = parseFloat((points / members).toFixed(2));
    return {
      team_name: team.team_name,
      member_count: team.member_count,
      total_points: points,
      efficiency
    };
  }).sort((a, b) => b.efficiency - a.efficiency);

  const maxEff = Math.max(...combined.map(c => c.efficiency), 1);

  return (
    <div className="db-bar-list" style={{ minHeight: '260px', padding: '0.5rem 0' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Zap size={13} style={{ color: 'var(--gold)' }} /> Points generated per registered participant (Squad Efficiency)
      </div>
      {combined.map((item, idx) => {
        const color = idx === 0 ? 'var(--gold)' : idx === 1 ? 'var(--info)' : idx === 2 ? '#ec4899' : 'var(--accent)';
        const widthPct = (item.efficiency / maxEff) * 100;

        return (
          <div key={idx} className="db-bar-item-wrap">
            <div className="db-bar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {idx === 0 ? (
                  <Crown size={15} style={{ color: 'var(--gold)' }} />
                ) : (
                  <span style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-overlay)', 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.68rem', 
                    fontWeight: 700,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {idx + 1}
                  </span>
                )}
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                  {item.team_name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {item.total_points} pts / {item.member_count} mem
                </span>
                <span style={{ 
                  background: `${color}15`, 
                  border: `1px solid ${color}40`, 
                  color: color, 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.78rem', 
                  fontWeight: 800 
                }}>
                  {item.efficiency} <span style={{ fontSize: '0.65rem' }}>pts/mem</span>
                </span>
              </div>
            </div>
            <div className="db-bar-track">
              <div 
                className="db-bar-fill" 
                style={{ 
                  width: `${widthPct}%`, 
                  background: `linear-gradient(90deg, ${color}66, ${color})` 
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Team Analytics Container Card ────────────────────────────
function TeamAnalyticsSection({ data = [], totalParticipants = 0, leaderboard = [] }) {
  const [viewMode, setViewMode] = useState('radar'); // 'radar', 'bars', 'efficiency'

  const topTeam = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => b.member_count - a.member_count)[0];
  }, [data]);

  return (
    <div className="glass-panel db-chart-card">
      <div className="db-chart-header">
        <div className="db-chart-title-group">
          <h3 className="db-chart-title">
            <Users size={18} style={{ color: 'var(--accent)' }} />
            Participants by Team
          </h3>
          <span className="db-chart-subtitle">
            {data.length} registered teams | {totalParticipants} total squad members
          </span>
        </div>
        
        {/* Mode switcher pills */}
        <div className="db-view-pills">
          <button 
            className={`db-view-pill ${viewMode === 'radar' ? 'active' : ''}`}
            onClick={() => setViewMode('radar')}
            title="Radar Matrix View"
          >
            <Radio size={13} /> Radar
          </button>
          <button 
            className={`db-view-pill ${viewMode === 'bars' ? 'active' : ''}`}
            onClick={() => setViewMode('bars')}
            title="Bar Chart View"
          >
            <BarChart2 size={13} /> Rank Bars
          </button>
          <button 
            className={`db-view-pill ${viewMode === 'efficiency' ? 'active' : ''}`}
            onClick={() => setViewMode('efficiency')}
            title="Points per Member Efficiency"
          >
            <Zap size={13} /> Efficiency
          </button>
        </div>
      </div>

      <div className="divider" style={{ margin: '0' }} />

      {/* Active Chart View */}
      {viewMode === 'radar' && (
        <RadarChartMatrix data={data} totalParticipants={totalParticipants} leaderboard={leaderboard} />
      )}
      {viewMode === 'bars' && (
        <TeamBarChart data={data} totalParticipants={totalParticipants} leaderboard={leaderboard} />
      )}
      {viewMode === 'efficiency' && (
        <TeamEfficiencyChart data={data} leaderboard={leaderboard} />
      )}

      {/* Chart Footer Highlights */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Largest Squad: <strong style={{ color: 'var(--text-primary)' }}>{topTeam ? topTeam.team_name : 'N/A'}</strong> ({topTeam ? topTeam.member_count : 0} members)</span>
        <span>Avg. Size: <strong style={{ color: 'var(--text-primary)' }}>{data.length ? Math.round(totalParticipants / data.length) : 0}</strong> / team</span>
      </div>
    </div>
  );
}

// ─── Interactive SVG Donut Chart for Categories ───────────────
function CategoryDonutChart({ data = [], totalCount = 0 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', color: 'var(--text-muted)' }}>
        No category distribution data available
      </div>
    );
  }

  const cx = 130;
  const cy = 115;
  const outerR = 90;
  const innerR = 58;

  // Calculate slice angles
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, idx) => {
    const value = item.member_count || 0;
    const share = totalCount > 0 ? value / totalCount : 1 / data.length;
    const angleSpan = share * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle = endAngle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);

    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);

    const largeArc = angleSpan > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

    const color = getCategoryColor(item.category_name, idx);
    const pct = (share * 100).toFixed(1);

    return {
      path,
      color,
      name: item.category_name,
      count: value,
      pct,
      idx
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <div className="db-donut-wrap" style={{ height: '225px' }}>
        <svg width="260" height="230" viewBox="0 0 260 230" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="donutShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Ring Track */}
          <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="var(--bg-overlay)" strokeWidth={outerR - innerR} />

          {/* Slices */}
          {slices.map((slice, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <path
                key={i}
                d={slice.path}
                fill={slice.color}
                opacity={hoveredIdx !== null && !isHovered ? 0.45 : 1}
                className={`db-donut-slice ${isHovered ? 'active' : ''}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              />
            );
          })}
        </svg>

        {/* Center KPI Hub Display */}
        <div className="db-donut-center">
          {activeSlice ? (
            <>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: activeSlice.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {activeSlice.name}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {activeSlice.count}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {activeSlice.pct}% share
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                TOTAL
              </span>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {totalCount}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Participants
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category Interactive Legend Pills */}
      <div className="db-cat-legend-grid">
        {slices.map((slice, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <button
              key={i}
              className={`db-cat-legend-pill ${isHovered ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                borderColor: isHovered ? slice.color : 'var(--border)',
                background: isHovered ? `${slice.color}18` : 'var(--bg-overlay)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: slice.color, boxShadow: isHovered ? `0 0 8px ${slice.color}` : 'none' }} />
              <span style={{ fontWeight: 600, color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {slice.name}
              </span>
              <span style={{ fontWeight: 800, color: slice.color, marginLeft: '0.2rem' }}>
                {slice.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Category Horizontal Progress Bars ────────────────────────
function CategoryProgressBarList({ data = [], totalCount = 0 }) {
  const maxCatCount = Math.max(...data.map(c => c.member_count), 1);

  return (
    <div className="db-bar-list" style={{ minHeight: '260px', padding: '0.5rem 0' }}>
      {data.map((c, idx) => {
        const color = getCategoryColor(c.category_name, idx);
        const widthPercent = (c.member_count / maxCatCount) * 100;
        const pctOfTotal = totalCount > 0 ? ((c.member_count / totalCount) * 100).toFixed(1) : 0;

        return (
          <div key={idx} className="db-bar-item-wrap">
            <div className="db-bar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ 
                  background: `${color}15`, 
                  color: color, 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '0.2rem 0.55rem', 
                  borderRadius: '4px',
                  border: `1px solid ${color}30`
                }}>
                  {c.category_name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {pctOfTotal}% of roster
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {c.member_count} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)' }}>members</span>
                </span>
              </div>
            </div>
            <div className="db-bar-track">
              <div 
                className="db-bar-fill" 
                style={{ 
                  background: `linear-gradient(90deg, ${color}88, ${color})`, 
                  width: `${widthPercent}%` 
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category Competitions Load Chart ─────────────────────────
function CategoryProgramsLoadChart({ programsByCategory = [], totalPrograms = 0 }) {
  if (!programsByCategory || programsByCategory.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', color: 'var(--text-muted)' }}>
        No category competition data available
      </div>
    );
  }

  const maxProgs = Math.max(...programsByCategory.map(p => p.programs_count), 1);

  return (
    <div className="db-bar-list" style={{ minHeight: '260px', padding: '0.5rem 0' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Layers size={13} style={{ color: 'var(--accent)' }} /> Distribution of {totalPrograms} total competitions across categories
      </div>
      {programsByCategory.map((item, idx) => {
        const color = getCategoryColor(item.category_name, idx);
        const widthPct = (item.programs_count / maxProgs) * 100;
        const pct = totalPrograms > 0 ? ((item.programs_count / totalPrograms) * 100).toFixed(1) : 0;

        return (
          <div key={idx} className="db-bar-item-wrap">
            <div className="db-bar-header">
              <span style={{ 
                background: `${color}15`, 
                color: color, 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '0.2rem 0.55rem', 
                borderRadius: '4px',
                border: `1px solid ${color}30`
              }}>
                {item.category_name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {pct}% of events
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {item.programs_count} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)' }}>events</span>
                </span>
              </div>
            </div>
            <div className="db-bar-track">
              <div 
                className="db-bar-fill" 
                style={{ 
                  background: `linear-gradient(90deg, ${color}77, ${color})`, 
                  width: `${widthPct}%` 
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category Analytics Container Card ────────────────────────
function CategoryAnalyticsSection({ data = [], programsByCategory = [], totalPrograms = 0, totalParticipants = 0 }) {
  const [viewMode, setViewMode] = useState('donut'); // 'donut', 'bars', 'programs'

  const dominantCat = useMemo(() => {
    if (!data || data.length === 0) return null;
    return [...data].sort((a, b) => b.member_count - a.member_count)[0];
  }, [data]);

  return (
    <div className="glass-panel db-chart-card">
      <div className="db-chart-header">
        <div className="db-chart-title-group">
          <h3 className="db-chart-title">
            <FileText size={18} style={{ color: 'var(--accent)' }} />
            Participants by Category
          </h3>
          <span className="db-chart-subtitle">
            {data.length} event groups | {totalParticipants} participants
          </span>
        </div>

        {/* Mode switcher pills */}
        <div className="db-view-pills">
          <button 
            className={`db-view-pill ${viewMode === 'donut' ? 'active' : ''}`}
            onClick={() => setViewMode('donut')}
            title="Interactive Donut View"
          >
            <PieIcon size={13} /> Donut
          </button>
          <button 
            className={`db-view-pill ${viewMode === 'bars' ? 'active' : ''}`}
            onClick={() => setViewMode('bars')}
            title="Ranked Bar Distribution"
          >
            <BarChart2 size={13} /> Bars
          </button>
          <button 
            className={`db-view-pill ${viewMode === 'programs' ? 'active' : ''}`}
            onClick={() => setViewMode('programs')}
            title="Competitions per Category"
          >
            <Layers size={13} /> Events Load
          </button>
        </div>
      </div>

      <div className="divider" style={{ margin: '0' }} />

      {/* Active Chart View */}
      {viewMode === 'donut' && (
        <CategoryDonutChart data={data} totalCount={totalParticipants} />
      )}
      {viewMode === 'bars' && (
        <CategoryProgressBarList data={data} totalCount={totalParticipants} />
      )}
      {viewMode === 'programs' && (
        <CategoryProgramsLoadChart programsByCategory={programsByCategory} totalPrograms={totalPrograms} />
      )}

      {/* Chart Footer Highlights */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Dominant Group: <strong style={{ color: 'var(--text-primary)' }}>{dominantCat ? dominantCat.category_name : 'N/A'}</strong> ({dominantCat ? dominantCat.member_count : 0} members)</span>
        <span>Categories: <strong style={{ color: 'var(--text-primary)' }}>{data.length}</strong></span>
      </div>
    </div>
  );
}

// ─── Individual Toppers / Category Champions Card ─────────────
function IndividualToppersCard({ topPerformers = [], categoryToppers = [] }) {
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' or 'categories'

  const rawList = activeTab === 'overall' ? topPerformers : categoryToppers;
  const performersList = (rawList || []).slice(0, 3);

  return (
    <div className="db-topper-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={15} style={{ color: 'var(--gold)' }} /> Individual Toppers
        </span>
        
        {/* Toggle Pills */}
        <div className="db-view-pills" style={{ padding: '2px' }}>
          <button
            className={`db-view-pill ${activeTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveTab('overall')}
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            title="Overall Top Performers"
          >
            Overall
          </button>
          <button
            className={`db-view-pill ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            title="Category Champions"
          >
            Category
          </button>
        </div>
      </div>

      <div className="db-topper-list">
        {(!performersList || performersList.length === 0) ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', color: 'var(--text-muted)', textAlign: 'center', gap: '0.35rem' }}>
            <Award size={22} style={{ color: 'var(--accent)', opacity: 0.6 }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>No individual points recorded yet</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Publishes automatically as single events conclude</span>
          </div>
        ) : (
          performersList.map((item, idx) => {
            const memberName = item.member__name || item.member_name || 'Participant';
            const teamName = item.member__team__name || item.team_name || 'Team';
            const categoryName = item.member__category__name || item.category_name || '';
            const points = item.total_points || 0;
            const events = item.events_count || 0;
            const isFirst = idx === 0;

            return (
              <div 
                key={idx} 
                className={`db-topper-item ${isFirst ? 'db-topper-item-rank1' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                  {/* Rank Circle */}
                  <div className={`db-rank-circle ${
                    isFirst ? 'db-rank-circle-1' : 
                    idx === 1 ? 'db-rank-circle-2' : 
                    idx === 2 ? 'db-rank-circle-3' : 'db-rank-circle-default'
                  }`} style={{ width: '22px', height: '22px', fontSize: '0.7rem', flexShrink: 0 }}>
                    {isFirst ? <Crown size={12} style={{ color: 'var(--gold)' }} /> : (idx + 1)}
                  </div>
                  
                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {memberName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{teamName}</span>
                      {categoryName && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--accent)' }}>{categoryName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Events Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {events > 0 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {events} evt{events > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="db-topper-points-badge">
                    {points} <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>pts</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Festival Operations & Progression Pulse Section ──────────
function FestivalOperationsPulse({ stats }) {
  const totalPrograms = stats?.programs_count || 0;
  const finalPrograms = stats?.final_programs_count || 0;
  const activePrograms = stats?.active_programs_count || 0;
  const scheduledPrograms = stats?.scheduled_programs_count || 0;
  const upcomingPrograms = Math.max(totalPrograms - finalPrograms - activePrograms, 0);

  const progCompletionPct = totalPrograms > 0 ? Math.round((finalPrograms / totalPrograms) * 100) : 0;

  const marksheetsSubmitted = stats?.marksheets_submitted || 0;
  const marksheetsPending = stats?.marksheets_pending || 0;
  const totalMarksheets = marksheetsSubmitted + marksheetsPending;
  const marksheetCompletionPct = totalMarksheets > 0 ? Math.round((marksheetsSubmitted / totalMarksheets) * 100) : 100;

  // Podium teams
  const leaderboard = stats?.team_leaderboard || [];
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Individual Toppers data
  const topPerformers = stats?.top_performers || [];
  const categoryToppers = stats?.category_toppers || [];

  // SVG Gauge calculations
  const gaugeR = 40;
  const gaugeCircumference = 2 * Math.PI * gaugeR;
  const progOffset = gaugeCircumference * (1 - progCompletionPct / 100);
  const marksheetOffset = gaugeCircumference * (1 - marksheetCompletionPct / 100);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="db-chart-title-group">
          <h3 className="db-chart-title">
            <Activity size={18} style={{ color: 'var(--accent)' }} />
            Festival Operations & Progression Pulse
          </h3>
          <span className="db-chart-subtitle">
            Real-time evaluation completion rates, event pipeline, and team & individual leaderboards
          </span>
        </div>
        <span className="db-chart-badge">
          <Sparkles size={13} /> Live System Telemetry
        </span>
      </div>

      <div className="divider" style={{ margin: '0' }} />

      <div className="db-health-grid">
        
        {/* Gauge 1: Competition Progress Pipeline */}
        <div className="db-gauge-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={15} style={{ color: 'var(--accent)' }} /> Competition Status
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {finalPrograms}/{totalPrograms} Finalized
            </span>
          </div>

          <div className="db-gauge-body">
            <div className="db-gauge-ring-wrap">
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="50" cy="50" r={gaugeR} 
                  fill="none" 
                  stroke="var(--bg-overlay)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="50" cy="50" r={gaugeR} 
                  fill="none" 
                  stroke="var(--accent)" 
                  strokeWidth="8" 
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={progOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="db-gauge-ring-center">
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {progCompletionPct}%
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  COMPLETED
                </span>
              </div>
            </div>

            <div className="db-gauge-legend">
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--success)' }} /> Final / Results</span>
                <strong style={{ color: 'var(--text-primary)' }}>{finalPrograms}</strong>
              </div>
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--warning)' }} /> In-Progress</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activePrograms}</strong>
              </div>
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--info)' }} /> Scheduled / Queued</span>
                <strong style={{ color: 'var(--text-primary)' }}>{upcomingPrograms}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Gauge 2: Marksheet Evaluation Speed */}
        <div className="db-gauge-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Gavel size={15} style={{ color: '#ec4899' }} /> Evaluation Health
            </span>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: marksheetsPending === 0 ? 'var(--success)' : 'var(--warning)',
              background: marksheetsPending === 0 ? 'var(--success-soft)' : 'var(--warning-soft)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              {marksheetsPending === 0 ? 'All Evaluated' : `${marksheetsPending} Pending`}
            </span>
          </div>

          <div className="db-gauge-body">
            <div className="db-gauge-ring-wrap">
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle 
                  cx="50" cy="50" r={gaugeR} 
                  fill="none" 
                  stroke="var(--bg-overlay)" 
                  strokeWidth="8" 
                />
                <circle 
                  cx="50" cy="50" r={gaugeR} 
                  fill="none" 
                  stroke="var(--success)" 
                  strokeWidth="8" 
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={marksheetOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="db-gauge-ring-center">
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {marksheetCompletionPct}%
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  EVALUATED
                </span>
              </div>
            </div>

            <div className="db-gauge-legend">
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--success)' }} /> Evaluated Marksheets</span>
                <strong style={{ color: 'var(--text-primary)' }}>{marksheetsSubmitted}</strong>
              </div>
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--danger)' }} /> Pending Judgments</span>
                <strong style={{ color: 'var(--text-primary)' }}>{marksheetsPending}</strong>
              </div>
              <div className="db-gauge-legend-item">
                <span><span className="db-gauge-legend-dot" style={{ background: 'var(--info)' }} /> Active Judges</span>
                <strong style={{ color: 'var(--text-primary)' }}>{stats?.judges_count || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Gauge 3: Team Standings Podium */}
        <div className="db-gauge-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Medal size={15} style={{ color: 'var(--gold)' }} /> Top Teams Podium
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Live Scoreboard
            </span>
          </div>

          <div className="db-podium-display">
            {/* 2nd Place */}
            <div className="db-podium-column">
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {top2 ? top2.team_name : '—'}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--info)' }}>
                  {top2 ? `${top2.total_points} pts` : ''}
                </span>
              </div>
              <div className="db-podium-pillar" style={{ height: '65px', background: 'linear-gradient(180deg, #38bdf8, #0284c7)' }}>
                2
              </div>
            </div>

            {/* 1st Place */}
            <div className="db-podium-column">
              <Crown size={16} style={{ color: 'var(--gold)', marginBottom: '-3px' }} />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {top1 ? top1.team_name : '—'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)' }}>
                  {top1 ? `${top1.total_points} pts` : ''}
                </span>
              </div>
              <div className="db-podium-pillar" style={{ height: '90px', background: 'linear-gradient(180deg, #f59e0b, #d97706)' }}>
                1
              </div>
            </div>

            {/* 3rd Place */}
            <div className="db-podium-column">
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {top3 ? top3.team_name : '—'}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--bronze)' }}>
                  {top3 ? `${top3.total_points} pts` : ''}
                </span>
              </div>
              <div className="db-podium-pillar" style={{ height: '48px', background: 'linear-gradient(180deg, #d97706, #b45309)' }}>
                3
              </div>
            </div>
          </div>
        </div>

        {/* Gauge 4: Individual Toppers Card (Side of Podium!) */}
        <IndividualToppersCard 
          topPerformers={topPerformers} 
          categoryToppers={categoryToppers} 
        />

      </div>
    </div>
  );
}

// ─── Main Export: DashboardOverview Component ──────────────────
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

  const categoryData = stats?.participants_by_category || [];
  const teamData = stats?.participants_by_team || [];
  const totalParticipants = stats?.members_count || 0;
  const programsByCategory = stats?.programs_by_category || [];
  const totalPrograms = stats?.programs_count || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ─── Dashboard Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Admin Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
            Real-time analytics, event telemetry, scoring intelligence, and fest administration
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          <RefreshCw className="spinning" size={32} style={{ color: 'var(--accent)' }} />
        </div>
      ) : (
        <div className="db-layout">
          
          {/* ─── Left Section (Stats Grid + Visualizations + Operations Pulse) ─── */}
          <div className="db-left-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 3x2 KPI Stats Cards */}
            <div className="db-stats-grid">
              
              {/* Card 1: Participants */}
              <div className="db-stat-card">
                <div className="db-stat-info">
                  <span className="db-stat-label">Participants</span>
                  <span className="db-stat-value">{stats?.members_count || 0}</span>
                  <span className="db-stat-sub">Registered across teams</span>
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
                  <span className="db-stat-sub">Competing squads</span>
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
                  <span className="db-stat-sub">Event divisions</span>
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
                  <span className="db-stat-sub">Venues & platforms</span>
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
                  <span className="db-stat-sub">Authorized evaluators</span>
                </div>
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                  <Gavel size={20} />
                </div>
              </div>

            </div>

            {/* Advanced Interactive Visualizations Grid */}
            <div className="db-charts-grid">
              
              {/* Chart 1: Participants by Team with Radar, Bars, and Efficiency Modes */}
              <TeamAnalyticsSection 
                data={teamData} 
                totalParticipants={totalParticipants} 
                leaderboard={rawLeaderboard} 
              />

              {/* Chart 2: Participants by Category with Donut, Bars, and Events Load Modes */}
              <CategoryAnalyticsSection 
                data={categoryData} 
                programsByCategory={programsByCategory}
                totalPrograms={totalPrograms}
                totalParticipants={totalParticipants} 
              />

            </div>

            {/* Festival Operations & Progression Pulse */}
            <FestivalOperationsPulse stats={stats} />

          </div>

          {/* ─── Right Section (Team Leaderboard) ─── */}
          <div className="glass-panel db-leaderboard-card">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
                <Trophy size={18} style={{ color: 'var(--gold)' }} /> Team Leaderboard
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Overall Standings
              </span>
            </div>
            
            <div className="divider" style={{ margin: '0.75rem 0' }} />
            
            <div className="db-leaderboard-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', maxHeight: '720px' }}>
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
