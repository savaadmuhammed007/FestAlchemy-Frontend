import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../context/AuthContext';
import { Award, Trophy, Sparkles, ChevronDown } from 'lucide-react';

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
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 240 : 280,
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
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
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
  const [festData, setFestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchFestInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/stats/`);
        if (res.ok) {
          const json = await res.json();
          setFestData(json);
        }
      } catch (err) {
        console.error('Failed to fetch fest info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFestInfo();
  }, []);

  // Trigger entrance animation after data loads
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fest = festData?.fest_settings;
  const leaderboard = festData?.leaderboard || [];
  const publishedCount = festData?.programs_with_results?.length || 0;

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-page">

      {/* ─── HERO SECTION ─── */}
      <section className="home-hero">
        <HeroParticles />

        {/* Gradient orbs */}
        <div className="home-hero-orb home-hero-orb--1" />
        <div className="home-hero-orb home-hero-orb--2" />
        <div className="home-hero-orb home-hero-orb--3" />

        {/* DNA-like decorative lines */}
        <div className="home-hero-dna home-hero-dna--left" />
        <div className="home-hero-dna home-hero-dna--right" />

        <div className={`home-hero-content ${visible ? 'home-hero-content--visible' : ''}`}>

          {/* Logo */}
          {fest?.logo && (
            <img
              src={`${API_BASE_URL}${fest.logo}`}
              alt="Fest Logo"
              className="home-hero-logo"
            />
          )}

          {/* Tagline badge */}
          {fest?.tagline && (
            <div className="home-hero-badge">
              <Sparkles size={14} />
              <span>{fest.tagline}</span>
            </div>
          )}

          {/* Fest Name */}
          <h1 className="home-hero-title">
            {fest?.fest_name || 'FestAlchemy'}
          </h1>

          {/* Year */}
          <div className="home-hero-year">
            {fest?.year || new Date().getFullYear()}
          </div>

          {/* Description */}
          {fest?.description && (
            <p className="home-hero-description">
              {fest.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="home-hero-actions">
            <Link to="/results" className="home-btn home-btn--primary">
              <Award size={18} />
              <span>Get Results</span>
            </Link>
            <Link to="/team-status" className="home-btn home-btn--secondary">
              <Trophy size={18} />
              <span>Team Status</span>
            </Link>
          </div>

          {/* Quick stats */}
          {(leaderboard.length > 0 || publishedCount > 0) && (
            <div className="home-hero-stats">
              {leaderboard.length > 0 && (
                <div className="home-hero-stat">
                  <span className="home-hero-stat-value">{leaderboard.length}</span>
                  <span className="home-hero-stat-label">Teams</span>
                </div>
              )}
              {publishedCount > 0 && (
                <div className="home-hero-stat">
                  <span className="home-hero-stat-value">{publishedCount}</span>
                  <span className="home-hero-stat-label">Results Published</span>
                </div>
              )}
              {leaderboard.length > 0 && (
                <div className="home-hero-stat">
                  <span className="home-hero-stat-value">{leaderboard[0]?.team_name}</span>
                  <span className="home-hero-stat-label">Leading Team</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        {leaderboard.length > 0 && (
          <div className="home-hero-scroll">
            <ChevronDown size={20} />
          </div>
        )}
      </section>

      {/* ─── LIVE STANDINGS PREVIEW ─── */}
      {leaderboard.length > 0 && (
        <section className="home-standings">
          <div className="home-standings-inner">
            <h2 className="home-section-title">
              <Trophy size={22} style={{ color: 'var(--gold)' }} />
              Live Team Standings
            </h2>

            <div className="home-standings-grid">
              {leaderboard.slice(0, 6).map((team, idx) => {
                const rank = idx + 1;
                const rankColors = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];
                const isTop3 = rank <= 3;
                const color = isTop3 ? rankColors[rank - 1] : 'var(--text-muted)';

                return (
                  <div key={team.id} className={`home-standing-card ${isTop3 ? 'home-standing-card--top' : ''}`}>
                    <div
                      className="home-standing-rank"
                      style={{
                        background: isTop3 ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--bg-hover)',
                        color: color,
                        borderColor: isTop3 ? color : 'var(--border)',
                      }}
                    >
                      {rank}
                    </div>
                    <div className="home-standing-info">
                      <span className="home-standing-name">{team.team_name}</span>
                      <span className="home-standing-points" style={{ color: isTop3 ? color : 'var(--text-primary)' }}>
                        {team.total_points} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link to="/team-status" className="home-standings-more">
              View Full Standings →
            </Link>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="home-footer">
        <div className="home-footer-wave" />
        <p>Powered by <strong>FestAlchemy</strong></p>
      </footer>
    </div>
  );
}
