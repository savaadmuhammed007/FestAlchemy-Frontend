import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Shield, Trophy, Crown, Medal, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [festData, setFestData] = useState(null);
  const lastScrollY = useRef(0);

  // Smooth scroll to hash anchor on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id) || (id === 'ef-performers' ? (document.getElementById('ef-top-performers') || document.querySelector('.ef-performers-section')) : null);
      if (el) {
        setTimeout(() => {
          const navOffset = 70;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  }, [location.hash]);

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
  const [performersHeaderRef, performersHeaderVisible] = useInView();
  const [performersGridRef, performersGridVisible] = useInView();
  const [activePerformerTab, setActivePerformerTab] = useState('overall');

  // ── Metrics from Database API ──
  const participantsCount = festData?.stats?.participants ?? 0;
  const eventsCount = festData?.stats?.programs ?? 0;
  const teamsCount = festData?.stats?.teams ?? 0;
  const daysCount = festData?.stats?.days ?? 0;

  // ── Fest Completion & Total Points Determination ──
  // Fest is completed when all results are declared and total points are published
  // (Total number of programs is set as limit of public stat viewer on scoring page, or limit is 0 = all)
  const totalPrograms = Number(festData?.stats?.programs) || (festData?.schedule ? festData.schedule.length : 0);
  const publishedCount = festData?.programs_with_results ? festData.programs_with_results.length : 0;
  const standingsLimit = Number(festData?.fest_settings?.published_standings_limit) || 0;
  const publishTeamStandings = festData?.fest_settings?.publish_team_standings !== false;

  const isAllResultsPublished = totalPrograms > 0 && publishedCount >= totalPrograms;
  const isTotalPointsPublished = publishTeamStandings && (
    (standingsLimit > 0 && standingsLimit >= totalPrograms) ||
    (standingsLimit === 0 && isAllResultsPublished)
  );
  const isFestCompleted = Boolean(isAllResultsPublished && isTotalPointsPublished);

  // ── Colorful Celebration Pop on Scroll ──
  const [activeCelebration, setActiveCelebration] = useState(null);
  const lastPopTimes = useRef({ standings: 0, performers: 0 });

  const triggerColorfulPop = useCallback((sectionKey) => {
    try {
      const festivalColors = [
        '#ff1a1a', // Crimson
        '#ffd700', // Gold
        '#00f0ff', // Electric Cyan
        '#ff007f', // Vivid Neon Pink
        '#10b981', // Emerald
        '#a855f7', // Vivid Violet
        '#ff9900', // Bright Amber
        '#ffffff', // Pure White
      ];

      // Side cannons (Left & Right)
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.7 },
        colors: festivalColors,
        zIndex: 99999,
        scalar: 1.15,
      });

      confetti({
        particleCount: 55,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.7 },
        colors: festivalColors,
        zIndex: 99999,
        scalar: 1.15,
      });

      // Center explosion
      setTimeout(() => {
        confetti({
          particleCount: 75,
          spread: 95,
          origin: { x: 0.5, y: 0.5 },
          colors: festivalColors,
          zIndex: 99999,
          scalar: 1.25,
        });
      }, 160);

      // Star & sparkle burst
      setTimeout(() => {
        confetti({
          particleCount: 35,
          spread: 120,
          shapes: ['star', 'circle'],
          origin: { x: 0.5, y: 0.38 },
          colors: ['#ffd700', '#ff1a1a', '#00f0ff', '#ffffff'],
          zIndex: 99999,
          scalar: 1.35,
        });
      }, 360);
    } catch (e) {
      console.error('Confetti trigger error:', e);
    }
  }, []);

  const triggerSectionCelebration = useCallback((sectionKey, details) => {
    const now = Date.now();
    // 8-second cooldown per section to avoid rapid repeated firing
    if (now - lastPopTimes.current[sectionKey] < 8000) return;
    lastPopTimes.current[sectionKey] = now;

    triggerColorfulPop(sectionKey);
    setActiveCelebration({
      id: now,
      ...details,
    });
  }, [triggerColorfulPop]);

  // Observer to trigger pop when scrolling to team stats and top performers sections
  useEffect(() => {
    if (!isFestCompleted) return;

    const standingsEl = document.getElementById('ef-standings');
    const performersEl = document.getElementById('ef-performers');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'ef-standings') {
              triggerSectionCelebration('standings', {
                title: 'FEST COMPLETED!',
                subtitle: 'Official Final Team Standings & Total Points Declared',
                badge: '🏆 CHAMPIONSHIP DECIDED',
              });
            } else if (entry.target.id === 'ef-performers') {
              triggerSectionCelebration('performers', {
                title: 'FEST COMPLETED!',
                subtitle: 'Individual Championship & Star Toppers Hall of Fame',
                badge: '👑 INDIVIDUAL HONORS',
              });
            }
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    if (standingsEl) observer.observe(standingsEl);
    if (performersEl) observer.observe(performersEl);

    return () => observer.disconnect();
  }, [isFestCompleted, triggerSectionCelebration]);

  // Auto-dismiss celebration popup after 5 seconds
  useEffect(() => {
    if (!activeCelebration) return;
    const timer = setTimeout(() => {
      setActiveCelebration(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeCelebration]);

  // ── Categories List (A'ala, Sufla, General) ──
  const PREFERRED_CATEGORIES = React.useMemo(() => ["A'ala", "Sufla", "General"], []);
  const categoriesList = React.useMemo(() => {
    const cats = (festData?.categories || []).map(c => c.name);
    if (cats.length > 0) {
      return [...cats].sort((a, b) => {
        const idxA = PREFERRED_CATEGORIES.indexOf(a);
        const idxB = PREFERRED_CATEGORIES.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    return PREFERRED_CATEGORIES;
  }, [festData, PREFERRED_CATEGORIES]);

  // ── Categories for Top Performers (Strictly excludes 'General' — only actual student categories: A'ala, Sufla) ──
  const performerCategories = React.useMemo(() => {
    return categoriesList.filter(cat => cat.trim().toLowerCase() !== 'general');
  }, [categoriesList]);

  // Ensure active performer tab is never 'General'
  useEffect(() => {
    if (activePerformerTab && activePerformerTab.trim().toLowerCase() === 'general') {
      setActivePerformerTab('overall');
    }
  }, [activePerformerTab]);

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

  // Helper for dense tie-ranking (e.g. two 50s both get rank 1)
  const assignDenseRanks = useCallback((items, pointsKey = 'total_points') => {
    let currRank = 0;
    let prevPts = null;
    return items.map((item) => {
      const pts = Number(item[pointsKey]) || 0;
      if (prevPts === null || pts !== prevPts) {
        currRank += 1;
        prevPts = pts;
      }
      return {
        ...item,
        rank: currRank,
      };
    });
  }, []);

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
    return assignDenseRanks(computed, 'totalPoints');
  }, [festData, categoriesList, progCategoryMap, assignDenseRanks]);

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
      // Key by program ID so separate events with the same name across categories (e.g. Quiz in Sufla & A'ala) produce distinct cards
      const groupKey = r.program != null ? String(r.program) : `${r.program_name || 'Event'}_${r.category_name || ''}`;
      const pName = r.program_name || `Program #${r.program}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          programId: r.program,
          programName: pName,
          categoryName: r.category_name || '',
          ranks: [],
        });
      }
      map.get(groupKey).ranks.push(r);
    });

    return Array.from(map.values())
      .map((p) => ({
        ...p,
        ranks: p.ranks.sort((a, b) => a.rank - b.rank).filter(r => r.rank <= 3),
      }))
      .slice(0, 6);
  }, [festData]);

  // ── Top Performers (Individual Championship with Dense Tie-Ranking) ──
  const allPerformersList = React.useMemo(() => {
    let raw = [];
    if (festData?.top_performers && festData.top_performers.length > 0) {
      raw = festData.top_performers.map(p => ({
        member_id: p.member_id || p.member__id,
        member_name: p.member_name || p.member__name || p.name || '',
        chest_no: p.chest_no || p.member__chest_no || p.chest_number || '',
        team_name: p.team_name || p.member__team__name || '',
        category_name: p.category_name || p.member__category__name || '',
        total_points: Number(p.total_points || p.points || p.total) || 0,
        events_count: p.events_count || p.events || 1,
        rank: p.rank,
      }));
    } else {
      (festData?.individual_leaderboard || []).forEach(cat => {
        if (cat.category_name?.trim().toLowerCase() === 'general') return;
        (cat.performers || []).forEach(p => {
          raw.push({
            member_id: p.member_id || p.member__id,
            member_name: p.member_name || p.member__name || p.name || '',
            chest_no: p.chest_no || p.member__chest_no || p.chest_number || '',
            team_name: p.team_name || p.member__team__name || '',
            category_name: cat.category_name,
            total_points: Number(p.total_points || p.points || p.total) || 0,
            events_count: p.events_count || p.events || 1,
          });
        });
      });
    }
    const sorted = [...raw].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
    return assignDenseRanks(sorted, 'total_points');
  }, [festData, assignDenseRanks]);

  const currentPerformers = React.useMemo(() => {
    let list = [];
    if (activePerformerTab === 'overall') {
      list = allPerformersList;
    } else {
      const catGroup = (festData?.individual_leaderboard || []).find(
        c => c.category_name?.trim().toLowerCase() === activePerformerTab.trim().toLowerCase()
      );
      if (catGroup && catGroup.performers) {
        list = catGroup.performers.map(p => ({
          member_id: p.member_id || p.member__id,
          member_name: p.member_name || p.member__name || p.name || '',
          chest_no: p.chest_no || p.member__chest_no || p.chest_number || '',
          team_name: p.team_name || p.member__team__name || '',
          category_name: catGroup.category_name,
          total_points: Number(p.total_points || p.points || p.total) || 0,
          events_count: p.events_count || p.events || 1,
        }));
      } else {
        list = allPerformersList.filter(
          p => p.category_name?.trim().toLowerCase() === activePerformerTab.trim().toLowerCase()
        );
      }
    }
    const sorted = [...list].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
    return assignDenseRanks(sorted, 'total_points');
  }, [activePerformerTab, allPerformersList, festData, assignDenseRanks]);

  const top3Performers = currentPerformers.slice(0, 3);
  const runnerUpPerformers = currentPerformers.slice(3, 6);

  // If classic 1, 2, 3: arrange as [Rank 2, Rank 1, Rank 3] for traditional Olympic podium
  // If tied for 2nd [Rank 1, Rank 2, Rank 2]: arrange [Rank 2, Rank 1, Rank 2] so #1 is centered
  // If tied for 1st (e.g. two 50s): arrange [Rank 1, Rank 1, Rank 2/3] so both champions appear side-by-side!
  const podiumDisplayCards = React.useMemo(() => {
    if (top3Performers.length < 3) return top3Performers;
    if (top3Performers[0]?.rank === 1 && top3Performers[1]?.rank === 2 && top3Performers[2]?.rank === 3) {
      return [top3Performers[1], top3Performers[0], top3Performers[2]];
    }
    if (top3Performers[0]?.rank === 1 && top3Performers[1]?.rank === 2 && top3Performers[2]?.rank === 2) {
      return [top3Performers[1], top3Performers[0], top3Performers[2]];
    }
    return top3Performers;
  }, [top3Performers]);


  const marqueeItems = [
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
    'UNBROKEN — ONE PATH, MANY GENERATIONS',
  ];
  const marqueeTrack = [...marqueeItems, ...marqueeItems];

  const publishTopPerformers = festData?.fest_settings?.publish_top_performers !== false;

  const navLinks = [
    { label: 'Home', to: '/edufensta', active: true },
    { label: 'Standings', to: '/team-status' },
    { label: 'Results', to: '/results' },
    ...(publishTopPerformers ? [{
      label: 'Toppers',
      to: '#ef-performers',
      onClick: (e) => {
        e.preventDefault();
        handleSmoothScroll('ef-performers');
      },
    }] : []),
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
            onClick={(e) => {
              if (link.onClick) link.onClick(e);
              setMobileMenuOpen(false);
            }}
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
            <span>03–04 NOVEMBER 2026</span>
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
          {isFestCompleted ? (
            <div className="ef-fest-completed-pill">
              <span className="ef-fc-sparkle">✦</span>
              <Trophy size={14} className="ef-fc-trophy" />
              <span className="ef-fc-text">FEST COMPLETED</span>
              <span className="ef-fc-dot">•</span>
              <span className="ef-fc-desc">ALL RESULTS & TOTAL POINTS PUBLISHED</span>
              <span className="ef-fc-sparkle">✦</span>
            </div>
          ) : (
            <p className={`ef-section-eyebrow ${statsHeaderVisible ? 'ef-visible' : ''}`}>
              Championship Leaderboard
            </p>
          )}
          <h2 className={`ef-section-title ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            {isFestCompleted ? (
              <>
                FINAL CHAMPIONSHIP<br />STANDINGS
              </>
            ) : (
              <>
                WHO STANDS<br />TOGETHER
              </>
            )}
          </h2>
          <p className={`ef-section-subtitle ${statsHeaderVisible ? 'ef-visible' : ''}`}>
            {isFestCompleted
              ? `Fest completed — all ${totalPrograms} competitive events concluded. Final team scores and point breakdown officially declared.`
              : 'The competitive team standings from the database. Every point earned through dedication, creativity, and brilliance.'}
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="ef-stats__leaderboard-wrap">
          {isFestCompleted && (
            <div className="ef-completed-leaderboard-banner">
              <div className="ef-clb-left">
                <div className="ef-clb-trophy-box">
                  <Trophy size={24} />
                </div>
                <div className="ef-clb-text">
                  <div className="ef-clb-title-row">
                    <span className="ef-clb-status-tag">FEST COMPLETED</span>
                    <span className="ef-clb-verified">
                      <CheckCircle2 size={13} /> ALL RESULTS PUBLISHED
                    </span>
                  </div>
                  <p className="ef-clb-description">
                    Total championship points for all {totalPrograms} events have been locked and compiled.
                  </p>
                </div>
              </div>
              {dbTeams.length > 0 && (
                <div className="ef-clb-champion-card">
                  <span className="ef-clb-champ-eyebrow">OVERALL CHAMPIONS</span>
                  <span className="ef-clb-champ-name">👑 {dbTeams[0]?.name}</span>
                  <span className="ef-clb-champ-pts">{dbTeams[0]?.totalPoints} PTS</span>
                </div>
              )}
            </div>
          )}

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
                      {isFestCompleted && team.rank === 1 ? '👑 01' : String(team.rank).padStart(2, '0')}
                    </span>
                    <span className="ef-stats__team-name">
                      {team.name}
                      {isFestCompleted && team.rank === 1 && (
                        <span className="ef-team-champion-tag">CHAMPION</span>
                      )}
                    </span>
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
                          {isFestCompleted && team.rank === 1 ? '👑 #01' : `#${String(team.rank).padStart(2, '0')}`}
                        </span>
                        <span className="ef-stats__mobile-name">
                          {team.name}
                          {isFestCompleted && team.rank === 1 && (
                            <span className="ef-team-champion-tag ef-team-champion-tag--mobile">CHAMPION</span>
                          )}
                        </span>
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

        {/* Results Cards Grid with MelonUI Peel Card */}
        <div ref={resultsGridRef} className="ef-results__grid">
          {groupedResults.length > 0 ? (
            groupedResults.map((prog, i) => (
              <div
                key={prog.programId || `${prog.programName}-${prog.categoryName}`}
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
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. TOP PERFORMERS SECTION (INDIVIDUAL CHAMPIONSHIP)
      ════════════════════════════════════════════════════════════ */}
      {publishTopPerformers && (
      <section className="ef-performers-section" id="ef-performers">
        <div ref={performersHeaderRef} className="ef-section-header">
          {isFestCompleted ? (
            <div className="ef-fest-completed-pill ef-fest-completed-pill--performers">
              <span className="ef-fc-sparkle">✦</span>
              <Crown size={14} className="ef-fc-trophy" />
              <span className="ef-fc-text">FEST COMPLETED</span>
              <span className="ef-fc-dot">•</span>
              <span className="ef-fc-desc">INDIVIDUAL CHAMPIONSHIP FINAL HONORS</span>
              <span className="ef-fc-sparkle">✦</span>
            </div>
          ) : (
            <p className={`ef-section-eyebrow ${performersHeaderVisible ? 'ef-visible' : ''}`}>
              Hall of Fame
            </p>
          )}
          <h2 className={`ef-section-title ${performersHeaderVisible ? 'ef-visible' : ''}`}>
            TOP PERFORMERS
          </h2>
          <p className={`ef-section-subtitle ${performersHeaderVisible ? 'ef-visible' : ''}`}>
            {isFestCompleted
              ? `Final individual excellence standings calculated across all ${totalPrograms} officially concluded single event results.`
              : 'Individual excellence calculated live from officially declared single event results.'}
          </p>
        </div>

        {/* View Switcher Tabs (Overall + A'ala, Sufla — Strictly excludes General) */}
        <div className="ef-performers-tabs-wrap">
          <div className="ef-performers-tabs">
            <button
              className={`ef-performers-tab ${activePerformerTab === 'overall' ? 'ef-performers-tab--active' : ''}`}
              onClick={() => setActivePerformerTab('overall')}
            >
              <Crown size={14} />
              <span>Overall</span>
            </button>
            {performerCategories.map((cat) => (
              <button
                key={cat}
                className={`ef-performers-tab ${activePerformerTab === cat ? 'ef-performers-tab--active' : ''}`}
                onClick={() => setActivePerformerTab(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Performers Showcase */}
        <div ref={performersGridRef} className="ef-performers-container">
          {currentPerformers.length > 0 ? (
            <>
              {/* Grand Olympic-Style Podium (Top 3) */}
              <div className="ef-podium-grid">
                {podiumDisplayCards.map((p, idx) => {
                  const isFirst = p.rank === 1;
                  const isSecond = p.rank === 2;
                  const rankClass = isFirst ? 'ef-podium-card--1st' : isSecond ? 'ef-podium-card--2nd' : 'ef-podium-card--3rd';
                  const badgeModifier = isFirst ? 'gold' : isSecond ? 'silver' : 'bronze';
                  const badgeLabel = isFirst ? 'CHAMPION #01' : `RANK #${String(p.rank).padStart(2, '0')}`;
                  const ptsModifier = isFirst ? 'ef-podium-card__pts--gold' : '';
                  const displayName = p.member_name || p.name || p.member__name || 'Champion';

                  return (
                    <div
                      key={p.member_id || `${displayName}-${p.rank}-${idx}`}
                      className={`ef-podium-card ${rankClass} ${performersGridVisible ? 'ef-visible' : ''}`}
                    >
                      <div className={`ef-podium-card__rank-badge ef-podium-card__rank-badge--${badgeModifier}`}>
                        {isFirst ? <Crown size={14} /> : <Medal size={14} />}
                        <span>{badgeLabel}</span>
                      </div>

                      <h3 className={`ef-podium-card__name ${isFirst ? 'ef-podium-card__name--large' : ''}`}>
                        {displayName}
                      </h3>

                      <div className="ef-podium-card__meta">
                        {p.chest_no && (
                          <span className="ef-podium-card__chest">#{p.chest_no}</span>
                        )}
                        {p.team_name && (
                          <span className="ef-podium-card__team">{p.team_name}</span>
                        )}
                        {p.category_name && (
                          <>
                            <span className="ef-podium-card__dot">•</span>
                            <span className="ef-podium-card__cat-text">{p.category_name}</span>
                          </>
                        )}
                      </div>

                      <div className={`ef-podium-card__pts ${ptsModifier}`}>
                        <AnimatedCounter end={p.total_points} isVisible={performersGridVisible} />
                        <span className="ef-podium-card__pts-label">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extended Standings List (Ranks 4-8) */}
              {runnerUpPerformers.length > 0 && (
                <div className="ef-performers__roster">
                  <div className="ef-performers__roster-title">
                    <span>EXTENDED STANDINGS</span>
                    <span className="ef-performers__roster-line" />
                  </div>
                  <div className="ef-performers__roster-grid">
                    {runnerUpPerformers.map((p, idx) => (
                      <div
                        key={p.member_id || `${p.member_name}-${idx}`}
                        className={`ef-performers__row ${performersGridVisible ? 'ef-visible' : ''}`}
                        style={performersGridVisible ? { animationDelay: `${(idx + 3) * 0.05}s` } : {}}
                      >
                        <span className="ef-performers__row-rank">
                          #{String(p.rank).padStart(2, '0')}
                        </span>
                        <div className="ef-performers__row-info">
                          <span className="ef-performers__row-name">{p.member_name || p.name || p.member__name}</span>
                          <div className="ef-performers__row-sub">
                            {p.chest_no && <span className="ef-performers__row-chest">#{p.chest_no}</span>}
                            <span>{p.team_name}</span>
                            {p.category_name && <span className="ef-performers__row-dot">•</span>}
                            {p.category_name && <span>{p.category_name}</span>}
                          </div>
                        </div>
                        <div className="ef-performers__row-pts">
                          <span className="ef-performers__row-pts-val">{p.total_points}</span>
                          <span className="ef-performers__row-pts-lbl">PTS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="ef-empty-performers">
              <Trophy size={42} style={{ color: 'var(--ef-crimson)', opacity: 0.8, marginBottom: '0.75rem' }} />
              <h3 style={{ color: 'var(--ef-white)', fontFamily: 'var(--ef-font-display)', fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                Star Rankings Awaiting Declarations
              </h3>
              <p style={{ color: 'var(--ef-gray)', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto' }}>
                Individual champion points will illuminate live as official single event marksheets are verified and published.
              </p>
            </div>
          )}
        </div>
      </section>
      )}

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
            <a href="https://www.instagram.com/al_asas_calicut/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.youtube.com/@AlAsasMedia" target="_blank" rel="noopener noreferrer">YouTube</a>
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

      {/* Colorful Celebration Pop Alert on Screen */}
      {activeCelebration && (
        <div className="ef-celebration-popup-overlay">
          <div className="ef-celebration-popup-card">
            <div className="ef-cpp-rainbow-bar" />
            <button
              className="ef-cpp-close-btn"
              onClick={() => setActiveCelebration(null)}
              aria-label="Close celebration alert"
            >
              ✕
            </button>
            <div className="ef-cpp-body">
              <div className="ef-cpp-badge">
                <Sparkles size={13} />
                <span>{activeCelebration.badge}</span>
                <Sparkles size={13} />
              </div>
              <h3 className="ef-cpp-title">
                <span className="ef-cpp-trophy">🎉</span>
                <span>{activeCelebration.title}</span>
              </h3>
              <p className="ef-cpp-subtitle">{activeCelebration.subtitle}</p>
              <div className="ef-cpp-meta">
                <span className="ef-cpp-pill">
                  <CheckCircle2 size={13} /> All {totalPrograms} Events Concluded
                </span>
                <span className="ef-cpp-pill ef-cpp-pill--gold">
                  <Trophy size={13} /> 100% Points Published
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
