import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
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
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [festData, setFestData] = useState(null);
  const lastScrollY = useRef(0);

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

  // ── Live Team Leaderboard with Category-Based Points & Dense Tie-Ranking ──
  const dbTeams = React.useMemo(() => {
    const rawLeaderboard = festData?.leaderboard || [];
    if (!rawLeaderboard.length) return [];

    const computed = rawLeaderboard.map((t, idx) => {
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
        id: t.id || t.team || idx,
        name: t.team_name || `Team ${idx + 1}`,
        categoryPoints,
        totalPoints: Number(t.total_points) || 0,
      };
    });

    computed.sort((a, b) => b.totalPoints - a.totalPoints);
    let currRank = 0;
    let prevPts = null;
    return computed.map(item => {
      const pts = Number(item.totalPoints) || 0;
      if (prevPts === null || pts !== prevPts) {
        currRank += 1;
        prevPts = pts;
      }
      return { ...item, rank: currRank };
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
        ranks: p.ranks.sort((a, b) => a.rank - b.rank).filter(r => r.rank <= 3),
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
    {
      label: 'Toppers',
      to: '#ef-performers',
      onClick: (e) => {
        e.preventDefault();
        handleSmoothScroll('ef-performers');
      },
    },
  ];

  const handleSmoothScroll = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id) || (id === 'ef-performers' ? (document.getElementById('ef-top-performers') || document.querySelector('.ef-performers-section')) : null);
    if (el) {
      const navOffset = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="edufensta-page">

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
              onClick={link.onClick}
              className={`ef-nav__link ${link.active ? 'ef-nav__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/login" className="ef-nav__cta">LOGIN</Link>
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
            onClick={(e) => {
              if (link.onClick) link.onClick(e);
              setMobileMenuOpen(false);
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link to="/login" className="ef-nav__cta" onClick={() => setMobileMenuOpen(false)}>
          LOGIN
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
            <path d="M-50 200C200 180 400 320 700 280S1100 200 1500 350" stroke="#FF1A1A" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M-50 350C300 330 500 450 800 400S1200 330 1500 480" stroke="#FF1A1A" strokeWidth="0.8" fill="none" opacity="0.3" />
            <path d="M-50 500C250 480 450 600 750 550S1150 480 1500 620" stroke="#FF1A1A" strokeWidth="0.6" fill="none" opacity="0.2" />
            <path d="M-50 650C350 630 550 750 850 700S1250 630 1500 770" stroke="#FF1A1A" strokeWidth="0.5" fill="none" opacity="0.15" />
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
            <span>03|04 NOVEMBER 2026</span>
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
            WHO STANDS<br />TOGETHER
          </h2>
          <p className={`ef-section-subtitle ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            The competitive team standings from the database. Every point earned through dedication, creativity, and brilliance.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="ef-stats__leaderboard-wrap">
          <div ref={leaderboardRef} className="ef-stats__leaderboard">
            <div className="ef-stats__header ef-desktop-only" style={leaderboardGridStyle}>
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
                  style={leaderboardVisible ? { animationDelay: `${i * 0.06}s` } : {}}
                >
                  {/* Desktop Grid Layout */}
                  <div className="ef-stats__team-desktop ef-desktop-only" style={{ ...leaderboardGridStyle, alignItems: 'center', width: '100%' }}>
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

                  {/* Mobile Device View: Team Total Point FIRST, then Category Breakdown */}
                  <div className="ef-stats__team-mobile ef-mobile-only">
                    <div className="ef-stats__mobile-top">
                      <div className="ef-stats__mobile-identity">
                        <span className={`ef-stats__mobile-rank ${team.rank === 1 ? 'ef-stats__mobile-rank--leader' : ''}`}>
                          #{String(team.rank).padStart(2, '0')}
                        </span>
                        <span className="ef-stats__mobile-name">{team.name}</span>
                      </div>
                      <div className={`ef-stats__mobile-total ${team.rank === 1 ? 'ef-stats__mobile-total--leader' : ''}`}>
                        <AnimatedCounter end={team.totalPoints} isVisible={leaderboardVisible} duration={1000 + i * 150} />
                        <span className="ef-stats__mobile-total-label">PTS</span>
                      </div>
                    </div>

                    <div className="ef-stats__mobile-breakdown">
                      {categoriesList.map((cat) => (
                        <div key={cat} className="ef-stats__mobile-cat-item">
                          <span className="ef-stats__mobile-cat-name">{cat}</span>
                          <span className="ef-stats__mobile-cat-val">{team.categoryPoints[cat] ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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

        {/* Results Cards Grid */}
        <div ref={resultsGridRef} className="ef-results__grid">
          {groupedResults.length > 0 ? (
            groupedResults.map((prog, i) => (
              <div
                key={prog.programId || prog.programName}
                className={`ef-results__card ${resultsGridVisible ? 'ef-visible' : ''}`}
                style={resultsGridVisible ? { animationDelay: `${i * 0.08}s` } : {}}
                onClick={() =>
                  navigate('/results', {
                    state: {
                      openProgram: {
                        id: prog.programId,
                        name: prog.programName,
                        category_name: prog.categoryName,
                      },
                    },
                  })
                }
              >
                <div className="ef-results__card-top">
                  {prog.categoryName && (
                    <span className="ef-results__card-category-badge">{prog.categoryName}</span>
                  )}
                  <span className="ef-results__card-view-tag">VIEW MARKSHEET &rarr;</span>
                </div>

                <h3 className="ef-results__card-prog-title">{prog.programName}</h3>
                <div className="ef-results__card-divider" />

                {/* Ranks list */}
                <div className="ef-results__ranks-list">
                  {prog.ranks.map((r) => {
                    const isWinner = r.rank === 1;
                    return (
                      <div
                        key={r.id || `${r.member_name}-${r.rank}`}
                        className={`ef-results__rank-row ${isWinner ? 'ef-results__rank-row--winner' : ''}`}
                      >
                        <span className={`ef-results__rank-badge ef-results__rank-badge--${r.rank}`}>
                          #{r.rank}
                        </span>
                        <div className="ef-results__rank-member">
                          <div className="ef-results__rank-name">{r.member_name}</div>
                          <div className="ef-results__rank-team">
                            {r.team_name} {r.member_chest_no && `(#${r.member_chest_no})`}
                          </div>
                        </div>
                        {r.grade && (
                          <span className="ef-results__grade-badge">{r.grade}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
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
            <Link to="/login">Portal Login</Link>
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
            <a href="#">Day 1 — Nov 03</a>
            <a href="#">Day 2 — Nov 04</a>
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
