import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { RindPeelCard } from '../components/peel-card';
import './EduFenstaHomePage.css';

/* ─── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ end, duration = 800, isVisible = false, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible || !end) return;
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
  }, [end, duration, isVisible]);

  return <>{count.toLocaleString()}{suffix}</>;
}

/* ─── Intersection Observer Hook ───────────────────────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

/* ═══════════════════════════════════════════════════════════════
   EDUFENSTA HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function EduFenstaHomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [festData, setFestData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const lastScrollY = useRef(0);

  // Dynamic portal redirect for authenticated users
  const portalInfo = React.useMemo(() => {
    if (!isAuthenticated || !user) return { to: '/login', label: 'LOGIN' };
    switch (user.role) {
      case 'admin':
        return { to: '/admin', label: 'ADMIN PANEL' };
      case 'judge':
        return { to: '/judge', label: 'JUDGE PANEL' };
      case 'teamlead':
        return { to: '/teamlead', label: 'TEAM PANEL' };
      default:
        return { to: '/admin', label: 'PORTAL' };
    }
  }, [isAuthenticated, user]);

  // Fetch live stats from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
        if (res.ok && isMounted) {
          const json = await res.json();
          setFestData(json);
        }
      } catch (err) {
        console.error('Failed to fetch fest stats:', err);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  // Scroll handler — navbar show/hide
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setNavHidden(y > 200 && y > lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Section visibility refs
  const [countsHeaderRef, countsHeaderVisible] = useInView();
  const [countersRef, countersVisible] = useInView();
  const [statsHeaderRef, statsHeaderVisible] = useInView();
  const [leaderboardRef, leaderboardVisible] = useInView();
  const [resultsHeaderRef, resultsHeaderVisible] = useInView();
  const [resultsGridRef, resultsGridVisible] = useInView();

  // ── Metrics from Database API ──
  const participantsCount = festData?.stats?.participants ?? 0;
  const eventsCount = festData?.stats?.programs ?? 0;
  const teamsCount = festData?.stats?.teams ?? 0;
  const daysCount = festData?.stats?.days ?? 0;

  // ── Categories List ──
  const categoriesList = React.useMemo(() => {
    const cats = festData?.categories || [];
    if (cats.length > 0) {
      return cats.map(c => c.name);
    }
    return ['Low Zone', 'Mid Zone', 'High Zone', 'General'];
  }, [festData]);

  // ── Program Name to Category Map ──
  const progCategoryMap = React.useMemo(() => {
    const map = new Map();
    (festData?.schedule || []).forEach(p => {
      if (p.name && p.category_name) {
        map.set(p.name.trim().toLowerCase(), p.category_name);
      }
    });
    (festData?.recent_results || []).forEach(r => {
      if (r.program_name && r.category_name) {
        map.set(r.program_name.trim().toLowerCase(), r.category_name);
      }
    });
    (festData?.programs_with_results || []).forEach(p => {
      if (p.name && p.category_name) {
        map.set(p.name.trim().toLowerCase(), p.category_name);
      }
    });
    return map;
  }, [festData]);

  // ── Live Team Leaderboard with Category-Based Points ──
  const dbTeams = React.useMemo(() => {
    const rawLeaderboard = festData?.leaderboard || [];
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
      };
    });
  }, [festData, categoriesList, progCategoryMap]);

  const leaderboardGridStyle = {
    display: 'grid',
    gridTemplateColumns: `50px minmax(130px, 2fr) repeat(${categoriesList.length}, minmax(80px, 1fr)) minmax(90px, 1fr)`,
  };

  // ── Recent Event Results from Database ──
  const groupedResults = React.useMemo(() => {
    const rawResults = festData?.recent_results || [];
    if (!rawResults || rawResults.length === 0) return [];
    const map = new Map();
    rawResults.forEach((r) => {
      const pName = r.program_name || `Program #${r.program}`;
      if (!map.has(pName)) {
        map.set(pName, {
          programId: r.program,
          programName: pName,
          categoryName: r.category_name || '',
          ranks: [],
        });
      }
      map.get(pName).ranks.push(r);
    });

    return Array.from(map.values())
      .map((p) => ({
        ...p,
        ranks: p.ranks.sort((a, b) => a.rank - b.rank).slice(0, 3),
      }))
      .slice(0, 6);
  }, [festData]);

  const marqueeItems = [
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
  ];
  const marqueeTrack = [...marqueeItems, ...marqueeItems];

  const navLinks = [
    { label: 'Home', to: '/edufensta', active: true },
    { label: 'Standings', to: '/team-status' },
    { label: 'Results', to: '/results' },
    { label: 'Demo', to: '/demo' },
  ];

  const handleSmoothScroll = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`edufensta-page ${!previewMode ? 'edufensta-page--blurred' : ''}`}>

      {/* ════════════════════════════════════════════════════════════
          UNDER DEVELOPMENT BLUR OVERLAY
      ════════════════════════════════════════════════════════════ */}
      {!previewMode && (
        <div className="ef-under-dev-overlay" role="dialog" aria-modal="true">
          <div className="ef-under-dev-card">
            {/* Ambient background aura */}
            <div className="ef-under-dev-glow" />

            {/* Pulsing status pill */}
            <div className="ef-under-dev-badge">
              <span className="ef-under-dev-badge__dot" />
              <span>UNDER ACTIVE DEVELOPMENT</span>
            </div>

            {/* Brand Logo or Icon */}
            <div className="ef-under-dev-logo-wrap">
              <img 
                src="/edufensta-logo.png" 
                alt="EduFensta Logo" 
                className="ef-under-dev-logo" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            </div>

            <h1 className="ef-under-dev-title">
              EDUFENSTA 2026
            </h1>

            <div className="ef-under-dev-subtitle">
              OFFICIAL FESTIVAL PORTAL IS UNDER CONSTRUCTION
            </div>

            <p className="ef-under-dev-desc">
              We are fine-tuning the EduFensta digital experience, live schedules, and competition scoreboards. 
              The full portal will be officially unveiled soon.
            </p>

            {/* Admin Panel button only */}
            <div className="ef-under-dev-actions">
              <Link to="/admin" className="ef-under-dev-btn ef-under-dev-btn--admin">
                <Shield size={16} />
                <span>Admin Panel</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Developer / Admin preview toggle — Icon only */}
            <button 
              type="button"
              className="ef-under-dev-preview-icon-btn"
              onClick={() => setPreviewMode(true)}
              title="Preview page layout"
              aria-label="Preview page layout"
            >
              <Eye size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Floating icon button to re-lock / re-enable blur when in preview mode */}
      {previewMode && (
        <button 
          type="button"
          className="ef-under-dev-reblur-floating-btn"
          onClick={() => setPreviewMode(false)}
          title="Exit preview (Enable blur)"
          aria-label="Exit preview (Enable blur)"
        >
          <EyeOff size={18} />
        </button>
      )}

      {/* ════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════ */}
      <nav className={`ef-nav ${scrolled ? 'ef-nav--scrolled' : ''} ${navHidden && !mobileMenuOpen ? 'ef-nav--hidden' : ''}`}>
        <Link to="/edufensta" className="ef-nav__brand">
          <img src="/edufensta-logo.png" alt="EDUFENSTA" className="ef-nav__brand-logo" />
        </Link>

        <div className="ef-nav__links">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={`ef-nav__link ${link.active ? 'ef-nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to={portalInfo.to} className="ef-nav__cta">{portalInfo.label}</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`ef-nav__hamburger ${mobileMenuOpen ? 'ef-nav__hamburger--active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`ef-nav__mobile-menu ${mobileMenuOpen ? 'ef-nav__mobile-menu--open' : ''}`}>
        {navLinks.map(link => (
          <Link
            key={link.label}
            to={link.to}
            className="ef-nav__link"
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link to={portalInfo.to} className="ef-nav__cta" onClick={() => setMobileMenuOpen(false)}>
          {portalInfo.label}
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════════════
          1. HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="ef-hero" id="ef-hero">
        {/* Background layers */}
        <div className="ef-hero__bg">
          <div className="ef-hero__bg-image" />
          <div className="ef-hero__bg-gradient" />
        </div>

        {/* Contour lines */}
        <div className="ef-hero__contours">
          <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-50 200C200 180 400 320 700 280S1100 200 1500 350" stroke="#FF1A1A" strokeWidth="1" fill="none" opacity="0.5"/>
            <path d="M-50 350C300 330 500 450 800 400S1200 330 1500 480" stroke="#FF1A1A" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <path d="M-50 500C250 480 450 600 750 550S1150 480 1500 620" stroke="#FF1A1A" strokeWidth="0.6" fill="none" opacity="0.2"/>
            <path d="M-50 650C350 630 550 750 850 700S1250 630 1500 770" stroke="#FF1A1A" strokeWidth="0.5" fill="none" opacity="0.15"/>
          </svg>
        </div>

        {/* Grid overlay */}
        <div className="ef-hero__grid" />

        {/* Torn paper strips */}
        <div className="ef-hero__torn-strip" />
        <div className="ef-hero__torn-strip-2" />

        {/* Content */}
        <div className="ef-hero__content">
          <div className="ef-hero__season-tag">
            EDUFENSTA — SEASON 05
          </div>

          <div className="ef-hero__title-graphic">
            <img
              src="/unbroken-title.png"
              alt="UNBROKEN — One Path, Many Generations"
              className="ef-hero__title-img"
            />
          </div>

          <div className="ef-hero__brand-line">
            <img src="/edufensta-logo.png" alt="EDUFENSTA" className="ef-hero__brand-logo" />
            <div className="ef-hero__brand-divider" />
            <span className="ef-hero__brand-season">Season 05</span>
          </div>

          <div className="ef-hero__ctas">
            <button
              className="ef-hero__cta-primary"
              onClick={() => handleSmoothScroll('ef-counts')}
            >
              EXPLORE THE FEST
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </button>
            <Link to="/results" className="ef-hero__cta-secondary">
              VIEW RESULTS
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="ef-hero__event-info">
            <span>06–07 OCTOBER 2026</span>
            <span className="ef-hero__info-dot" />
            <span>AL ASAS ACADEMY, KOZHIKODE</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="ef-hero__scroll-indicator">
          <div className="ef-hero__scroll-line" />
          <span className="ef-hero__scroll-text">SCROLL</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. COUNT SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="ef-counts-section" id="ef-counts">
        <div ref={countsHeaderRef} className="ef-section-header">
          <p className={`ef-section-eyebrow ${countsHeaderVisible ? 'ef-visible' : ''}`}>
            Stage in Numbers
          </p>
          <h2 className={`ef-section-title ${countsHeaderVisible ? 'ef-visible' : ''}`}>
            FESTIVAL IMPACT
          </h2>
          <p className={`ef-section-subtitle ${countsHeaderVisible ? 'ef-visible' : ''}`}>
            Al Asas Academy, Markaz Ali Gate, Kozhikode — live statistical milestones of competitive excellence.
          </p>
        </div>

        {/* Counter Stats Grid */}
        <div ref={countersRef} className="ef-stats__counters">
          {[
            { value: participantsCount, suffix: participantsCount > 0 ? '+' : '', label: 'PARTICIPANTS' },
            { value: eventsCount, suffix: eventsCount > 0 ? '+' : '', label: 'EVENTS' },
            { value: teamsCount, suffix: '', label: 'TEAMS' },
            { value: daysCount, suffix: '', label: 'DAYS' },
            { value: 1, suffix: '', label: 'UNBROKEN JOURNEY' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`ef-stats__counter ${countersVisible ? 'ef-visible' : ''}`}
              style={countersVisible ? { animationDelay: `${i * 0.08}s` } : {}}
            >
              <div className="ef-stats__counter-value">
                <AnimatedCounter end={stat.value} isVisible={countersVisible} duration={1200} />
                {stat.suffix && <span className="ef-stats__counter-plus">{stat.suffix}</span>}
              </div>
              <div className="ef-stats__counter-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. TEAM STANDINGS (LEADERBOARD) SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="ef-standings-section" id="ef-standings">
        <div ref={statsHeaderRef} className="ef-section-header">
          <p className={`ef-section-eyebrow ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            Championship Leaderboard
          </p>
          <h2 className={`ef-section-title ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            WHO STANDS<br/>TOGETHER
          </h2>
          <p className={`ef-section-subtitle ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            The competitive team standings from the database. Every point earned through dedication, creativity, and brilliance.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="ef-stats__leaderboard-wrap">
          <div ref={leaderboardRef} className="ef-stats__leaderboard">
            <div className="ef-stats__header" style={leaderboardGridStyle}>
              <span>#</span>
              <span>TEAM</span>
              {categoriesList.map((cat) => (
                <span key={cat} className="ef-stats__header-cat">{cat}</span>
              ))}
              <span className="ef-stats__header-total">TOTAL</span>
            </div>

            {dbTeams.length > 0 ? (
              dbTeams.map((team, i) => (
                <div
                  key={team.id || team.name}
                  className={`ef-stats__team ${team.rank === 1 ? 'ef-stats__team--leader' : ''} ${leaderboardVisible ? 'ef-visible' : ''}`}
                  style={{
                    ...leaderboardGridStyle,
                    ...(leaderboardVisible ? { animationDelay: `${i * 0.06}s` } : {}),
                  }}
                >
                  <span className="ef-stats__team-rank">
                    {String(team.rank).padStart(2, '0')}
                  </span>
                  <span className="ef-stats__team-name">{team.name}</span>
                  {categoriesList.map((cat) => (
                    <span key={cat} className="ef-stats__team-cat-pts">
                      {team.categoryPoints[cat] ?? 0}
                    </span>
                  ))}
                  <span className="ef-stats__team-points">
                    <AnimatedCounter end={team.totalPoints} isVisible={leaderboardVisible} duration={1000 + i * 150} />
                  </span>
                </div>
              ))
            ) : (
              <div className="ef-empty-leaderboard">
                <p>Team standings will populate live as official event scores are compiled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Button to redirect to Team Status */}
        <div className="ef-section-cta-wrap">
          <Link to="/team-status" className="ef-section-cta-btn">
            <span>VIEW FULL TEAM STANDINGS & DETAILS</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. RECENT RESULTS SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="ef-results" id="ef-results">
        <div ref={resultsHeaderRef} className="ef-section-header">
          <p className={`ef-section-eyebrow ${resultsHeaderVisible ? 'ef-visible' : ''}`}>
            Official Champions
          </p>
          <h2 className={`ef-section-title ${resultsHeaderVisible ? 'ef-visible' : ''}`}>
            RECENT RESULTS
          </h2>
          <p className={`ef-section-subtitle ${resultsHeaderVisible ? 'ef-visible' : ''}`}>
            Latest declared winners and rankers from official competitive programs.
          </p>
        </div>

        {/* Results Cards Grid with MelonUI Peel Card */}
        <div ref={resultsGridRef} className="ef-results__grid">
          {groupedResults.length > 0 ? (
            groupedResults.map((prog, i) => (
              <div
                key={prog.programId || prog.programName}
                className={`ef-results__card-wrapper ${resultsGridVisible ? 'ef-visible' : ''}`}
                style={resultsGridVisible ? { animationDelay: `${i * 0.08}s` } : {}}
              >
                <RindPeelCard
                  width="100%"
                  minHeight={250}
                  borderRadius="14px"
                  borderColor="rgba(255, 26, 26, 0.3)"
                  peelBg="#0d0d0d"
                  peelStripeColor="#ff1a1a"
                  revealBg="radial-gradient(circle at 50% 10%, rgba(255, 26, 26, 0.16) 0%, #080808 85%)"
                  peelChildren={
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                          {prog.categoryName ? (
                            <span className="ef-results__card-category-badge">{prog.categoryName}</span>
                          ) : (
                            <span className="ef-results__card-category-badge">EVENT</span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: 'var(--ef-gray)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            PEEL CARD
                          </span>
                        </div>
                        <h3 className="ef-results__card-prog-title" style={{ fontSize: '1.7rem', marginBottom: '0.5rem', lineHeight: 1.15 }}>
                          {prog.programName}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ef-gray-light)', letterSpacing: '0.05em' }}>
                          HOVER / TAP TO REVEAL TOP 3
                        </span>
                        <span style={{ color: 'var(--ef-crimson)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                          ↑
                        </span>
                      </div>
                    </div>
                  }
                  revealChildren={
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--ef-white)', textTransform: 'uppercase', fontFamily: 'var(--ef-font-display, sans-serif)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prog.programName}
                          </span>
                          {prog.categoryName && (
                            <span className="ef-results__card-category-badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', flexShrink: 0 }}>
                              {prog.categoryName}
                            </span>
                          )}
                        </div>

                        {/* Ranks list: 1st, 2nd, 3rd */}
                        <div className="ef-results__ranks-list" style={{ gap: '0.4rem' }}>
                          {prog.ranks.map((r) => {
                            const isWinner = r.rank === 1;
                            return (
                              <div
                                key={r.id || `${r.member_name}-${r.rank}`}
                                className={`ef-results__rank-row ${isWinner ? 'ef-results__rank-row--winner' : ''}`}
                                style={{ padding: '0.35rem 0.6rem' }}
                              >
                                <span className={`ef-results__rank-badge ef-results__rank-badge--${r.rank}`}>
                                  #{r.rank}
                                </span>
                                <div className="ef-results__rank-member">
                                  <div className="ef-results__rank-name" style={{ fontSize: '0.85rem' }}>{r.member_name}</div>
                                  <div className="ef-results__rank-team" style={{ fontSize: '0.75rem' }}>
                                    {r.team_name} {r.member_chest_no && `(#${r.member_chest_no})`}
                                  </div>
                                </div>
                                {r.grade && (
                                  <span className="ef-results__grade-badge" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>{r.grade}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Click to view full marksheet */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/results', {
                            state: {
                              openProgram: {
                                id: prog.programId,
                                name: prog.programName,
                                category_name: prog.categoryName,
                              },
                            },
                          });
                        }}
                        className="peel-action-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          width: '100%',
                          padding: '0.55rem',
                          marginTop: '0.75rem',
                          background: 'rgba(255, 26, 26, 0.15)',
                          border: '1px solid var(--ef-crimson)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontFamily: 'var(--ef-font-body)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        <span>VIEW FULL MARKSHEET & POSTER</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  }
                />
              </div>
            ))
          ) : (
            <div className="ef-empty-results">
              <p>Published event results will appear here as soon as judging and verification are published.</p>
            </div>
          )}
        </div>

        {/* Button to redirect to Results Page */}
        <div className="ef-section-cta-wrap">
          <Link to="/results" className="ef-section-cta-btn">
            <span>EXPLORE ALL EVENT RESULTS</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Marquee */}
        <div className="ef-marquee">
          <div className="ef-marquee__track">
            {marqueeTrack.map((item, i) => (
              <span key={i} className="ef-marquee__item">
                <span className="ef-marquee__dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="ef-footer">
        <div className="ef-footer__closing">
          <h3 className="ef-footer__closing-title">THE JOURNEY CONTINUES.</h3>
          <div className="ef-footer__closing-brand">FESTALCHEMY</div>
          <div className="ef-footer__closing-season">EDUFENSTA — SEASON 05</div>
        </div>

        <div className="ef-footer__grid">
          <div className="ef-footer__col">
            <div className="ef-footer__col-title">NAVIGATE</div>
            <Link to="/edufensta">Home</Link>
            <Link to="/team-status">Team Standings</Link>
            <Link to="/results">Results</Link>
            <Link to={portalInfo.to}>{isAuthenticated ? portalInfo.label : 'Portal Login'}</Link>
          </div>
          <div className="ef-footer__col">
            <div className="ef-footer__col-title">CONNECT</div>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
            <a href="mailto:contact@festalchemy.com">Contact</a>
          </div>
          <div className="ef-footer__col">
            <div className="ef-footer__col-title">LOCATION</div>
            <a href="#">Al Asas Academy</a>
            <a href="#">Kozhikode, Kerala</a>
            <a href="#">Markaz Ali Gate</a>
          </div>
          <div className="ef-footer__col">
            <div className="ef-footer__col-title">SCHEDULE</div>
            <a href="#">Day 1 — Oct 06</a>
            <a href="#">Day 2 — Oct 07</a>
            <Link to="/results">Full Event Schedule</Link>
          </div>
        </div>

        <div className="ef-footer__bottom">
          <span className="ef-footer__copyright">© 2026 FESTALCHEMY</span>
          <span className="ef-footer__location">
            MARKAZ ALI GATE, AL ASAS ACADEMY, KOZHIKODE
          </span>
        </div>
      </footer>
    </div>
  );
}
