import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Shield,
  Award,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Check,
  Lock,
  Smartphone,
  Layers,
  Palette,
  FileText,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Search,
  Sliders,
  Type,
  Image as ImageIcon,
  Square,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Radio,
  Eye,
  Send,
  Zap,
  Globe,
  Undo,
  Redo,
  Upload,
  Save,
  Download
} from 'lucide-react';
import './ProductDemo.css';

export default function ProductDemoPage() {
  // ── State for Interactive Elements ──────────────────────────────
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'monitor' | 'activity'
  const [editorMode, setEditorMode] = useState('studio'); // 'studio' | 'public_view'
  
  // Poster Template Editor replica state
  const [bgImageUrl, setBgImageUrl] = useState('/rESUT_01_MNLdihI.jpg');
  const [selectedFieldKey, setSelectedFieldKey] = useState('rank1_name');
  const [posterConfig, setPosterConfig] = useState({
    program: { text: 'Solo Singing', font: 'Sora', size: 16, color: '#ffffff', x: 50, y: 14 },
    category: { text: 'Senior Male', font: 'Inter', size: 10, color: '#dddddd', x: 50, y: 22 },
    rank1_label: { text: '1ST PLACE', font: 'Cinzel', size: 9, color: '#ffd700', x: 50, y: 35 },
    rank1_name: { text: 'Muhammad Ayaan', font: 'Sora', size: 15, color: '#ffd700', x: 50, y: 42 },
    rank1_team: { text: 'Al Noor Academy', font: 'Inter', size: 9, color: '#ffd700', x: 50, y: 48 },
    rank2_label: { text: '2ND PLACE', font: 'Inter', size: 8, color: '#c0c0c0', x: 50, y: 58 },
    rank2_name: { text: 'Ahmed Rayan', font: 'Sora', size: 12, color: '#c0c0c0', x: 50, y: 64 },
    rank2_team: { text: 'Markaz Guild', font: 'Inter', size: 8, color: '#c0c0c0', x: 50, y: 69 },
    rank3_label: { text: '3RD PLACE', font: 'Inter', size: 8, color: '#cd7f32', x: 50, y: 78 },
    rank3_name: { text: 'Salman Faris', font: 'Sora', size: 12, color: '#cd7f32', x: 50, y: 84 },
    rank3_team: { text: 'Noorul Huda', font: 'Inter', size: 8, color: '#cd7f32', x: 50, y: 89 },
    result_value: { text: 'Result No: 01', font: 'Inter', size: 8, color: '#94a3b8', x: 50, y: 95 }
  });
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSavedMsg, setTemplateSavedMsg] = useState(null);
  const [publicModalOpen, setPublicModalOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBgImageUrl(ev.target.result);
      setTemplateSavedMsg('✓ New background template image loaded');
      setTimeout(() => setTemplateSavedMsg(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateField = (prop, val) => {
    setPosterConfig(prev => ({
      ...prev,
      [selectedFieldKey]: {
        ...prev[selectedFieldKey],
        [prop]: val
      }
    }));
  };

  const handleSavePosterTemplate = () => {
    setTemplateSaving(true);
    setTimeout(() => {
      setTemplateSaving(false);
      setTemplateSavedMsg('✓ Poster template configuration saved to database');
      setTimeout(() => setTemplateSavedMsg(null), 3500);
    }, 800);
  };

  const handleDownloadPoster = () => {
    setDownloadSuccessToast('✓ Downloading High-Resolution Announcement Poster (1080x1350 PNG)...');
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };
  
  // SpinLot interactive state (drawing secret judge codes A, B, C...)
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCode, setSelectedCode] = useState('C');
  const [spinRotation, setSpinRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Results published interactive toggle
  const [isPublished, setIsPublished] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState(null);

  // Trigger spin animation for lot codes A, B, C...
  const handleSpinLot = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowConfetti(false);
    
    // Choose code A, B, C, D, E, F
    const codes = ['A', 'B', 'C', 'D', 'E', 'F'];
    const pick = codes[Math.floor(Math.random() * codes.length)];
    
    // Calculate rotation: 5 full spins (1800deg) + offset based on index
    const index = codes.indexOf(pick);
    const segmentAngle = 360 / 6;
    const targetOffset = index * segmentAngle;
    const newRotation = spinRotation + 1800 + (360 - (spinRotation % 360)) + targetOffset;
    
    setSpinRotation(newRotation);

    setTimeout(() => {
      setSelectedCode(pick);
      setIsSpinning(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 3500);
  };

  const handlePublishResults = () => {
    setIsPublished(true);
    setPublishFeedback('✓ Official Results Broadcasted to Public Dashboard & Leaderboards');
    setTimeout(() => {
      setPublishFeedback(null);
    }, 4500);
  };

  return (
    <div className="demo-page">
      {/* Background Atmosphere */}
      <div className="demo-bg-grid" />

      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section className="demo-hero-section">
        <div className="demo-container">
          <div className="demo-hero-grid">
            {/* Hero Left Content */}
            <div className="demo-hero-content">
              <div className="demo-badge">
                <span className="demo-badge-dot" />
                <Sparkles size={14} style={{ color: '#fbbf24' }} />
                <span>Built for Modern Festivals</span>
              </div>

              <h1 className="demo-hero-heading">
                One Platform. <br />
                <span className="demo-gradient-text">Every Part of Your Festival.</span>
              </h1>

              <p className="demo-hero-text">
                FestAlchemy brings registrations, judging, team management, scoring,
                results and live festival updates together in one intelligent platform.
              </p>

              <div className="demo-hero-actions">
                <a href="#portals-showcase" className="demo-btn-primary">
                  <span>Explore the Demo</span>
                  <ArrowRight size={16} />
                </a>
                <a href="#control-room" className="demo-btn-secondary">
                  <span>View Portals</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* Hero Right Visual Dashboard Preview */}
            <div className="demo-hero-visual">
              {/* Floating Live Badges */}
              <div className="demo-floating-pill demo-pill-participants">
                <div className="demo-floating-pill-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>2,480+</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Live Participants</div>
                </div>
              </div>

              <div className="demo-floating-pill demo-pill-judges">
                <div className="demo-floating-pill-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                  <Award size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>42 Marksheets</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Judge Submissions Verified</div>
                </div>
              </div>

              <div className="demo-floating-pill demo-pill-leaderboard">
                <div className="demo-floating-pill-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                  <Trophy size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>Al Noor • 840 pts</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>#1 Current Leaderboard</div>
                </div>
              </div>

              <div className="demo-floating-pill demo-pill-results">
                <div className="demo-floating-pill-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                  <Radio size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>86 Active Programs</div>
                  <div style={{ fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Check size={12} /> Results Published
                  </div>
                </div>
              </div>

              {/* Realistic Hero Browser Mockup */}
              <div className="demo-hero-preview-card">
                <div className="demo-browser-header">
                  <div className="demo-browser-dots">
                    <span className="demo-browser-dot demo-dot-red" />
                    <span className="demo-browser-dot demo-dot-yellow" />
                    <span className="demo-browser-dot demo-dot-green" />
                  </div>
                  <div className="demo-browser-address-bar">
                    <Lock size={10} style={{ color: '#22c55e' }} />
                    <span>festalchemy.io/app/dashboard</span>
                  </div>
                </div>

                <div className="demo-browser-body">
                  {/* Internal Mockup Dashboard */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0, color: '#ffffff', fontFamily: 'Sora' }}>
                        FestAlchemy Arts Grand Festival
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>Active Session • Stage Alpha & Beta</span>
                    </div>
                    <span className="demo-live-tag">
                      <span className="demo-badge-dot" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                      LIVE FESTIVAL
                    </span>
                  </div>

                  {/* 4 Stat Cards in Browser */}
                  <div className="demo-admin-stat-cards" style={{ marginBottom: '1rem' }}>
                    <div className="demo-admin-stat-card">
                      <div className="demo-stat-label">Registered</div>
                      <div className="demo-stat-val" style={{ color: '#6366f1' }}>2,480</div>
                    </div>
                    <div className="demo-admin-stat-card">
                      <div className="demo-stat-label">Programs</div>
                      <div className="demo-stat-val" style={{ color: '#38bdf8' }}>86</div>
                    </div>
                    <div className="demo-admin-stat-card">
                      <div className="demo-stat-label">Judges</div>
                      <div className="demo-stat-val" style={{ color: '#f59e0b' }}>42</div>
                    </div>
                    <div className="demo-admin-stat-card">
                      <div className="demo-stat-label">Completed</div>
                      <div className="demo-stat-val" style={{ color: '#22c55e' }}>78%</div>
                    </div>
                  </div>

                  {/* Leaderboard & Live Feeds Side by Side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy size={13} style={{ color: '#f59e0b' }} /> Live Points Leaderboard
                      </div>
                      <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: 'rgba(245,158,11,0.1)', borderRadius: '4px', color: '#fbbf24', fontWeight: 600 }}>
                          <span>1. Team Al Noor</span>
                          <span>840 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                          <span>2. Team Markaz</span>
                          <span>795 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                          <span>3. Team Noorul Huda</span>
                          <span>710 pts</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={13} style={{ color: '#22c55e' }} /> Recent Activities
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                          <span>Quran Recitation results published</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38bdf8' }} />
                          <span>Judge 4 submitted marksheet</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span>SpinLot draw finalized for Stage 2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL SHOWCASE SECTION ──────────────────────────────────── */}
      <section id="portals-showcase" className="demo-portals-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Connected Ecosystem</div>
            <h2 className="demo-section-heading">Four Portals. One Connected Festival.</h2>
            <p className="demo-section-desc">
              Every role gets a focused workspace designed around what they need to execute flawless festival events.
            </p>
          </div>

          {/* PORTAL 01: PUBLIC DASHBOARD */}
          <div className="demo-portal-card">
            <div className="demo-portal-info">
              <div className="demo-portal-header">
                <div className="demo-portal-icon">📢</div>
                <div>
                  <span className="demo-portal-num">01 — PUBLIC EXPERIENCE</span>
                  <h3 className="demo-portal-title">Public Dashboard</h3>
                </div>
              </div>
              <p className="demo-portal-desc">
                A live festival screen for participants, visitors, and supporters to follow rankings, official results, and instant announcements in real time.
              </p>
              <ul className="demo-feature-list">
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Live Points Table & Dynamic Ranking Engine</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Team Leaderboards with Gold, Silver & Bronze tallies</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Instant official results broadcast with winner cards</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Instant dynamic results poster generation & social sharing</span>
                </li>
              </ul>
              <Link to="/results" className="demo-btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
                <span>Preview Public Results</span>
                <ChevronRight size={15} />
              </Link>
            </div>

            {/* Public Dashboard Mockup */}
            <div className="demo-portal-mockup">
              <div className="demo-browser-frame">
                <div className="demo-browser-header">
                  <div className="demo-browser-dots">
                    <span className="demo-browser-dot demo-dot-red" />
                    <span className="demo-browser-dot demo-dot-yellow" />
                    <span className="demo-browser-dot demo-dot-green" />
                  </div>
                  <div className="demo-browser-address-bar">
                    <span>festalchemy.io/ilalhabeeb</span>
                  </div>
                </div>

                <div className="demo-mockup-public">
                  <div className="demo-public-head">
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em' }}>GRAND ARTS FESTIVAL 2026</span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>Overall Team Standings</h4>
                    </div>
                    <span className="demo-live-tag">
                      <span className="demo-badge-dot" style={{ background: '#ef4444' }} />
                      LIVE
                    </span>
                  </div>

                  {/* Leaderboard Rows */}
                  <div className="demo-leaderboard-row rank-1">
                    <div className="demo-team-info">
                      <span className="demo-rank-badge" style={{ background: '#f59e0b', color: '#000' }}>1</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>Al Noor Academy</div>
                        <div className="demo-medals-mini">🥇 14 &nbsp; 🥈 9 &nbsp; 🥉 6</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'Sora' }}>840</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>POINTS</div>
                    </div>
                  </div>

                  <div className="demo-leaderboard-row rank-2">
                    <div className="demo-team-info">
                      <span className="demo-rank-badge" style={{ background: '#94a3b8', color: '#000' }}>2</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>Markaz Arts Guild</div>
                        <div className="demo-medals-mini">🥇 11 &nbsp; 🥈 10 &nbsp; 🥉 8</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#cbd5e1', fontFamily: 'Sora' }}>795</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>POINTS</div>
                    </div>
                  </div>

                  <div className="demo-leaderboard-row rank-3">
                    <div className="demo-team-info">
                      <span className="demo-rank-badge" style={{ background: '#d97706', color: '#000' }}>3</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>Noorul Huda Delegation</div>
                        <div className="demo-medals-mini">🥇 9 &nbsp; 🥈 7 &nbsp; 🥉 11</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'Sora' }}>710</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>POINTS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PORTAL 02: ADMIN PANEL */}
          <div className="demo-portal-card demo-portal-reverse">
            <div className="demo-portal-info">
              <div className="demo-portal-header">
                <div className="demo-portal-icon">👑</div>
                <div>
                  <span className="demo-portal-num">02 — CENTRAL COMMAND</span>
                  <h3 className="demo-portal-title">Admin Panel</h3>
                </div>
              </div>
              <p className="demo-portal-desc">
                The high-octane cockpit for festival coordinators to orchestrate venues, monitor judging in real time, generate lots, and manage schedules.
              </p>
              <ul className="demo-feature-list">
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Participant Registry & Program Categorization</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Judge Assignment & Real-Time Marksheet Telemetry</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>SpinLot Automated Chest & Order Randomizer</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Built-in Dynamic Poster Graphic Studio</span>
                </li>
              </ul>
              <a href="#control-room" className="demo-btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
                <span>Inspect Admin Deep Dive</span>
                <ChevronRight size={15} />
              </a>
            </div>

            {/* Admin Panel Desktop Mockup */}
            <div className="demo-portal-mockup">
              <div className="demo-browser-frame">
                <div className="demo-browser-header">
                  <div className="demo-browser-dots">
                    <span className="demo-browser-dot demo-dot-red" />
                    <span className="demo-browser-dot demo-dot-yellow" />
                    <span className="demo-browser-dot demo-dot-green" />
                  </div>
                  <div className="demo-browser-address-bar">
                    <span>festalchemy.io/admin/overview</span>
                  </div>
                </div>

                <div className="demo-mockup-admin-shell">
                  {/* Left Sidebar */}
                  <div className="demo-admin-sidebar">
                    <div className="demo-admin-nav-item active">
                      <BarChart3 size={13} />
                      <span>Dashboard</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Layers size={13} />
                      <span>Programs</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Users size={13} />
                      <span>Members</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Award size={13} />
                      <span>Judges</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Zap size={13} />
                      <span>SpinLot</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <FileText size={13} />
                      <span>Marksheets</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Trophy size={13} />
                      <span>Results</span>
                    </div>
                    <div className="demo-admin-nav-item">
                      <Palette size={13} />
                      <span>Posters</span>
                    </div>
                  </div>

                  {/* Admin Main Body */}
                  <div className="demo-admin-main">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>Coordinator Dashboard</span>
                      <span style={{ fontSize: '0.68rem', color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                        All Systems Operational
                      </span>
                    </div>

                    <div className="demo-admin-stat-cards">
                      <div className="demo-admin-stat-card">
                        <div className="demo-stat-label">Participants</div>
                        <div className="demo-stat-val">2,480</div>
                      </div>
                      <div className="demo-admin-stat-card">
                        <div className="demo-stat-label">Programs</div>
                        <div className="demo-stat-val">86</div>
                      </div>
                      <div className="demo-admin-stat-card">
                        <div className="demo-stat-label">Active Judges</div>
                        <div className="demo-stat-val">42</div>
                      </div>
                      <div className="demo-admin-stat-card">
                        <div className="demo-stat-label">Completed</div>
                        <div className="demo-stat-val">78%</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>Live Marksheet Stream</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '3px' }}>
                        <span>Stage 1 • Speech Senior</span>
                        <span style={{ color: '#22c55e' }}>3/3 Submitted</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', paddingTop: '3px' }}>
                        <span>Stage 2 • Nasheed Junior</span>
                        <span style={{ color: '#f59e0b' }}>2/3 In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PORTAL 03: JUDGE PORTAL */}
          <div className="demo-portal-card">
            <div className="demo-portal-info">
              <div className="demo-portal-header">
                <div className="demo-portal-icon">⚖️</div>
                <div>
                  <span className="demo-portal-num">03 — MOBILE-FIRST SCORING</span>
                  <h3 className="demo-portal-title">Judge Portal</h3>
                </div>
              </div>
              <p className="demo-portal-desc">
                Fast, focused scoring crafted for 100% blind evaluation. Judges evaluate participants solely by their secret SpinLot code (<strong>Code A, Code B, Code C...</strong>) without ever seeing chest numbers, names, or team affiliations.
              </p>
              <ul className="demo-feature-list">
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span><strong>100% Blind Judging:</strong> Chest numbers & participant identities strictly hidden</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span><strong>SpinLot Code Evaluation:</strong> Score strictly by anonymous assigned letter codes</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Multi-criteria point validation with instant sum calculation</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Offline Draft Saving & Tamper-Proof Cryptographic Lock</span>
                </li>
              </ul>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                <Smartphone size={16} /> Optimized for iPad, Tablets & Mobile Phones
              </div>
            </div>

            {/* Judge Portal Phone Mockup */}
            <div className="demo-portal-mockup">
              <div className="demo-phone-frame">
                <div className="demo-phone-notch">
                  <span className="demo-phone-speaker" />
                  <span className="demo-phone-camera" />
                </div>
                <div className="demo-phone-screen">
                  {/* Phone Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={14} style={{ color: '#38bdf8' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Judge Marksheet</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Stage 1
                    </span>
                  </div>

                  {/* Assigned Program Badge */}
                  <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '0.5rem', marginBottom: '0.65rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 600 }}>PROGRAM</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>Quran Recitation</div>
                  </div>

                  {/* Blind Participant Card (Judge sees ONLY Code A, chest & name hidden) */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ background: 'rgba(99,102,241,0.25)', color: '#818cf8', padding: '1px 6px', borderRadius: '4px', border: '1px solid rgba(99,102,241,0.4)' }}>CODE A</span>
                          <span>Contestant</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Chest No. & Name Hidden
                        </div>
                      </div>
                      <div style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontWeight: 700, fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px' }}>
                        Slot # 1
                      </div>
                    </div>
                  </div>

                  {/* Scoring Criteria Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
                    <div className="demo-criteria-row">
                      <span style={{ color: '#cbd5e1' }}>Voice & Melody</span>
                      <span className="demo-mark-input-box">18 / 20</span>
                    </div>
                    <div className="demo-criteria-row">
                      <span style={{ color: '#cbd5e1' }}>Presentation & Stage</span>
                      <span className="demo-mark-input-box">17 / 20</span>
                    </div>
                    <div className="demo-criteria-row">
                      <span style={{ color: '#cbd5e1' }}>Tajweed Accuracy</span>
                      <span className="demo-mark-input-box">19 / 20</span>
                    </div>
                    <div className="demo-criteria-row">
                      <span style={{ color: '#cbd5e1' }}>Overall Impact</span>
                      <span className="demo-mark-input-box">18 / 20</span>
                    </div>
                  </div>

                  {/* Total Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4ade80' }}>Total Calculated:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e', fontFamily: 'Sora' }}>72 / 80</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button className="demo-btn-secondary" style={{ padding: '0.45rem', fontSize: '0.72rem', borderRadius: '6px' }}>
                      Save Draft
                    </button>
                    <button className="demo-btn-primary" style={{ padding: '0.45rem', fontSize: '0.72rem', borderRadius: '6px' }}>
                      Final Submit
                    </button>
                  </div>
                </div>
                <div className="demo-phone-homebar" />
              </div>
            </div>
          </div>

          {/* PORTAL 04: TEAM LEAD PORTAL */}
          <div className="demo-portal-card demo-portal-reverse">
            <div className="demo-portal-info">
              <div className="demo-portal-header">
                <div className="demo-portal-icon">📣</div>
                <div>
                  <span className="demo-portal-num">04 — CONTINGENT COORDINATION</span>
                  <h3 className="demo-portal-title">Team Lead Portal</h3>
                </div>
              </div>
              <p className="demo-portal-desc">
                Everything a team coordinator needs to organize their participants, track registrations, verify chest numbers, and audit event rosters.
              </p>
              <ul className="demo-feature-list">
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Bulk Member Registry with Photo & Category Indexing</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Instant Event Assignment & Conflict Detection</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Automatic Chest Number Mapping & Printable Badges</span>
                </li>
                <li className="demo-feature-item">
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span>Real-time contingent scorecard & stage schedule alerts</span>
                </li>
              </ul>
            </div>

            {/* Team Lead Mockup */}
            <div className="demo-portal-mockup">
              <div className="demo-browser-frame">
                <div className="demo-browser-header">
                  <div className="demo-browser-dots">
                    <span className="demo-browser-dot demo-dot-red" />
                    <span className="demo-browser-dot demo-dot-yellow" />
                    <span className="demo-browser-dot demo-dot-green" />
                  </div>
                  <div className="demo-browser-address-bar">
                    <span>festalchemy.io/teamlead/members</span>
                  </div>
                </div>

                <div className="demo-teamlead-screen">
                  {/* Contingent Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700 }}>TEAM LEAD CONSOLE</div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>Team: Al Noor Academy</h4>
                    </div>
                    <button className="demo-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', borderRadius: '6px' }}>
                      + Register Participant
                    </button>
                  </div>

                  {/* 4 Team Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>124</div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Members</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>87</div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Events</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#22c55e' }}>42</div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Completed</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f59e0b' }}>19</div>
                      <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Pending</div>
                    </div>
                  </div>

                  {/* Member Table */}
                  <table className="demo-table-mini">
                    <thead>
                      <tr>
                        <th>Chest No</th>
                        <th>Participant</th>
                        <th>Category</th>
                        <th>Events</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: '#a5b4fc', fontWeight: 700 }}>A-101</td>
                        <td style={{ color: '#ffffff' }}>Zaid Farhan</td>
                        <td>Senior</td>
                        <td>Solo Song, Speech</td>
                        <td><span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Verified</span></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#a5b4fc', fontWeight: 700 }}>A-102</td>
                        <td style={{ color: '#ffffff' }}>Bilal Ahmed</td>
                        <td>Junior</td>
                        <td>Calligraphy</td>
                        <td><span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Verified</span></td>
                      </tr>
                      <tr>
                        <td style={{ color: '#a5b4fc', fontWeight: 700 }}>A-104</td>
                        <td style={{ color: '#ffffff' }}>Muhammad Ayaan</td>
                        <td>Senior</td>
                        <td>Quran Recitation</td>
                        <td><span style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Scored</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADMIN PANEL DEEP DIVE ("THE CONTROL ROOM") ───────────────── */}
      <section id="control-room" className="demo-admin-deepdive-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Management Engine</div>
            <h2 className="demo-section-heading">The Control Room</h2>
            <p className="demo-section-desc">
              Everything festival coordinators need, in one place. Real-time telemetry, stage scheduling, and active marksheet monitoring.
            </p>
          </div>

          {/* Sub-Tabs for Interactive Deep Dive */}
          <div className="demo-deepdive-tabs">
            <button
              onClick={() => setAdminTab('overview')}
              className={`demo-deepdive-tab-btn ${adminTab === 'overview' ? 'active' : ''}`}
            >
              Festival Overview
            </button>
            <button
              onClick={() => setAdminTab('monitor')}
              className={`demo-deepdive-tab-btn ${adminTab === 'monitor' ? 'active' : ''}`}
            >
              Live Marksheet Monitor
            </button>
            <button
              onClick={() => setAdminTab('activity')}
              className={`demo-deepdive-tab-btn ${adminTab === 'activity' ? 'active' : ''}`}
            >
              Recent Activities & Logs
            </button>
          </div>

          {/* Large Immersive Desktop Window */}
          <div className="demo-browser-frame" style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div className="demo-browser-header">
              <div className="demo-browser-dots">
                <span className="demo-browser-dot demo-dot-red" />
                <span className="demo-browser-dot demo-dot-yellow" />
                <span className="demo-browser-dot demo-dot-green" />
              </div>
              <div className="demo-browser-address-bar" style={{ maxWidth: '500px' }}>
                <Lock size={11} style={{ color: '#22c55e' }} />
                <span>festalchemy.io/admin/cockpit?tab={adminTab}</span>
              </div>
            </div>

            <div className="demo-browser-body" style={{ minHeight: '380px', padding: '1.75rem' }}>
              {/* Tab 1: Overview */}
              {adminTab === 'overview' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', fontFamily: 'Sora' }}>Festival Overview</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Live festival metrics across all 6 stages and 86 competitions
                      </p>
                    </div>
                    <span className="demo-badge" style={{ margin: 0 }}>
                      <span className="demo-badge-dot" /> Live Active Sync
                    </span>
                  </div>

                  {/* 4 Stat Cards */}
                  <div className="demo-admin-stat-cards" style={{ marginBottom: '1.75rem' }}>
                    <div className="demo-admin-stat-card" style={{ padding: '1rem' }}>
                      <div className="demo-stat-label">Registered Participants</div>
                      <div className="demo-stat-val" style={{ fontSize: '1.8rem', color: '#818cf8' }}>2,480</div>
                      <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '4px' }}>↑ 100% Verified</div>
                    </div>
                    <div className="demo-admin-stat-card" style={{ padding: '1rem' }}>
                      <div className="demo-stat-label">Total Programs</div>
                      <div className="demo-stat-val" style={{ fontSize: '1.8rem', color: '#38bdf8' }}>86</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>6 Concurrent Stages</div>
                    </div>
                    <div className="demo-admin-stat-card" style={{ padding: '1rem' }}>
                      <div className="demo-stat-label">Active Judges</div>
                      <div className="demo-stat-val" style={{ fontSize: '1.8rem', color: '#f59e0b' }}>42</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '4px' }}>All Portals Authenticated</div>
                    </div>
                    <div className="demo-admin-stat-card" style={{ padding: '1rem' }}>
                      <div className="demo-stat-label">Programs Completed</div>
                      <div className="demo-stat-val" style={{ fontSize: '1.8rem', color: '#22c55e' }}>78%</div>
                      <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '4px' }}>67 of 86 Finalized</div>
                    </div>
                  </div>

                  {/* Festival Activity Bar Chart Mockup */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Festival Activity & Completion by Venue</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Updated Real-Time</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', alignItems: 'end', height: '140px' }}>
                      {[
                        { stage: 'Stage 1 (Auditorium)', pct: 92, count: '14/15' },
                        { stage: 'Stage 2 (Open Air)', pct: 85, count: '12/14' },
                        { stage: 'Stage 3 (Hall A)', pct: 75, count: '15/20' },
                        { stage: 'Stage 4 (Hall B)', pct: 80, count: '16/20' },
                        { stage: 'Stage 5 (Studio)', pct: 60, count: '6/10' },
                        { stage: 'Stage 6 (Media Lab)', pct: 70, count: '4/7' },
                      ].map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 700 }}>{s.pct}%</span>
                          <div style={{ width: '100%', height: `${s.pct}%`, background: 'linear-gradient(180deg, #6366f1, #312e81)', borderRadius: '6px' }} />
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                            {s.stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Marksheet Monitor */}
              {adminTab === 'monitor' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', fontFamily: 'Sora' }}>Live Marksheet Monitor</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Track evaluator submissions and verify score consensus
                      </p>
                    </div>
                  </div>

                  <table className="demo-monitor-table">
                    <thead>
                      <tr>
                        <th>Judge / Evaluator</th>
                        <th>Assigned Program</th>
                        <th>Venue / Stage</th>
                        <th>Scoring Status</th>
                        <th>Submission Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>Judge A (Prof. Tariq)</td>
                        <td>Quran Recitation Senior</td>
                        <td>Stage 1 (Auditorium)</td>
                        <td><span className="demo-badge-status status-submitted"><Check size={12} /> Submitted</span></td>
                        <td style={{ color: '#94a3b8' }}>2 mins ago</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>Judge B (Usthad Salman)</td>
                        <td>Nasheed Junior</td>
                        <td>Stage 2 (Open Air)</td>
                        <td><span className="demo-badge-status status-draft"><Clock size={12} /> Draft Saved</span></td>
                        <td style={{ color: '#94a3b8' }}>Scoring in progress</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>Judge C (Dr. Adil)</td>
                        <td>English Elocution</td>
                        <td>Stage 3 (Hall A)</td>
                        <td><span className="demo-badge-status status-submitted"><Check size={12} /> Submitted</span></td>
                        <td style={{ color: '#94a3b8' }}>12 mins ago</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>Judge D (Prof. Rasheed)</td>
                        <td>Arabic Calligraphy</td>
                        <td>Stage 4 (Hall B)</td>
                        <td><span className="demo-badge-status status-pending"><HelpCircle size={12} /> Pending</span></td>
                        <td style={{ color: '#94a3b8' }}>Awaiting call</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Recent Activity */}
              {adminTab === 'activity' && (
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#ffffff', fontFamily: 'Sora' }}>Festival Activity Stream</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[
                      { icon: <CheckCircle2 size={16} color="#22c55e" />, title: 'Program results published', desc: 'Results for Quran Recitation Senior finalized and published to Public Board', time: '1 min ago' },
                      { icon: <Users size={16} color="#38bdf8" />, title: '24 new participants registered', desc: 'Team Markaz completed contingent roster validation for Junior events', time: '8 mins ago' },
                      { icon: <Award size={16} color="#f59e0b" />, title: 'Judge assignment updated', desc: 'Prof. Tariq confirmed as Chief Evaluator for Stage 1', time: '22 mins ago' },
                      { icon: <Zap size={16} color="#a855f7" />, title: 'SpinLot draw completed', desc: 'Randomized chest allocation finalized for Speech General competition', time: '35 mins ago' },
                    ].map((act, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {act.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>{act.title}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{act.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPINLOT FEATURE SECTION (SECRET JUDGE CODES A, B, C...) ── */}
      <section className="demo-spinlot-section">
        <div className="demo-container">
          <div className="demo-spinlot-grid">
            <div>
              <div className="demo-badge">
                <Zap size={14} style={{ color: '#fbbf24' }} />
                <span>Anonymous Lot Code Allocation (Code A, B, C...)</span>
              </div>
              <h2 className="demo-section-heading">Draw Secret Codes (A, B, C...) for 100% Blind Judging</h2>
              <p className="demo-section-desc" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
                FestAlchemy's SpinLot assigns confidential evaluation codes (<strong>Code A, Code B, Code C...</strong>) and stage appearance orders to contestants. Judges evaluate participants strictly by their anonymous code with zero identity or team bias.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
                    <strong>Blind Judge Scoring:</strong> Judges evaluate <em>“Contestant Code C”</em> with zero knowledge of names or teams
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
                    <strong>Cryptographic Randomizer:</strong> Transparent digital wheel draws letter codes with tamper-proof logs
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="demo-feature-check"><Check size={12} /></span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>
                    <strong>Real-Time Scorecard Sync:</strong> Assigned codes instantly update the judge portal and stage calling roster
                  </span>
                </div>
              </div>

              <button
                onClick={handleSpinLot}
                disabled={isSpinning}
                className="demo-btn-primary"
                style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}
              >
                <Zap size={18} />
                <span>{isSpinning ? 'Drawing Lot Code...' : 'Spin Lot for Code (A, B, C...)'}</span>
              </button>
            </div>

            {/* Interactive Digital Wheel Stage */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div className="demo-wheel-stage">
                <div className="demo-wheel-pointer" />
                <div className="demo-wheel-outer-ring" />
                
                {/* Rotating Disc with Letter Codes A, B, C, D, E, F */}
                <div
                  className="demo-wheel-disc"
                  style={{
                    transform: `rotate(${spinRotation}deg)`
                  }}
                >
                  {[
                    { code: 'A', rot: 30, color: '#6366f1' },
                    { code: 'B', rot: 90, color: '#38bdf8' },
                    { code: 'C', rot: 150, color: '#22c55e' },
                    { code: 'D', rot: 210, color: '#fbbf24' },
                    { code: 'E', rot: 270, color: '#f43f5e' },
                    { code: 'F', rot: 330, color: '#a855f7' },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="demo-wheel-segment-label"
                      style={{
                        transform: `rotate(${s.rot}deg) translate(0, -95px) rotate(-${s.rot}deg)`,
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        color: '#ffffff'
                      }}
                    >
                      {s.code}
                    </div>
                  ))}
                </div>

                <div className="demo-wheel-center-hub">
                  <Sparkles size={24} />
                </div>
              </div>

              {/* Result Card with pop in */}
              <div style={{ marginTop: '2rem', minHeight: '130px' }}>
                {isSpinning ? (
                  <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '1.1rem', animation: 'demoPulse 1s infinite' }}>
                    🎰 Drawing Secret Evaluation Code (A, B, C...)...
                  </div>
                ) : (
                  <div className="demo-spin-result-card" style={{ maxWidth: '340px', margin: '0 auto' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                      Drawn Secret Evaluation Code
                    </div>
                    <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Sora', textShadow: '0 0 25px rgba(99,102,241,0.9)' }}>
                      CODE {selectedCode}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Assigned to: <strong>Chest #104 (Muhammad Ayaan)</strong>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '2px', fontWeight: 600 }}>
                      ✓ Judge Portal evaluates ONLY as "Code {selectedCode}" (Chest # strictly hidden)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dual-View Blind Judging Architecture Breakdown */}
          <div style={{ marginTop: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                HOW BLIND JUDGING WORKS IN FESTALCHEMY
              </span>
              <h4 style={{ margin: '4px 0 0', fontSize: '1.1rem', color: '#ffffff', fontFamily: 'Sora' }}>
                Stage Calling Roster vs. Judge Scoring Portal
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0' }}>
                The chest number is strictly kept on the backstage calling roster. Judges <strong>cannot see chest numbers or names</strong> — they only see and score the assigned SpinLot code.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Box 1: Stage Manager View */}
              <div style={{ background: '#111524', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>🎤 STAGE CALLING ROSTER (Stage Crew & Backstage)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                  <div>• <strong>Chest Number:</strong> Chest # 104</div>
                  <div>• <strong>Participant Name:</strong> Muhammad Ayaan</div>
                  <div>• <strong>Team:</strong> Al Noor Academy</div>
                  <div>• <strong>Assigned Spin Code:</strong> <span style={{ color: '#818cf8', fontWeight: 800 }}>CODE {selectedCode}</span></div>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                  Stage manager announces: <em>"Calling Contestant with Code {selectedCode} to Stage 1!"</em>
                </div>
              </div>

              {/* Box 2: Judge Scoring View */}
              <div style={{ background: '#141828', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '12px', padding: '1.1rem', boxShadow: '0 10px 25px rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <span>⚖️ JUDGE SCORING PORTAL (Evaluators)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                  <div>• <strong>Chest Number:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>[STRICTLY HIDDEN 🚫]</span></div>
                  <div>• <strong>Participant Name:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>[STRICTLY HIDDEN 🚫]</span></div>
                  <div>• <strong>Team / Academy:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>[STRICTLY HIDDEN 🚫]</span></div>
                  <div>• <strong>Visible Identity:</strong> <span style={{ background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>CODE {selectedCode} ONLY</span></div>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                  ✓ 100% Blind Evaluation. Zero identity or team bias.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS COMPILATION SECTION ──────────────────────────────── */}
      <section className="demo-results-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Automated Compilation</div>
            <h2 className="demo-section-heading">From Marks to Results, Automatically.</h2>
            <p className="demo-section-desc">
              Eliminate calculation errors and delays. Scores submitted by judges are instantly validated, compiled, resolved for ties, and published.
            </p>
          </div>

          {/* Visual Flow Diagram */}
          <div className="demo-flow-diagram">
            <div className="demo-flow-step active">
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📝</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Judges Submit Marks</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Multi-criteria points</div>
            </div>

            <div className="demo-flow-arrow">➔</div>

            <div className="demo-flow-step active">
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛡️</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Validation Rules</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max limits verified</div>
            </div>

            <div className="demo-flow-arrow">➔</div>

            <div className="demo-flow-step active">
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⚙️</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Scores Compiled</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Weighted aggregation</div>
            </div>

            <div className="demo-flow-arrow">➔</div>

            <div className="demo-flow-step active">
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>⚖️</div>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem' }}>Ties Calculated</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Rule-based breaking</div>
            </div>

            <div className="demo-flow-arrow">➔</div>

            <div className="demo-flow-step active" style={{ borderColor: '#22c55e', background: 'rgba(34,197,94,0.1)' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📢</div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.85rem' }}>Results Published</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Instant live bulletin</div>
            </div>
          </div>

          {/* Results Table Preview with Interactive Button */}
          <div className="demo-results-table-card" style={{ maxWidth: '920px', margin: '0 auto' }}>
            <div style={{ padding: '1.25rem 1.75rem', background: '#141828', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL RESULT SHEET</span>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontFamily: 'Sora' }}>
                  Quran Recitation (Senior Category)
                </h4>
              </div>

              <button
                onClick={handlePublishResults}
                className="demo-btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem', background: isPublished ? '#16a34a' : undefined }}
              >
                <CheckCircle2 size={15} />
                <span>{isPublished ? 'Published & Live' : 'Publish Results'}</span>
              </button>
            </div>

            {publishFeedback && (
              <div style={{ background: 'rgba(34,197,94,0.15)', borderBottom: '1px solid rgba(34,197,94,0.3)', padding: '0.65rem 1.75rem', color: '#4ade80', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={14} />
                <span>{publishFeedback}</span>
              </div>
            )}

            <div style={{ padding: '1rem 1.75rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Rank</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Chest No</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Participant</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Team</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Total Score</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Official Award</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 800, color: '#f59e0b' }}>1</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#a5b4fc', fontWeight: 600 }}>A-104</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#ffffff', fontWeight: 600 }}>Muhammad Ayaan</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#cbd5e1' }}>Al Noor Academy</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#ffffff' }}>92 / 100</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        🥇 First Prize
                      </span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 800, color: '#94a3b8' }}>2</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#a5b4fc', fontWeight: 600 }}>B-217</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#ffffff', fontWeight: 600 }}>Ahmed Rayan</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#cbd5e1' }}>Markaz Arts Guild</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#ffffff' }}>89 / 100</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <span style={{ background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        🥈 Second Prize
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 800, color: '#d97706' }}>3</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#a5b4fc', fontWeight: 600 }}>C-086</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#ffffff', fontWeight: 600 }}>Salman Faris</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#cbd5e1' }}>Noorul Huda</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#ffffff' }}>87 / 100</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      <span style={{ background: 'rgba(217,119,6,0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        🥉 Third Prize
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── POSTER STUDIO & PUBLIC VIEW POSTER SECTION ─────────────── */}
      <section className="demo-editor-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Visual Engine & Public Experience</div>
            <h2 className="demo-section-heading">Poster Template Studio & Public Viewer</h2>
            <p className="demo-section-desc">
              Design dynamic canvas layouts in the coordinator studio, and give public attendees instant access to download and view official event posters in real time.
            </p>
          </div>

          {/* Toggle between Admin Template Editor and Public View Poster Option */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setEditorMode('studio')}
              className={`demo-deepdive-tab-btn ${editorMode === 'studio' ? 'active' : ''}`}
            >
              👑 Coordinator Template Studio (Admin)
            </button>
            <button
              onClick={() => setEditorMode('public_view')}
              className={`demo-deepdive-tab-btn ${editorMode === 'public_view' ? 'active' : ''}`}
            >
              📢 Public "View Poster" Experience
            </button>
          </div>

          {/* VIEW 1: Coordinator Poster Template Studio Replica */}
          {editorMode === 'studio' ? (
            <div className="demo-editor-workspace" style={{ maxWidth: '1080px', margin: '0 auto' }}>
              {/* Window Header */}
              <div className="demo-browser-header">
                <div className="demo-browser-dots">
                  <span className="demo-browser-dot demo-dot-red" />
                  <span className="demo-browser-dot demo-dot-yellow" />
                  <span className="demo-browser-dot demo-dot-green" />
                </div>
                <div className="demo-browser-address-bar" style={{ maxWidth: '420px' }}>
                  <Lock size={10} style={{ color: '#22c55e' }} />
                  <span>festalchemy.io/admin/posters/editor</span>
                </div>
              </div>

              {/* Poster Editor Top Action Bar (Matching PosterTemplateEditor.jsx) */}
              <div className="demo-editor-top-bar">
                <div className="demo-editor-top-actions">
                  <button className="demo-editor-mini-btn" title="Undo (Ctrl+Z)">
                    <Undo size={14} />
                    <span>Undo</span>
                  </button>
                  <button className="demo-editor-mini-btn" title="Redo (Ctrl+Y)">
                    <Redo size={14} />
                    <span>Redo</span>
                  </button>
                  <label className="demo-editor-mini-btn" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <span>{bgImageUrl ? 'Change Background Image' : 'Upload Background Image'}</span>
                    <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {templateSavedMsg && (
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> {templateSavedMsg}
                    </span>
                  )}
                  <button
                    onClick={handleSavePosterTemplate}
                    disabled={templateSaving}
                    className="demo-btn-primary"
                    style={{ padding: '0.45rem 1.1rem', fontSize: '0.78rem', borderRadius: '6px' }}
                  >
                    <Save size={14} />
                    <span>{templateSaving ? 'Saving Template...' : 'Save Template'}</span>
                  </button>
                </div>
              </div>

              {/* Editor Replica 2-Column Grid */}
              <div className="demo-editor-canvas-grid-replica">
                {/* Center Canvas Stage */}
                <div className="demo-editor-canvas-stage">
                  <div
                    className="demo-real-poster-canvas"
                    style={{
                      background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="demo-canvas-grid-lines" />

                    {/* Interactive Text Layers from posterConfig */}
                    {Object.entries(posterConfig).map(([key, item]) => {
                      const isSelected = selectedFieldKey === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedFieldKey(key)}
                          className={`demo-canvas-element ${isSelected ? 'selected' : ''}`}
                          style={{
                            top: `${item.y}%`,
                            left: `${item.x}%`,
                            fontFamily: item.font,
                            fontSize: `${item.size}px`,
                            color: item.color,
                            fontWeight: key === 'program' || key.endsWith('_name') ? 800 : 600,
                          }}
                        >
                          {isSelected && (
                            <span className="demo-element-coord-tag">
                              X:{Math.round(item.x * 10.8)} Y:{Math.round(item.y * 13.5)}
                            </span>
                          )}
                          {item.text}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Inspector Controls */}
                <div className="demo-editor-sidebar-controls">
                  <div>
                    <div className="demo-editor-group-label">Background Template Image</div>
                    <div style={{ background: '#090c15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '38px', height: '48px', borderRadius: '4px', background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : '#1e293b', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          rESUT_01_MNLdihI.jpg
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                          1080 × 1350 Native Aspect
                        </div>
                      </div>
                      <label className="demo-editor-mini-btn" style={{ padding: '0.3rem 0.5rem', fontSize: '0.68rem', cursor: 'pointer' }}>
                        Change
                        <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="demo-editor-group-label">Active Layer</div>
                    <select
                      value={selectedFieldKey}
                      onChange={e => setSelectedFieldKey(e.target.value)}
                      className="demo-editor-input"
                    >
                      <option value="program">Program Name</option>
                      <option value="category">Category</option>
                      <option value="rank1_label">1st Place Label</option>
                      <option value="rank1_name">1st Place Name</option>
                      <option value="rank1_team">1st Place Team</option>
                      <option value="rank2_label">2nd Place Label</option>
                      <option value="rank2_name">2nd Place Name</option>
                      <option value="rank2_team">2nd Place Team</option>
                      <option value="rank3_label">3rd Place Label</option>
                      <option value="rank3_name">3rd Place Name</option>
                      <option value="rank3_team">3rd Place Team</option>
                      <option value="result_value">Result Number</option>
                    </select>
                  </div>

                  <div>
                    <div className="demo-editor-group-label">Typography Font</div>
                    <select
                      value={posterConfig[selectedFieldKey]?.font || 'Sora'}
                      onChange={e => handleUpdateField('font', e.target.value)}
                      className="demo-editor-input"
                    >
                      <option value="Sora">Sora (Display Bold)</option>
                      <option value="Cinzel">Cinzel (Royal Classical)</option>
                      <option value="Montserrat">Montserrat (Modern Sans)</option>
                      <option value="Poppins">Poppins (Geometric)</option>
                      <option value="Inter">Inter (Clean UI)</option>
                    </select>
                  </div>

                  <div>
                    <div className="demo-editor-group-label">
                      Font Size: <span style={{ color: '#ffffff' }}>{posterConfig[selectedFieldKey]?.size || 14}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="28"
                      value={posterConfig[selectedFieldKey]?.size || 14}
                      onChange={e => handleUpdateField('size', Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#6366f1' }}
                    />
                  </div>

                  <div>
                    <div className="demo-editor-group-label">Layer Color</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      {['#ffffff', '#ffd700', '#c0c0c0', '#cd7f32', '#6366f1', '#38bdf8'].map(c => (
                        <button
                          key={c}
                          onClick={() => handleUpdateField('color', c)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            background: c,
                            border: posterConfig[selectedFieldKey]?.color === c ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      value={posterConfig[selectedFieldKey]?.color || '#ffffff'}
                      onChange={e => handleUpdateField('color', e.target.value)}
                      className="demo-editor-input"
                      style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <div className="demo-editor-group-label">Alignment & Position</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>X Coordinate</span>
                        <input
                          type="number"
                          value={Math.round((posterConfig[selectedFieldKey]?.x || 50) * 10.8)}
                          onChange={e => handleUpdateField('x', Number(e.target.value) / 10.8)}
                          className="demo-editor-input"
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Y Coordinate</span>
                        <input
                          type="number"
                          value={Math.round((posterConfig[selectedFieldKey]?.y || 50) * 13.5)}
                          onChange={e => handleUpdateField('y', Number(e.target.value) / 13.5)}
                          className="demo-editor-input"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateField('x', 50)}
                      className="demo-btn-secondary"
                      style={{ width: '100%', padding: '0.35rem', fontSize: '0.72rem', borderRadius: '5px' }}
                    >
                      Align Center Horizontal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 2: Public "View Poster" Experience in Public Home & Results */
            <div className="demo-editor-workspace" style={{ maxWidth: '980px', margin: '0 auto' }}>
              <div className="demo-browser-header">
                <div className="demo-browser-dots">
                  <span className="demo-browser-dot demo-dot-red" />
                  <span className="demo-browser-dot demo-dot-yellow" />
                  <span className="demo-browser-dot demo-dot-green" />
                </div>
                <div className="demo-browser-address-bar" style={{ maxWidth: '420px' }}>
                  <span>festalchemy.io/results?program=solo-singing</span>
                </div>
              </div>

              <div className="demo-public-viewposter-wrap">
                <div style={{ textAlign: 'center', maxWidth: '580px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em' }}>
                    PUBLIC RESULTS VIEW
                  </span>
                  <h3 style={{ margin: '4px 0', fontSize: '1.25rem', color: '#ffffff', fontFamily: 'Sora' }}>
                    Solo Singing (Senior Male) — Published Results
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                    Official results published. Attendees can view and download the official event poster.
                  </p>
                </div>

                {downloadSuccessToast && (
                  <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={15} />
                    <span>{downloadSuccessToast}</span>
                  </div>
                )}

                {/* Public Event Results Bar with prominent View Poster Action */}
                <div className="demo-public-results-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                      🥇
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>1st Place: Muhammad Ayaan</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Team Al Noor Academy • Score: 92 pts</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => setPublicModalOpen(!publicModalOpen)}
                      className="demo-btn-primary"
                      style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem', borderRadius: '8px' }}
                    >
                      <FileText size={14} />
                      <span>{publicModalOpen ? 'Hide Poster Preview' : 'View Poster'}</span>
                    </button>
                    <button
                      onClick={handleDownloadPoster}
                      className="demo-btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', borderRadius: '8px' }}
                    >
                      <Download size={14} />
                      <span>Download Poster</span>
                    </button>
                  </div>
                </div>

                {/* Rendered Poster View Modal / Card */}
                {publicModalOpen && (
                  <div className="demo-public-modal-card">
                    {/* Rendered Poster Preview Sheet using the EXACT current template background image & layers */}
                    <div
                      className="demo-real-poster-canvas"
                      style={{
                        width: '260px',
                        height: '325px',
                        margin: '0 auto',
                        background: bgImageUrl ? `url(${bgImageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 30px rgba(99,102,241,0.2)',
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Render each dynamic field from current posterConfig */}
                      {Object.entries(posterConfig).map(([key, item]) => (
                        <div
                          key={key}
                          style={{
                            position: 'absolute',
                            top: `${item.y}%`,
                            left: `${item.x}%`,
                            transform: 'translate(-50%, -50%)',
                            fontFamily: item.font,
                            fontSize: `${Math.max(7, item.size * 0.8)}px`,
                            color: item.color,
                            fontWeight: key === 'program' || key.endsWith('_name') ? 800 : 600,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                          }}
                        >
                          {item.text}
                        </div>
                      ))}
                    </div>

                    {/* Modal Details & Download Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                          <CheckCircle2 size={14} /> Rendered on Current Template Background Image
                        </span>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#ffffff', fontFamily: 'Sora' }}>
                          Solo Singing Announcement Poster
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                          This poster is auto-rendered on the current template image with verified results and published live.
                        </p>

                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1.25rem' }}>
                          <div>• Event: <strong>Solo Singing (Senior)</strong></div>
                          <div>• Template: <strong>rESUT_01_MNLdihI.jpg</strong></div>
                          <div>• Dimensions: <strong>1080 x 1350 High-Res PNG</strong></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleDownloadPoster}
                          className="demo-btn-primary"
                          style={{ padding: '0.6rem 1.25rem', fontSize: '0.82rem' }}
                        >
                          <Download size={15} />
                          <span>Download High-Res Poster</span>
                        </button>
                        <button
                          onClick={() => setPublicModalOpen(false)}
                          className="demo-btn-secondary"
                          style={{ padding: '0.6rem 1rem', fontSize: '0.82rem' }}
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MOBILE EXPERIENCE SECTION ────────────────────────────────── */}
      <section className="demo-mobile-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Pocket Productivity</div>
            <h2 className="demo-section-heading">Festival Management, In Your Pocket.</h2>
            <p className="demo-section-desc">
              Every workflow is tailored for high-speed touch devices so judges, team leaders, and attendees never miss a beat.
            </p>
          </div>

          <div className="demo-mobile-phones-row">
            {/* Phone 1: Realistic Judge Portal Evaluation UI */}
            <div style={{ textAlign: 'center' }}>
              <div className="demo-phone-frame">
                <div className="demo-phone-notch">
                  <span className="demo-phone-speaker" />
                  <span className="demo-phone-camera" />
                </div>
                <div className="demo-phone-screen" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* Top bar with back button & program badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#94a3b8', fontSize: '0.7rem' }}>
                      <ChevronLeft size={13} /> <span>Programs</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Quran Recitation
                    </span>
                  </div>

                  {/* Secret Lot Code Box */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(56,189,248,0.1) 100%)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '10px', padding: '0.65rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      EVALUATION PORTAL
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '2px', margin: '2px 0', textShadow: '0 0 12px rgba(99,102,241,0.6)' }}>
                      CODE: C
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                      <Lock size={9} /> Blind Judging: Names & Chest No Hidden
                    </div>
                  </div>

                  {/* Score Input Display */}
                  <div style={{ background: '#111524', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.55rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Enter Score (Max 100)</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>88.5% of Max</span>
                    </div>
                    <div style={{ background: '#090c15', border: '1px solid rgba(99,102,241,0.5)', borderRadius: '6px', padding: '0.35rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
                      88.5
                    </div>

                    {/* Range Slider Track */}
                    <div style={{ marginTop: '0.5rem', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: '88.5%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)', borderRadius: '3px' }} />
                    </div>

                    {/* Quick Snap Milestones */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', gap: '3px' }}>
                      {['25', '50', '75', '88.5', '100'].map((m, i) => (
                        <span key={i} style={{ fontSize: '0.58rem', padding: '2px 4px', background: m === '88.5' ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.05)', color: m === '88.5' ? '#38bdf8' : '#94a3b8', borderRadius: '3px', fontWeight: m === '88.5' ? 700 : 500 }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '0.4rem', marginTop: 'auto' }}>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '6px', padding: '0.45rem', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}>
                      Save Draft
                    </button>
                    <button style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '0.45rem', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}>
                      <Send size={11} /> Submit Marks
                    </button>
                  </div>
                </div>
                <div className="demo-phone-homebar" />
              </div>
              <h4 style={{ marginTop: '1rem', color: '#ffffff' }}>Judge Portal</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>100% blind scoring with milestone snaps & live validation</p>
            </div>

            {/* Phone 2: Realistic Team Lead Portal UI */}
            <div style={{ textAlign: 'center' }}>
              <div className="demo-phone-frame">
                <div className="demo-phone-notch">
                  <span className="demo-phone-speaker" />
                  <span className="demo-phone-camera" />
                </div>
                <div className="demo-phone-screen" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} style={{ color: '#4ade80' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>Team Al Noor</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      124 Registered
                    </span>
                  </div>

                  {/* Action Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                    <button style={{ background: '#22c55e', border: 'none', color: '#000000', borderRadius: '6px', padding: '0.38rem', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', cursor: 'pointer' }}>
                      + Add Member
                    </button>
                    <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', borderRadius: '6px', padding: '0.38rem', fontSize: '0.65rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', cursor: 'pointer' }}>
                      <Calendar size={11} /> Schedule
                    </button>
                  </div>

                  {/* Member Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {/* Member 1 */}
                    <div style={{ background: '#111524', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'monospace' }}>A-101</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>Zaid Farhan</span>
                        </div>
                        <span style={{ fontSize: '0.58rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 5px', borderRadius: '3px' }}>Senior</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <span style={{ fontSize: '0.58rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '1px 4px', borderRadius: '3px' }}>Quran</span>
                          <span style={{ fontSize: '0.58rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '1px 4px', borderRadius: '3px' }}>Speech</span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#818cf8', fontWeight: 600 }}>Manage ➔</span>
                      </div>
                    </div>

                    {/* Member 2 */}
                    <div style={{ background: '#111524', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'monospace' }}>A-102</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>Bilal Ahmed</span>
                        </div>
                        <span style={{ fontSize: '0.58rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '1px 5px', borderRadius: '3px' }}>Junior</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <span style={{ fontSize: '0.58rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '1px 4px', borderRadius: '3px' }}>Nasheed</span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#818cf8', fontWeight: 600 }}>Manage ➔</span>
                      </div>
                    </div>

                    {/* Member 3 */}
                    <div style={{ background: '#111524', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'monospace' }}>A-104</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>M. Ayaan</span>
                        </div>
                        <span style={{ fontSize: '0.58rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 5px', borderRadius: '3px' }}>Senior</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <span style={{ fontSize: '0.58rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '1px 4px', borderRadius: '3px' }}>Solo Sing</span>
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#818cf8', fontWeight: 600 }}>Manage ➔</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tabs */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.45rem', fontSize: '0.62rem', color: '#94a3b8' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700 }}>👥 Roster</span>
                    <span>📅 Schedule</span>
                    <span>📊 Team Stats</span>
                  </div>
                </div>
                <div className="demo-phone-homebar" />
              </div>
              <h4 style={{ marginTop: '1rem', color: '#ffffff' }}>Team Lead Portal</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Contingent roster, program assignments & schedule planner</p>
            </div>

            {/* Phone 3: Realistic Live Public Results & Poster UI */}
            <div style={{ textAlign: 'center' }}>
              <div className="demo-phone-frame">
                <div className="demo-phone-notch">
                  <span className="demo-phone-speaker" />
                  <span className="demo-phone-camera" />
                </div>
                <div className="demo-phone-screen" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trophy size={13} style={{ color: '#fbbf24' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>Live Results</span>
                    </div>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Published
                    </span>
                  </div>

                  {/* Program Summary Card */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(99,102,241,0.1) 100%)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>OFFICIAL EVENT RESULT</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>Solo Singing (Senior)</div>
                  </div>

                  {/* Winners Podium Showcase */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {/* 1st Place */}
                    <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '6px', padding: '0.4rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem' }}>🥇</span>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffd700' }}>Muhammad Ayaan</div>
                          <div style={{ fontSize: '0.58rem', color: '#cbd5e1' }}>Al Noor Academy</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255,215,0,0.2)', color: '#ffd700', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>92 pts</span>
                    </div>

                    {/* 2nd Place */}
                    <div style={{ background: 'rgba(192,192,192,0.08)', border: '1px solid rgba(192,192,192,0.2)', borderRadius: '6px', padding: '0.4rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem' }}>🥈</span>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>Ahmed Rayan</div>
                          <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Markaz Guild</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>89 pts</span>
                    </div>

                    {/* 3rd Place */}
                    <div style={{ background: 'rgba(205,127,50,0.08)', border: '1px solid rgba(205,127,50,0.2)', borderRadius: '6px', padding: '0.4rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem' }}>🥉</span>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706' }}>Salman Faris</div>
                          <div style={{ fontSize: '0.58rem', color: '#94a3b8' }}>Noorul Huda</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(205,127,50,0.15)', color: '#d97706', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>87 pts</span>
                    </div>
                  </div>

                  {/* Poster Action Button */}
                  <button 
                    onClick={() => setPublicModalOpen(true)}
                    style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '0.45rem', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}
                  >
                    <FileText size={11} /> View Official Poster (1080x1350)
                  </button>
                </div>
                <div className="demo-phone-homebar" />
              </div>
              <h4 style={{ marginTop: '1rem', color: '#ffffff' }}>Live Public Portal</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Instant podium announcements & high-res poster viewer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY SECTION ─────────────────────────────────────────── */}
      <section className="demo-security-section">
        <div className="demo-container">
          <div className="demo-section-title-wrap">
            <div className="demo-section-subtitle">Security Architecture</div>
            <h2 className="demo-section-heading">Built Around Roles. Secured by Tokens.</h2>
            <p className="demo-section-desc">
              Secure token-based authentication ensures every user sees only the tools and information relevant to their role.
            </p>
          </div>

          <div className="demo-roles-chain">
            {/* ADMIN */}
            <div className="demo-role-card">
              <span className="demo-role-pill role-admin">ADMINISTRATOR</span>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Ecosystem Authority</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                Full administrative scope over programs, scoring algorithms, poster studio, judge allocations and results.
              </p>
              <div style={{ fontSize: '0.7rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={13} /> Token Scope: <code style={{ color: '#f1f5f9' }}>auth.admin.all</code>
              </div>
            </div>

            {/* JUDGE */}
            <div className="demo-role-card">
              <span className="demo-role-pill role-judge">EVALUATOR / JUDGE</span>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Blind Evaluation</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                Restricted strictly to assigned venue marksheets with blind participant lot-codes and submission locking.
              </p>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={13} /> Token Scope: <code style={{ color: '#f1f5f9' }}>judge.eval.scoped</code>
              </div>
            </div>

            {/* TEAM LEAD */}
            <div className="demo-role-card">
              <span className="demo-role-pill role-teamlead">TEAM LEAD</span>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Contingent Manager</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                Enrolls and edits members within their own team boundary. Cannot alter other delegations or judging metrics.
              </p>
              <div style={{ fontSize: '0.7rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> Token Scope: <code style={{ color: '#f1f5f9' }}>team.lead.delegation</code>
              </div>
            </div>

            {/* PUBLIC */}
            <div className="demo-role-card">
              <span className="demo-role-pill role-public">PUBLIC AUDIENCE</span>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>Live Read-Only</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                Zero credentials required. Read-only access to published bulletins, live leaderboards, and official results.
              </p>
              <div style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={13} /> Token Scope: <code style={{ color: '#f1f5f9' }}>public.readonly</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA & FOOTER ───────────────────────────────────────── */}
      <section className="demo-final-cta-section">
        <div className="demo-container">
          <div className="demo-cta-box">
            <div className="demo-badge">
              <Sparkles size={14} style={{ color: '#fbbf24' }} />
              <span>Transform Your Next Arts Fest</span>
            </div>

            <h2 className="demo-hero-heading" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', marginBottom: '1.25rem' }}>
              Your Festival. <br />
              <span className="demo-gradient-text">Managed Smarter.</span>
            </h2>

            <p className="demo-hero-text" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
              From the first registration to the final result, FestAlchemy turns festival management into a connected digital experience.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/ilalhabeeb" className="demo-btn-primary">
                <span>Explore FestAlchemy</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="demo-btn-secondary">
                <span>View All Portals</span>
                <ExternalLink size={15} />
              </Link>
            </div>
          </div>

          {/* Footer */}
          <footer className="demo-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src="/logo.png" alt="FestAlchemy Logo" style={{ width: '28px', height: '28px' }} />
              <span style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'Sora' }}>FestAlchemy</span>
              <span style={{ color: '#64748b' }}>— Smart Festival Management</span>
            </div>

            <div className="demo-footer-links">
              <Link to="/ilalhabeeb">Home</Link>
              <a href="#portals-showcase">Portals</a>
              <a href="#control-room">Features</a>
              <Link to="/results">Results</Link>
              <Link to="/login">Login</Link>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
