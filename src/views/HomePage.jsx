import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import CinematicSequence from '../components/CinematicSequence';
import CinematicStoryOverlay from '../components/CinematicStoryOverlay';
import '../components/CinematicSequence.css';
import {
  Award,
  Trophy,
  Crown,
  Medal,
  Flame,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  Activity,
  Shield,
  Grid,
} from 'lucide-react';

/* ─── Animated Counter Component ───────────────────────────── */
function AnimatedCounter({ end, duration = 650, isVisible = true }) {
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

export default function HomePage() {
  const navigate = useNavigate();
  const [festData, setFestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadPct, setLoadPct] = useState(0);

  const containerRef = useRef(null);
  const liveSectionRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Fetch live fest & scoring data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/public/stats/`);
        if (statsRes.ok && isMounted) {
          const statsJson = await statsRes.json();
          setFestData(statsJson);
        }
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute scroll progress strictly within the cinematic container track
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalScrollable = rect.height - window.innerHeight;
    if (totalScrollable <= 0) return;

    // rect.top goes from 0 to -totalScrollable
    const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Jump to specific progress along the cinematic sequence track
  const handleJumpToProgress = (targetProgress) => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = containerRef.current.offsetTop + targetProgress * totalScrollable;
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  };

  // Smooth scroll down to the live scoreboard section
  const handleScrollToLive = () => {
    if (liveSectionRef.current) {
      liveSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Intersection observer for stats counter animation
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fest = festData?.fest_settings;
  const leaderboard = festData?.leaderboard || [];

  // Metrics from API or sensible defaults
  const participantsCount = festData?.stats?.participants ?? 0;
  const teamsCount = festData?.stats?.teams ?? (leaderboard.length || 0);
  const categoriesCount = festData?.stats?.categories ?? (festData?.categories?.length || 0);
  const programsCount = festData?.stats?.programs ?? (festData?.schedule?.length || 0);
  const daysCount = festData?.stats?.days ?? (fest?.dates?.length || 1);

  // Group published results
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
      .slice(0, 3);
  }, [festData]);

  const top3Teams = leaderboard.slice(0, 3);

  return (
    <div className="cinematic-home-page">
      {/* ─────────────────────────────────────────────────────────────
          1. PINNED CINEMATIC IMAGE SEQUENCE & STORYTELLING TRACK
      ───────────────────────────────────────────────────────────── */}
      <section ref={containerRef} className="cinematic-scroll-track">
        <div className="cinematic-sticky-stage">
          {/* 300-Frame Image Sequence Canvas */}
          <CinematicSequence
            scrollProgress={scrollProgress}
            onLoadedProgress={setLoadPct}
            className="cinematic-sequence-view"
          />

          {/* 6-Phase Scroll Story Overlay */}
          <CinematicStoryOverlay
            scrollProgress={scrollProgress}
            onScrollToLive={handleScrollToLive}
            onJumpToProgress={handleJumpToProgress}
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE FEST IMPACT METRICS ("Grand Stage in Numbers")
      ───────────────────────────────────────────────────────────── */}
      <div ref={liveSectionRef} className="cinematic-live-section-wrapper">
        <section className="home-stats-section" ref={statsRef}>
          <div className="home-container">
            <div className="home-section-header text-center home-stats-header">
              <div className="home-section-badge">
                <Activity size={15} style={{ color: '#e6c887' }} />
                <span>Ilal Habeeb Fest Impact</span>
              </div>
              <h2 className="home-section-title">
                The Grand Stage in Numbers
              </h2>
              <p className="home-section-subtitle">
                Smart Vacation Madrasa, Kanzul Ulama Cultural Centre, Kannapuram — Uniting talent in competitive excellence.
              </p>
            </div>

            <div className="home-stats-grid">
              {/* Participants */}
              <div className="home-stat-card">
                <div className="home-stat-card-glow" />
                <div className="home-stat-icon-wrapper home-stat-icon--participants">
                  <Users size={28} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-number-wrap">
                    <AnimatedCounter
                      end={participantsCount}
                      duration={650}
                      isVisible={statsVisible}
                    />
                    <span className="home-stat-plus">+</span>
                  </div>
                  <div className="home-stat-label">Participants</div>
                  <div className="home-stat-tag home-stat-tag--participants">
                    Registered Contenders
                  </div>
                </div>
              </div>

              {/* Teams */}
              <div className="home-stat-card">
                <div className="home-stat-card-glow" />
                <div className="home-stat-icon-wrapper home-stat-icon--teams">
                  <Shield size={28} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-number-wrap">
                    <AnimatedCounter
                      end={teamsCount}
                      duration={500}
                      isVisible={statsVisible}
                    />
                  </div>
                  <div className="home-stat-label">Teams</div>
                  <div className="home-stat-tag home-stat-tag--teams">
                    {fest?.published_standings_limit > 0
                      ? `After ${fest.published_standings_limit} Results`
                      : 'Championship Houses'}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="home-stat-card">
                <div className="home-stat-card-glow" />
                <div className="home-stat-icon-wrapper home-stat-icon--categories">
                  <Grid size={28} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-number-wrap">
                    <AnimatedCounter
                      end={categoriesCount}
                      duration={520}
                      isVisible={statsVisible}
                    />
                  </div>
                  <div className="home-stat-label">Categories</div>
                  <div className="home-stat-tag home-stat-tag--categories">
                    Talent Divisions
                  </div>
                </div>
              </div>

              {/* Programs */}
              <div className="home-stat-card">
                <div className="home-stat-card-glow" />
                <div className="home-stat-icon-wrapper home-stat-icon--programs">
                  <Layers size={28} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-number-wrap">
                    <AnimatedCounter
                      end={programsCount}
                      duration={580}
                      isVisible={statsVisible}
                    />
                  </div>
                  <div className="home-stat-label">Programs</div>
                  <div className="home-stat-tag home-stat-tag--programs">
                    Meelad Events
                  </div>
                </div>
              </div>

              {/* Days */}
              <div className="home-stat-card">
                <div className="home-stat-card-glow" />
                <div className="home-stat-icon-wrapper home-stat-icon--days">
                  <Calendar size={28} />
                </div>
                <div className="home-stat-content">
                  <div className="home-stat-number-wrap">
                    <AnimatedCounter
                      end={daysCount}
                      duration={450}
                      isVisible={statsVisible}
                    />
                  </div>
                  <div className="home-stat-label">Days Fest</div>
                  <div className="home-stat-tag home-stat-tag--days">
                    Celebration of Love
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. SECTION: WHO WILL WIN? (TOP 3 TEAMS PODIUM)
        ───────────────────────────────────────────────────────────── */}
        <section className="home-section home-section--standings">
          <div className="home-container">
            <div className="home-section-header text-center">
              <div className="home-section-badge">
                <Flame size={15} style={{ color: '#e6c887' }} />
                <span>Championship Standings</span>
                {fest?.published_standings_limit > 0 && (
                  <span
                    style={{
                      marginLeft: '0.4rem',
                      background: 'var(--accent)',
                      color: '#fff',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    After {fest.published_standings_limit} Results
                  </span>
                )}
              </div>
              <h2 className="home-section-title">Who Will Win?</h2>
              <p className="home-section-subtitle">
                {fest?.published_standings_limit > 0
                  ? `The top 3 team contenders leading the scoreboard (After ${fest.published_standings_limit} Results).`
                  : 'The top 3 team contenders leading the Meelad Fest points race.'}
              </p>
            </div>

            {top3Teams.length > 0 ? (
              <div className="home-podium-grid">
                {/* 2nd Place (Silver) */}
                {top3Teams[1] && (
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
                )}

                {/* 1st Place (Gold - Featured Center) */}
                {top3Teams[0] && (
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
                )}

                {/* 3rd Place (Bronze) */}
                {top3Teams[2] && (
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
                )}
              </div>
            ) : (
              <div className="home-empty-box">
                <BarChart2 size={32} />
                <p>Team standings will appear once scores are updated.</p>
              </div>
            )}

            {/* Button to redirect to Team Stats */}
            <div className="home-section-cta">
              <Link
                to="/team-status"
                className="home-redirect-btn home-redirect-btn--team"
              >
                <Trophy size={18} />
                <span>View Full Team Standings & Details</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION: EVENT RESULTS SPOTLIGHT
        ───────────────────────────────────────────────────────────── */}
        <section className="home-section home-section--results">
          <div className="home-container">
            <div className="home-section-header text-center">
              <div className="home-section-badge">
                <Award size={15} style={{ color: '#e6c887' }} />
                <span>Official Champions</span>
              </div>
              <h2 className="home-section-title">Recent Event Results</h2>
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
                    <div className="home-result-card-header">
                      <h3 className="home-result-prog-title">{prog.programName}</h3>
                      {prog.categoryName && (
                        <span className="home-result-cat-pill">{prog.categoryName}</span>
                      )}
                    </div>
                    <div className="home-result-ranks">
                      {prog.ranks.map((r) => {
                        const rankColors = ['#f59e0b', '#94a3b8', '#d97706'];
                        const color = rankColors[r.rank - 1] || 'var(--text-muted)';
                        return (
                          <div key={r.id} className="home-result-rank-item">
                            <span
                              className="home-result-rank-badge"
                              style={{
                                color: color,
                                borderColor: color,
                                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                              }}
                            >
                              #{r.rank}
                            </span>
                            <div className="home-result-rank-info">
                              <span className="home-result-winner-name">
                                {r.member_name}
                              </span>
                              <span className="home-result-winner-team">
                                {r.team_name}{' '}
                                {r.member_chest_no && `(Chest #${r.member_chest_no})`}
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
                <p>
                  Published event results will be showcased here instantly as judging
                  completes.
                </p>
              </div>
            )}

            {/* Button to redirect to Results */}
            <div className="home-section-cta">
              <Link
                to="/results"
                className="home-redirect-btn home-redirect-btn--results"
              >
                <Award size={18} />
                <span>Explore All Published Results</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. FOOTER
        ───────────────────────────────────────────────────────────── */}
        <footer className="home-footer cinematic-footer">
          <div className="home-footer-wave" />
          <div className="home-footer-content">
            <div className="home-footer-brand">
              <div className="home-footer-logo">
                <span className="cinematic-footer-glow-icon">✨</span>
                <span className="cinematic-font-malayalam" style={{ fontSize: '1.25rem' }}>ഇലൽ ഹബീബ്</span>
              </div>
              <p className="home-footer-tagline">
                Meelad Fest 2026 • Smart Vacation Madrasa, Kanzul Ulama Cultural Centre, Kannapuram.
              </p>
            </div>

            <div className="home-footer-links">
              <Link to="/">Home</Link>
              <Link to="/team-status">Team Standings</Link>
              <Link to="/results">Event Results</Link>
              <Link to="/login">Portal Login</Link>
            </div>
          </div>

          <div className="home-footer-bottom">
            <p>
              © {new Date().getFullYear()} Ilal Habeeb Meelad Fest — Smart Vacation Madrasa.
            </p>
            <p className="home-footer-sub">
              Organized by <strong>Kanzul Ulama Cultural Centre, Kannapuram</strong>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
