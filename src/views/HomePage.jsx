import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { Award, Trophy, Sparkles, ChevronDown, Crown, Medal, Flame, ArrowRight, BarChart2, CheckCircle2, Users, Calendar, Layers, Activity, Shield, Grid } from 'lucide-react';

/* ─── Animated Counter Component ───────────────────────────── */
function AnimatedCounter({ end, duration = 500, isVisible = true }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible || end === undefined || end === null) return;

    const endValue = Number(end) || 0;
    if (endValue <= 0) {
      setCount(0);
      return;
    }

    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Smooth cubic ease-out calculation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * endValue);
      
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration, isVisible]);

  return <span>{count.toLocaleString()}</span>;
}

/* ─── Animated Particles Background ─────────────────────────── */
function HeroParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.15,
        hue: Math.random() > 0.5 ? 245 : 285,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.09 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ─── Main HomePage Component ───────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [festData, setFestData] = useState(null);
  const [publishedResults, setPublishedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/public/stats/`);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setFestData(statsJson);
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Scroll observer for Stats Counter Section
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (statsRef.current) {
      const rect = statsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        setStatsVisible(true);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.01 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const fest = festData?.fest_settings;
  const leaderboard = festData?.leaderboard || [];
  const publishedPrograms = festData?.programs_with_results || [];

  // Actual stats count data from backend or dynamic fallback
  const participantsCount = festData?.stats?.participants ?? 0;
  const teamsCount = festData?.stats?.teams ?? (festData?.leaderboard?.length || 0);
  const categoriesCount = festData?.stats?.categories ?? (festData?.categories?.length || 0);
  const programsCount = festData?.stats?.programs ?? (festData?.schedule?.length || 0);
  const daysCount = festData?.stats?.days ?? (festData?.fest_settings?.dates?.length || 1);

  // Group published results by program using recent_results from public stats
  const groupedResults = React.useMemo(() => {
    const rawResults = (publishedResults && publishedResults.length > 0)
      ? publishedResults
      : (festData?.recent_results || []);

    if (!rawResults || rawResults.length === 0) return [];
    const map = {};
    rawResults.forEach(r => {
      const pName = r.program_name || `Program #${r.program}`;
      if (!map[pName]) {
        map[pName] = {
          programId: r.program,
          programName: pName,
          categoryName: r.category_name || '',
          ranks: []
        };
      }
      map[pName].ranks.push(r);
    });

    // Sort ranks inside each program & pick top 3 programs
    return Object.values(map).map(p => ({
      ...p,
      ranks: p.ranks.sort((a, b) => a.rank - b.rank).slice(0, 3)
    })).slice(0, 3);
  }, [publishedResults, festData]);

  // Top 3 Teams for "Who Will Win?"
  const top3Teams = leaderboard.slice(0, 3);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-spinner" />
        <p>Loading FestAlchemy Scoreboard…</p>
      </div>
    );
  }

  return (
    <div className="home-page">

      {/* ─── HERO SECTION ─── */}
      <section className="home-hero">
        <HeroParticles />

        {/* Ambient glow orbs */}
        <div className="home-hero-orb home-hero-orb--1" />
        <div className="home-hero-orb home-hero-orb--2" />
        <div className="home-hero-orb home-hero-orb--3" />

        {/* Animated orbit ring */}
        <div className="home-hero-orbit">
          <div className="home-hero-orbit-dot" />
        </div>

        <div className={`home-hero-content ${visible ? 'home-hero-content--visible' : ''}`}>

          {/* Logo image if present */}
          {fest?.logo && (
            <img
              src={`${API_BASE_URL}${fest.logo}`}
              alt="Fest Logo"
              className="home-hero-logo"
            />
          )}

          {/* Tagline Badge */}
          <div className="home-hero-badge">
            <Sparkles size={14} className="home-badge-icon" />
            <span>{fest?.tagline || 'The Ultimate Battle of Champions'}</span>
          </div>

          {/* Fest Title */}
          <h1 className="home-hero-title">
            {fest?.fest_name || 'FestAlchemy'}
          </h1>

          {/* Year */}
          <div className="home-hero-year">
            <span className="home-hero-year-line" />
            <span>{fest?.year || new Date().getFullYear()}</span>
            <span className="home-hero-year-line" />
          </div>

          {/* Description */}
          <p className="home-hero-description">
            {fest?.description || 'Experience live scores, real-time standings, and instant event results across all competitive categories.'}
          </p>

        </div>

        {/* Scroll indicator */}
        <div className="home-hero-scroll">
          <ChevronDown size={22} />
        </div>
      </section>

      {/* ─── STATS COUNT SECTION ─── */}
      <section className="home-stats-section" ref={statsRef}>
        <div className="home-container">

          {/* Section Header with Tagline */}
          <div className="home-section-header text-center home-stats-header">
            <div className="home-section-badge">
              <Activity size={15} style={{ color: '#818cf8' }} />
              <span>Fest Impact</span>
            </div>
            <h2 className="home-section-title">
              The Grand Stage in Numbers
            </h2>
            <p className="home-section-subtitle">
              Uniting passionate contenders across non-stop days of high-octane events and battle for glory.
            </p>
          </div>

          <div className="home-stats-grid">
            
            {/* Participants Stat Card */}
            <div className="home-stat-card">
              <div className="home-stat-card-glow" />
              <div className="home-stat-icon-wrapper home-stat-icon--participants">
                <Users size={28} />
              </div>
              <div className="home-stat-content">
                <div className="home-stat-number-wrap">
                  <AnimatedCounter end={participantsCount} duration={650} isVisible={statsVisible} />
                  <span className="home-stat-plus">+</span>
                </div>
                <div className="home-stat-label">Participants</div>
                <div className="home-stat-tag home-stat-tag--participants">Active Contenders</div>
              </div>
            </div>

            {/* Teams Stat Card */}
            <div className="home-stat-card">
              <div className="home-stat-card-glow" />
              <div className="home-stat-icon-wrapper home-stat-icon--teams">
                <Shield size={28} />
              </div>
              <div className="home-stat-content">
                <div className="home-stat-number-wrap">
                  <AnimatedCounter end={teamsCount} duration={500} isVisible={statsVisible} />
                </div>
                <div className="home-stat-label">Teams</div>
                <div className="home-stat-tag home-stat-tag--teams">
                  {fest?.published_standings_limit > 0 ? `After ${fest.published_standings_limit} Results` : 'Championship Houses'}
                </div>
              </div>
            </div>

            {/* Categories Stat Card */}
            <div className="home-stat-card">
              <div className="home-stat-card-glow" />
              <div className="home-stat-icon-wrapper home-stat-icon--categories">
                <Grid size={28} />
              </div>
              <div className="home-stat-content">
                <div className="home-stat-number-wrap">
                  <AnimatedCounter end={categoriesCount} duration={520} isVisible={statsVisible} />
                </div>
                <div className="home-stat-label">Categories</div>
                <div className="home-stat-tag home-stat-tag--categories">Skill Divisions</div>
              </div>
            </div>

            {/* Programs Stat Card */}
            <div className="home-stat-card">
              <div className="home-stat-card-glow" />
              <div className="home-stat-icon-wrapper home-stat-icon--programs">
                <Layers size={28} />
              </div>
              <div className="home-stat-content">
                <div className="home-stat-number-wrap">
                  <AnimatedCounter end={programsCount} duration={580} isVisible={statsVisible} />
                </div>
                <div className="home-stat-label">Programs</div>
                <div className="home-stat-tag home-stat-tag--programs">Competitive Events</div>
              </div>
            </div>

            {/* Days Stat Card */}
            <div className="home-stat-card">
              <div className="home-stat-card-glow" />
              <div className="home-stat-icon-wrapper home-stat-icon--days">
                <Calendar size={28} />
              </div>
              <div className="home-stat-content">
                <div className="home-stat-number-wrap">
                  <AnimatedCounter end={daysCount} duration={450} isVisible={statsVisible} />
                </div>
                <div className="home-stat-label">Days Fest</div>
                <div className="home-stat-tag home-stat-tag--days">Non-stop Thrill</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 1: WHO WILL WIN? (TOP 3 TEAMS) ─── */}
      <section className="home-section home-section--standings">
        <div className="home-container">
          
          <div className="home-section-header text-center">
            <div className="home-section-badge">
              <Flame size={15} style={{ color: 'var(--gold)' }} />
              <span>Championship Race</span>
              {fest?.published_standings_limit > 0 && (
                <span style={{ marginLeft: '0.4rem', background: 'var(--accent)', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>
                  After {fest.published_standings_limit} Results
                </span>
              )}
            </div>
            <h2 className="home-section-title">
              Who Will Win?
            </h2>
            <p className="home-section-subtitle">
              {fest?.published_standings_limit > 0
                ? `The top 3 team contenders leading the leaderboard in points (After ${fest.published_standings_limit} Results).`
                : 'The top 3 team contenders leading the leaderboard in points right now.'}
            </p>
          </div>

          {top3Teams.length > 0 ? (
            <div className="home-podium-grid">
              
              {/* 2nd Place (Silver) */}
              {top3Teams[1] ? (
                <div className="home-podium-card home-podium-card--2nd">
                  <div className="home-podium-badge home-podium-badge--silver">
                    <Medal size={20} />
                    <span>2nd Place</span>
                  </div>
                  <div className="home-podium-rank">#2</div>
                  <h3 className="home-podium-team">{top3Teams[1].team_name}</h3>
                  <div className="home-podium-points">
                    <span className="home-podium-pts-val">{top3Teams[1].total_points}</span>
                    <span className="home-podium-pts-unit">Points</span>
                  </div>
                </div>
              ) : null}

              {/* 1st Place (Gold - Featured Center) */}
              {top3Teams[0] ? (
                <div className="home-podium-card home-podium-card--1st">
                  <div className="home-podium-crown">
                    <Crown size={28} />
                  </div>
                  <div className="home-podium-badge home-podium-badge--gold">
                    <Trophy size={22} />
                    <span>1st Place Leader</span>
                  </div>
                  <div className="home-podium-rank">#1</div>
                  <h3 className="home-podium-team">{top3Teams[0].team_name}</h3>
                  <div className="home-podium-points">
                    <span className="home-podium-pts-val">{top3Teams[0].total_points}</span>
                    <span className="home-podium-pts-unit">Points</span>
                  </div>
                  <div className="home-podium-tag">👑 Current Front-Runner</div>
                </div>
              ) : null}

              {/* 3rd Place (Bronze) */}
              {top3Teams[2] ? (
                <div className="home-podium-card home-podium-card--3rd">
                  <div className="home-podium-badge home-podium-badge--bronze">
                    <Medal size={20} />
                    <span>3rd Place</span>
                  </div>
                  <div className="home-podium-rank">#3</div>
                  <h3 className="home-podium-team">{top3Teams[2].team_name}</h3>
                  <div className="home-podium-points">
                    <span className="home-podium-pts-val">{top3Teams[2].total_points}</span>
                    <span className="home-podium-pts-unit">Points</span>
                  </div>
                </div>
              ) : null}

            </div>
          ) : (
            <div className="home-empty-box">
              <BarChart2 size={32} />
              <p>Team standings will appear once scores are updated.</p>
            </div>
          )}

          {/* Button to redirect to Team Stats */}
          <div className="home-section-cta">
            <Link to="/team-status" className="home-redirect-btn home-redirect-btn--team">
              <Trophy size={18} />
              <span>
                Redirect to Team Stats {fest?.published_standings_limit > 0 ? `(After ${fest.published_standings_limit} Results)` : ''}
              </span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: EVENT RESULTS SPOTLIGHT ─── */}
      <section className="home-section home-section--results">
        <div className="home-container">

          <div className="home-section-header text-center">
            <div className="home-section-badge">
              <Award size={15} style={{ color: 'var(--accent)' }} />
              <span>Official Champions</span>
            </div>
            <h2 className="home-section-title">
              Recent Event Results
            </h2>
            <p className="home-section-subtitle">
              Top rankers and winners from recently published programs.
            </p>
          </div>

          {groupedResults.length > 0 ? (
            <div className="home-results-grid">
              {groupedResults.map((prog) => (
                <div
                  key={prog.programId || prog.programName}
                  className="home-result-card home-result-card--clickable"
                  onClick={() => navigate('/results', { state: { openProgram: { id: prog.programId, name: prog.programName, category_name: prog.categoryName } } })}
                >
                  <div className="home-result-card-header">
                    <h3 className="home-result-prog-title">{prog.programName}</h3>
                    {prog.categoryName && (
                      <span className="home-result-cat-pill">{prog.categoryName}</span>
                    )}
                  </div>
                  <div className="home-result-ranks">
                    {prog.ranks.map((r) => {
                      const rankColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];
                      const color = rankColors[r.rank - 1] || 'var(--text-muted)';
                      return (
                        <div key={r.id} className="home-result-rank-item">
                          <span
                            className="home-result-rank-badge"
                            style={{ color: color, borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                          >
                            #{r.rank}
                          </span>
                          <div className="home-result-rank-info">
                            <span className="home-result-winner-name">{r.member_name}</span>
                            <span className="home-result-winner-team">
                              {r.team_name} {r.member_chest_no && `(Chest #${r.member_chest_no})`}
                            </span>
                          </div>
                          {r.grade && (
                            <span className="home-result-grade-badge">{r.grade}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-empty-box">
              <CheckCircle2 size={32} />
              <p>Published event results will be showcased here instantly as judging completes.</p>
            </div>
          )}

          {/* Button to redirect to Results */}
          <div className="home-section-cta">
            <Link to="/results" className="home-redirect-btn home-redirect-btn--results">
              <Award size={18} />
              <span>Redirect to All Results</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="home-footer">
        <div className="home-footer-wave" />
        <div className="home-footer-content">
          <div className="home-footer-brand">
            <div className="home-footer-logo">
              <Trophy size={20} />
              <span>FestAlchemy</span>
            </div>
            <p className="home-footer-tagline">
              {fest?.fest_name || 'FestAlchemy'} {fest?.year || new Date().getFullYear()} — Elevating Fest Management to Alchemy.
            </p>
          </div>

          <div className="home-footer-links">
            <Link to="/">Home</Link>
            <Link to="/team-status">Team Stats</Link>
            <Link to="/results">Results</Link>
            <Link to="/login">Portal Login</Link>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>© {new Date().getFullYear()} {fest?.fest_name || 'FestAlchemy'}. All rights reserved.</p>
          <p className="home-footer-sub">Powered by <strong>FestAlchemy Platform</strong></p>
        </div>
      </footer>

    </div>
  );
}
