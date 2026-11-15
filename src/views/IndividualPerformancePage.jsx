import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import EduFenstaNav from '../components/EduFenstaNav';
import EduFenstaFooter from '../components/EduFenstaFooter';
import './IndividualPerformancePage.css';

import {
  Trophy,
  Award,
  Medal,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function IndividualPerformancePage({ isEmbedded = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [prizeFilter, setPrizeFilter] = useState('all'); // 'all' | '1' | '2' | '3' | '1_2' | 'top3'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'single' | 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points'); // 'points' | 'prizes' | 'name' | 'chest_no'

  // Expand / collapse map (all expanded by default for instant reading)
  const [collapsedMembers, setCollapsedMembers] = useState({});

  const toggleCollapse = (id) => {
    setCollapsedMembers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => setCollapsedMembers({});
  const collapseAll = () => {
    if (!data?.performers) return;
    const all = {};
    data.performers.forEach(p => { all[p.member_id] = true; });
    setCollapsedMembers(all);
  };

  const fetchPerformers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/performers/`);
      if (!res.ok) throw new Error('Failed to load individual performance data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Error fetching performers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmbedded) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    fetchPerformers();
  }, [isEmbedded]);

  // Clean Print Trigger (Clears title temporarily to prevent browser header print)
  const triggerPrint = () => {
    const origTitle = document.title;
    document.title = ' ';
    window.print();
    setTimeout(() => {
      document.title = origTitle;
    }, 1000);
  };

  // Client-side filtering & sorting for zero-latency instant responsiveness
  const filteredPerformers = useMemo(() => {
    if (!data?.performers) return [];

    let list = [...data.performers];

    // Filter by Item Type
    if (typeFilter !== 'all') {
      list = list.map(p => ({
        ...p,
        programs: p.programs.filter(pr => pr.program_type === typeFilter)
      })).filter(p => p.programs.length > 0);
    }

    // Filter by Category
    if (categoryFilter !== 'ALL') {
      list = list.filter(p => 
        String(p.category_name).toLowerCase() === String(categoryFilter).toLowerCase() ||
        String(p.category_id) === String(categoryFilter)
      );
    }

    // Filter by Team
    if (teamFilter !== 'ALL') {
      list = list.filter(p => 
        String(p.team_name).toLowerCase() === String(teamFilter).toLowerCase() ||
        String(p.team_id) === String(teamFilter)
      );
    }

    // Filter by Prize (1st, 2nd, 3rd, 1st & 2nd, Top 3)
    if (prizeFilter === '1') {
      list = list.filter(p => p.has_first_prize || p.programs.some(pr => pr.rank === 1));
    } else if (prizeFilter === '2') {
      list = list.filter(p => p.has_second_prize || p.programs.some(pr => pr.rank === 2));
    } else if (prizeFilter === '3') {
      list = list.filter(p => p.has_third_prize || p.programs.some(pr => pr.rank === 3));
    } else if (prizeFilter === '1_2') {
      list = list.filter(p => 
        p.has_first_prize || p.has_second_prize || 
        p.programs.some(pr => pr.rank === 1 || pr.rank === 2)
      );
    } else if (prizeFilter === 'top3') {
      list = list.filter(p => 
        p.prizes_count.total > 0 || 
        p.programs.some(pr => pr.rank >= 1 && pr.rank <= 3)
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => {
        const matchName = (p.member_name || '').toLowerCase().includes(q);
        const matchChest = String(p.chest_no || '').includes(q);
        const matchTeam = (p.team_name || '').toLowerCase().includes(q);
        const matchCat = (p.category_name || '').toLowerCase().includes(q);
        const matchProg = p.programs.some(pr => (pr.program_name || '').toLowerCase().includes(q));
        return matchName || matchChest || matchTeam || matchCat || matchProg;
      });
    }

    // Sorting
    if (sortBy === 'name') {
      list.sort((a, b) => a.member_name.localeCompare(b.member_name));
    } else if (sortBy === 'chest_no') {
      list.sort((a, b) => (a.chest_no || 0) - (b.chest_no || 0));
    } else if (sortBy === 'prizes') {
      list.sort((a, b) => (
        b.prizes_count.first - a.prizes_count.first ||
        b.prizes_count.second - a.prizes_count.second ||
        b.prizes_count.third - a.prizes_count.third ||
        b.total_points - a.total_points
      ));
    } else {
      // points (default)
      list.sort((a, b) => (
        b.total_points - a.total_points ||
        b.prizes_count.first - a.prizes_count.first ||
        (a.best_rank || 999) - (b.best_rank || 999)
      ));
    }

    return list;
  }, [data, prizeFilter, categoryFilter, teamFilter, typeFilter, searchQuery, sortBy]);

  // Overall KPI statistics
  const summaryStats = useMemo(() => {
    if (!data?.performers) return { totalParticipants: 0, firstPrizes: 0, secondPrizes: 0, thirdPrizes: 0, totalPts: 0 };
    return {
      totalParticipants: data.performers.length,
      firstPrizes: data.meta?.total_first_prizes || 0,
      secondPrizes: data.meta?.total_second_prizes || 0,
      thirdPrizes: data.meta?.total_third_prizes || 0,
      totalPts: data.meta?.total_points_awarded || 0,
      categories: data.meta?.categories || [],
      teams: data.meta?.teams || []
    };
  }, [data]);

  const hasActiveFilters = prizeFilter !== 'all' || categoryFilter !== 'ALL' || teamFilter !== 'ALL' || typeFilter !== 'all' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setPrizeFilter('all');
    setCategoryFilter('ALL');
    setTeamFilter('ALL');
    setTypeFilter('all');
    setSearchQuery('');
    setSortBy('points');
  };

  const content = (
    <div className={`perf-page ${isEmbedded ? 'perf-page--embedded' : 'perf-page--public'}`}>
      
      {/* ─────────────────────────────────────────────────────────────
          HERO & HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="perf-hero no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="perf-hero__title">
              <Trophy size={28} style={{ color: 'var(--gold, #f59e0b)' }} />
              Individual Performance & Grades
            </h1>
            <p className="perf-hero__sub">
              Detailed performance directory of each participant with registered events, prizes (1st, 2nd, 3rd), grades, and points scored.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={fetchPerformers}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh
            </button>
            <button
              type="button"
              onClick={triggerPrint}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Printer size={15} /> Print View
            </button>
          </div>
        </div>

        {/* KPI Summary Stat Counters */}
        <div className="perf-stats-grid">
          <div className="perf-stat-card">
            <div className="perf-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent, #6366f1)' }}>
              <Users size={20} />
            </div>
            <div>
              <div className="perf-stat-val">{summaryStats.totalParticipants}</div>
              <div className="perf-stat-lbl">Active Performers</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="perf-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <span>🥇</span>
            </div>
            <div>
              <div className="perf-stat-val" style={{ color: '#fbbf24' }}>{summaryStats.firstPrizes}</div>
              <div className="perf-stat-lbl">1st Prizes Awarded</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="perf-stat-icon" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#e2e8f0' }}>
              <span>🥈</span>
            </div>
            <div>
              <div className="perf-stat-val" style={{ color: '#e2e8f0' }}>{summaryStats.secondPrizes}</div>
              <div className="perf-stat-lbl">2nd Prizes Awarded</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="perf-stat-icon" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#f97316' }}>
              <span>🥉</span>
            </div>
            <div>
              <div className="perf-stat-val" style={{ color: '#f97316' }}>{summaryStats.thirdPrizes}</div>
              <div className="perf-stat-lbl">3rd Prizes Awarded</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="perf-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success, #22c55e)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className="perf-stat-val" style={{ color: 'var(--success, #22c55e)' }}>{summaryStats.totalPts}</div>
              <div className="perf-stat-lbl">Total Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONTROLS & FILTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="perf-controls no-print">
        {/* Prize Filter Option Buttons (Prominent) */}
        <div className="perf-prize-filter-wrap">
          <div className="perf-filter-title">
            <Medal size={14} /> Filter by Prize Won:
          </div>
          <div className="perf-prize-pills">
            <button
              type="button"
              onClick={() => setPrizeFilter('all')}
              className={`perf-prize-pill ${prizeFilter === 'all' ? 'perf-prize-pill--active' : ''}`}
            >
              🌟 All Participants ({summaryStats.totalParticipants})
            </button>
            <button
              type="button"
              onClick={() => setPrizeFilter('1')}
              className={`perf-prize-pill perf-prize-pill--gold ${prizeFilter === '1' ? 'perf-prize-pill--active' : ''}`}
            >
              🥇 1st Prize Winners
            </button>
            <button
              type="button"
              onClick={() => setPrizeFilter('2')}
              className={`perf-prize-pill perf-prize-pill--silver ${prizeFilter === '2' ? 'perf-prize-pill--active' : ''}`}
            >
              🥈 2nd Prize Winners
            </button>
            <button
              type="button"
              onClick={() => setPrizeFilter('3')}
              className={`perf-prize-pill perf-prize-pill--bronze ${prizeFilter === '3' ? 'perf-prize-pill--active' : ''}`}
            >
              🥉 3rd Prize Winners
            </button>
            <button
              type="button"
              onClick={() => setPrizeFilter('1_2')}
              className={`perf-prize-pill ${prizeFilter === '1_2' ? 'perf-prize-pill--active' : ''}`}
            >
              🥇🥈 1st & 2nd Prizes
            </button>
            <button
              type="button"
              onClick={() => setPrizeFilter('top3')}
              className={`perf-prize-pill ${prizeFilter === 'top3' ? 'perf-prize-pill--active' : ''}`}
            >
              🏆 Any Prize (Top 3)
            </button>
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="perf-inputs-row">
          <div className="perf-search-wrap">
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="perf-search-input"
              placeholder="Search candidate name, chest #, team, or program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            className="perf-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {summaryStats.categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Team Dropdown */}
          <select
            className="perf-select"
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
          >
            <option value="ALL">All Teams</option>
            {summaryStats.teams.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>

          {/* Item Type Dropdown */}
          <select
            className="perf-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Events (Single & Group)</option>
            <option value="single">Single Events Only</option>
            <option value="group">Group Events Only</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            className="perf-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="points">Sort: Total Points (High to Low)</option>
            <option value="prizes">Sort: Most 1st Prizes</option>
            <option value="chest_no">Sort: Chest Number (Ascending)</option>
            <option value="name">Sort: Name (A to Z)</option>
          </select>

          {/* Expand / Collapse Controls */}
          <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={expandAll}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              title="Expand all programs breakdown"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              title="Collapse all programs breakdown"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-glass, rgba(255, 255, 255, 0.05))' }}>
          <div>
            Showing <strong>{filteredPerformers.length}</strong> of <strong>{summaryStats.totalParticipants}</strong> participants
            {hasActiveFilters && <span style={{ color: 'var(--accent, #6366f1)', marginLeft: '6px' }}>• Filters active</span>}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{ background: 'none', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
            >
              <X size={13} /> Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          OFFICIAL PRINT HEADER (Only visible when printing)
      ───────────────────────────────────────────────────────────── */}
      <div className="print-header" style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.04em' }}>
          Individual Performance & Grades Directory
        </h2>
        <div style={{ fontSize: '0.82rem', marginTop: '0.25rem', color: '#444' }}>
          {prizeFilter === '1' && <span>Scope: <strong>1st Prize Winners</strong> • </span>}
          {prizeFilter === '2' && <span>Scope: <strong>2nd Prize Winners</strong> • </span>}
          {prizeFilter === '3' && <span>Scope: <strong>3rd Prize Winners</strong> • </span>}
          {prizeFilter === '1_2' && <span>Scope: <strong>1st & 2nd Prize Winners</strong> • </span>}
          {categoryFilter !== 'ALL' && <span>Category: <strong>{categoryFilter}</strong> • </span>}
          {teamFilter !== 'ALL' && <span>Team: <strong>{teamFilter}</strong> • </span>}
          <span>Total Participants: <strong>{filteredPerformers.length}</strong></span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LOADING / ERROR / EMPTY STATES
      ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', gap: '1rem' }}>
          <RefreshCw size={36} className="spinning" style={{ color: 'var(--accent, #6366f1)' }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading participant performance records...</div>
        </div>
      ) : error ? (
        <div className="perf-empty">
          <div style={{ color: 'var(--danger, #ef4444)', fontSize: '2rem' }}>⚠️</div>
          <div className="perf-empty__title">Failed to load performance data</div>
          <p className="perf-empty__sub">{error}</p>
          <button type="button" onClick={fetchPerformers} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : filteredPerformers.length === 0 ? (
        <div className="perf-empty">
          <Medal size={42} style={{ color: 'var(--text-muted)' }} />
          <div className="perf-empty__title">No participants found</div>
          <p className="perf-empty__sub">
            No participants match your current filter selection ({prizeFilter !== 'all' ? `Prize: ${prizeFilter}` : ''} {categoryFilter !== 'ALL' ? `Category: ${categoryFilter}` : ''}).
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="btn btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            PARTICIPANTS PERFORMANCE CARDS & BREAKDOWN TABLES
        ───────────────────────────────────────────────────────────── */
        <div>
          {filteredPerformers.map((p, idx) => {
            const isTop1 = idx === 0 && sortBy === 'points';
            const isTop2 = idx === 1 && sortBy === 'points';
            const isTop3 = idx === 2 && sortBy === 'points';

            const podiumClass = isTop1 ? 'perf-card--podium-1' : isTop2 ? 'perf-card--podium-2' : isTop3 ? 'perf-card--podium-3' : '';
            const rankCircleClass = isTop1 ? 'perf-rank-circle--gold' : isTop2 ? 'perf-rank-circle--silver' : isTop3 ? 'perf-rank-circle--bronze' : '';

            const isCollapsed = Boolean(collapsedMembers[p.member_id]);

            return (
              <div key={p.member_id} className={`perf-card ${podiumClass}`}>
                {/* Participant Header Bar */}
                <div className="perf-card-header">
                  <div className="perf-card-meta">
                    <div className={`perf-rank-circle ${rankCircleClass}`}>
                      {p.leaderboard_rank || idx + 1}
                    </div>
                    <div>
                      <h3 className="perf-card-name">
                        {p.member_name}
                      </h3>
                      <div className="perf-card-tags">
                        {p.chest_no && (
                          <span className="tag tag-primary" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                            Chest #{p.chest_no}
                          </span>
                        )}
                        <span className="tag tag-secondary" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                          {p.team_name}
                        </span>
                        <span className="tag" style={{ fontSize: '0.72rem', padding: '1px 6px', borderColor: 'var(--border-glass)' }}>
                          {p.category_name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({p.events_count} {p.events_count === 1 ? 'event' : 'events'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="perf-card-pts-wrap">
                    {/* Prizes Summary Badges */}
                    <div className="perf-prizes-summary">
                      {p.prizes_count.first > 0 && (
                        <span className="perf-prize-badge perf-prize-badge--1st" title={`${p.prizes_count.first} First Prizes`}>
                          🥇 {p.prizes_count.first}x 1st
                        </span>
                      )}
                      {p.prizes_count.second > 0 && (
                        <span className="perf-prize-badge perf-prize-badge--2nd" title={`${p.prizes_count.second} Second Prizes`}>
                          🥈 {p.prizes_count.second}x 2nd
                        </span>
                      )}
                      {p.prizes_count.third > 0 && (
                        <span className="perf-prize-badge perf-prize-badge--3rd" title={`${p.prizes_count.third} Third Prizes`}>
                          🥉 {p.prizes_count.third}x 3rd
                        </span>
                      )}
                    </div>

                    {/* Total Points */}
                    <div className="perf-total-badge">
                      <div className="perf-total-pts">{p.total_points}</div>
                      <div className="perf-total-lbl">Total PTS</div>
                    </div>

                    {/* Collapse / Expand Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleCollapse(p.member_id)}
                      className="btn btn-secondary no-print"
                      style={{ padding: '0.35rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                      title={isCollapsed ? 'Show program details' : 'Hide program details'}
                    >
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>

                {/* Programs Breakdown Table */}
                {!isCollapsed && (
                  <div className="perf-programs-table-wrap">
                    <table className="perf-table custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>Program / Item Name</th>
                          <th style={{ width: '100px' }}>Item Scope</th>
                          <th style={{ width: '130px' }}>Prize / Rank</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Grade</th>
                          <th style={{ width: '85px', textAlign: 'center' }}>Avg Marks</th>
                          <th style={{ width: '90px', textAlign: 'right' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.programs.map((pr, prIdx) => (
                          <tr key={pr.program_id || prIdx}>
                            <td style={{ color: 'var(--text-muted)' }}>{prIdx + 1}</td>
                            <td style={{ fontWeight: 600 }}>
                              {pr.program_name}
                              {pr.category_name && pr.category_name !== p.category_name && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                                  ({pr.category_name})
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`tag ${pr.program_type === 'group' ? 'tag-warning' : 'tag-primary'}`}
                                style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                              >
                                {pr.program_type === 'group' ? 'Group Item' : 'Single Item'}
                              </span>
                            </td>
                            <td>
                              {pr.rank === 1 ? (
                                <span className="perf-prize-badge perf-prize-badge--1st">
                                  🥇 1st Prize {pr.is_tie && <span style={{ fontSize: '0.65rem' }}>(Tie)</span>}
                                </span>
                              ) : pr.rank === 2 ? (
                                <span className="perf-prize-badge perf-prize-badge--2nd">
                                  🥈 2nd Prize {pr.is_tie && <span style={{ fontSize: '0.65rem' }}>(Tie)</span>}
                                </span>
                              ) : pr.rank === 3 ? (
                                <span className="perf-prize-badge perf-prize-badge--3rd">
                                  🥉 3rd Prize {pr.is_tie && <span style={{ fontSize: '0.65rem' }}>(Tie)</span>}
                                </span>
                              ) : pr.rank != null ? (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  Rank #{pr.rank}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Evaluated</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {pr.grade ? (
                                <span className="perf-grade-pill">
                                  Grade {pr.grade}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                              {pr.total_marks != null ? pr.total_marks : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: pr.points > 0 ? 'var(--success, #22c55e)' : 'var(--text-muted)' }}>
                              {pr.points != null ? `${pr.points} pts` : '0 pts'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <>
      <EduFenstaNav activePage="performers" />
      {content}
      <EduFenstaFooter />
    </>
  );
}
