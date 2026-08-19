import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessControlProvider, useAccessControl } from './context/AccessControlContext';

// Views
import HomePage from './views/HomePage';
import TeamStatsPage from './views/TeamStatsPage';
import ResultsPage from './views/ResultsPage';
import ProductDemoPage from './views/ProductDemoPage';
import CustomCursor from './components/CustomCursor';
import Login from './views/Login';
import AdminPanel from './views/AdminPanel';
import JudgePanel from './views/JudgePanel';
import TeamLeadPanel from './views/TeamLeadPanel';
import AccessDeniedPage from './views/AccessDeniedPage';
import SecretAccessPortal from './views/SecretAccessPortal';

// Icons
import { Trophy, LogIn, LogOut, Shield, Award, Users, RefreshCw, Moon, Sun, CheckCircle2, AlertTriangle, Info, XCircle, X, Menu, Sparkles, ArrowRight } from 'lucide-react';


// ── Theme Context ────────────────────────────────────────────
export const ThemeContext = React.createContext({ theme: 'dark', toggleTheme: () => { } });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fa-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fa-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── UI Context & Provider ─────────────────────────────────────
export const UIContext = React.createContext({
  showToast: (message, type = 'success') => {},
  confirm: (title, message) => Promise.resolve(false)
});

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setConfirmData({ title, message, resolve });
    });
  };

  const handleConfirmClose = (result) => {
    if (confirmData) {
      confirmData.resolve(result);
      setConfirmData(null);
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />;
      case 'danger':
      case 'error':
        return <XCircle size={16} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />;
      default:
        return <Info size={16} style={{ color: 'var(--info)' }} />;
    }
  };

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Floating Toast Stack */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-${t.type === 'error' ? 'danger' : t.type}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getToastIcon(t.type)}
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.message}</span>
            </span>
            <button 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Custom Confirmation Modal */}
      {confirmData && (
        <div className="confirm-modal-backdrop">
          <div className="confirm-modal-box">
            <h4 style={{ margin: '0 0 0.75rem 0', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
              {confirmData.title}
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
              {confirmData.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handleConfirmClose(false)} 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 1rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleConfirmClose(true)} 
                className="btn btn-primary" 
                style={{ padding: '0.45rem 1rem', background: 'var(--danger)', borderColor: 'transparent', boxShadow: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--danger) 85%, #000)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--danger)'}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Custom Cursor rendered on top of all popups & overlays */}
      <CustomCursor />
    </UIContext.Provider>
  );
}

// ── Route Guard ──────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <RefreshCw className="spinning" size={32} style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to="/ilalhabeeb" replace />;
  return children;
}

// ── Navbar ───────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const { isUnlocked, lock } = useAccessControl();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showHomeNav, setShowHomeNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/' || location.pathname === '/ilalhabeeb';
  const isDemoPage = location.pathname === '/demo';
  const isPublicPage = ['/', '/ilalhabeeb', '/results', '/team-status', '/demo'].includes(location.pathname);

  const [activeDemoSection, setActiveDemoSection] = useState('demo-hero');

  const demoNavSections = [
    { id: 'demo-hero', label: 'Overview' },
    { id: 'portals-showcase', label: '4 Portals' },
    { id: 'control-room', label: 'Control Room' },
    { id: 'spinlot-section', label: 'SpinLot' },
    { id: 'results-pipeline', label: 'Compilation' },
    { id: 'poster-studio', label: 'Poster Studio' },
    { id: 'mobile-experience', label: 'Mobile App' },
    { id: 'security-section', label: 'Security' },
  ];

  // Scroll to section handler
  const handleScrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navHeight = 70;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Section observer on Demo page
  useEffect(() => {
    if (!isDemoPage) return;
    const sectionIds = [
      'demo-hero',
      'portals-showcase',
      'control-room',
      'spinlot-section',
      'results-pipeline',
      'poster-studio',
      'mobile-experience',
      'security-section'
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveDemoSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDemoPage]);

  // Detect scroll for showing navbar on home page only after reaching "Stage in Numbers"
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);

      if (isHomePage) {
        const targetSection = document.getElementById('stage-in-numbers') ||
                              document.querySelector('.cinematic-live-section-wrapper') ||
                              document.querySelector('.home-stats-section');
        if (targetSection) {
          const rect = targetSection.getBoundingClientRect();
          // Reveal navbar when Stage in Numbers is within or above viewport top
          setShowHomeNav(rect.top <= 100);
        } else {
          // Fallback based on track boundary
          const track = document.querySelector('.cinematic-scroll-track');
          if (track) {
            const trackRect = track.getBoundingClientRect();
            setShowHomeNav(trackRect.bottom <= 120);
          } else {
            setShowHomeNav(scrollY > window.innerHeight * 1.5);
          }
        }
      } else {
        setShowHomeNav(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClass = [
    'navbar',
    isHomePage ? (showHomeNav ? 'navbar--home-visible' : 'navbar--home-hidden') : '',
    scrolled ? 'navbar--scrolled' : '',
    mobileMenuOpen ? 'navbar--menu-open' : '',
  ].filter(Boolean).join(' ');

  // Dedicated Navbar when viewing the Demo page
  if (isDemoPage) {
    return (
      <nav className={`navbar navbar--demo ${scrolled ? 'navbar--scrolled' : ''} ${mobileMenuOpen ? 'navbar--menu-open' : ''}`}>
        <div className="nav-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/ilalhabeeb" className="nav-brand">
            <img src="/logo.png" alt="FestAlchemy Logo" className="nav-brand-img" />
            <span className="gradient-text">FestAlchemy</span>
          </Link>
          <span className="demo-nav-badge">
            <Sparkles size={11} style={{ color: '#fbbf24' }} /> DEMO
          </span>
        </div>

        {/* Hamburger toggle for mobile */}
        <button
          className={`nav-hamburger ${mobileMenuOpen ? 'nav-hamburger--active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle demo navigation"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Nav menu for demo sections */}
        <div className={`nav-menu ${mobileMenuOpen ? 'nav-menu--open' : ''}`}>
          <div className="nav-links-group demo-nav-sections-group">
            {demoNavSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleScrollToSection(sec.id)}
                className={`nav-link-item demo-nav-section-btn ${activeDemoSection === sec.id ? 'nav-link-item--active active' : ''}`}
              >
                <span className="nav-link-text">{sec.label}</span>
                {activeDemoSection === sec.id && <span className="nav-link-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-links-group nav-links-group--auth">
            <Link to="/ilalhabeeb" className="demo-nav-exit-btn" onClick={() => setMobileMenuOpen(false)}>
              <span>Live Festival</span>
              <ArrowRight size={13} />
            </Link>

            <Link to="/login" className="demo-nav-login-btn" onClick={() => setMobileMenuOpen(false)}>
              <span>Portal Login</span>
            </Link>

            {/* Quick Lock Button */}
            {isUnlocked && (
              <button
                onClick={lock}
                className="nav-lock-toggle-btn"
                title="Lock portal (switch to Access Denied)"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Shield size={12} />
                <span>Lock Site</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              className="nav-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`nav-theme-icon ${theme === 'dark' ? 'nav-theme-icon--sun' : 'nav-theme-icon--moon'}`}>
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </div>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Public links in navigation bar
  const publicLinks = isPublicPage
    ? [
        { to: '/ilalhabeeb', label: 'Home', exact: true },
        { to: '/results', label: 'Results' },
        { to: '/team-status', label: 'Team Status' },
      ]
    : [
        { to: '/ilalhabeeb', label: 'Home', exact: true },
      ];

  const isActive = (link) => {
    if (link.to === '/ilalhabeeb' || link.to === '/') {
      return location.pathname === '/' || location.pathname === '/ilalhabeeb';
    }
    return location.pathname === link.to;
  };

  return (
    <nav className={navClass}>
      <Link to="/ilalhabeeb" className="nav-brand">
        <img src="/logo.png" alt="FestAlchemy Logo" className="nav-brand-img" />
        <span className="gradient-text">FestAlchemy</span>
      </Link>

      {/* Hamburger toggle for mobile */}
      <button
        className={`nav-hamburger ${mobileMenuOpen ? 'nav-hamburger--active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Nav menu */}
      <div className={`nav-menu ${mobileMenuOpen ? 'nav-menu--open' : ''}`}>
        {/* Public links */}
        <div className="nav-links-group">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link-item ${isActive(link) ? 'nav-link-item--active' : ''}`}
            >
              <span className="nav-link-text">{link.label}</span>
              {isActive(link) && <span className="nav-link-indicator" />}
            </Link>
          ))}
        </div>

        {/* Authenticated links */}
        {isAuthenticated && (
          <div className="nav-links-group nav-links-group--auth">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`nav-link-item nav-link-item--portal ${location.pathname.startsWith('/admin') ? 'nav-link-item--active' : ''}`}
              >
                <Shield size={14} />
                <span className="nav-link-text">Admin</span>
                {location.pathname.startsWith('/admin') && <span className="nav-link-indicator" />}
              </Link>
            )}
            {user?.role === 'judge' && (
              <Link
                to="/judge"
                className={`nav-link-item nav-link-item--portal ${location.pathname.startsWith('/judge') ? 'nav-link-item--active' : ''}`}
              >
                <Award size={14} />
                <span className="nav-link-text">Judge</span>
                {location.pathname.startsWith('/judge') && <span className="nav-link-indicator" />}
              </Link>
            )}
            {user?.role === 'teamlead' && (
              <Link
                to="/teamlead"
                className={`nav-link-item nav-link-item--portal ${location.pathname.startsWith('/teamlead') ? 'nav-link-item--active' : ''}`}
              >
                <Users size={14} />
                <span className="nav-link-text">Team</span>
                {location.pathname.startsWith('/teamlead') && <span className="nav-link-indicator" />}
              </Link>
            )}

            <div className="nav-divider" />

            <span className="nav-user-greeting desktop-only">
              Hi, <strong>{user.first_name || user.username}</strong>
            </span>

            <button onClick={logout} className="nav-logout-btn">
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Lock Site button for Owner */}
        {isUnlocked && (
          <button
            onClick={lock}
            title="Lock system (switch to Access Denied for all visitors)"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginLeft: '0.5rem'
            }}
          >
            <Shield size={12} />
            <span>Lock</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="nav-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className={`nav-theme-icon ${theme === 'dark' ? 'nav-theme-icon--sun' : 'nav-theme-icon--moon'}`}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </div>
        </button>
      </div>
    </nav>
  );
}

// ── App Shell ─────────────────────────────────────────────────
function AppContent() {
  const { isUnlocked } = useAccessControl();
  const location = useLocation();

  const isSecretRoute = ['/secret-access', '/owner-portal', '/admin-gate'].includes(location.pathname);

  // When system is LOCKED and user is NOT on the secret route:
  // Render Access Denied page directly on any requested URL
  if (!isUnlocked && !isSecretRoute) {
    return <AccessDeniedPage />;
  }

  // If on secret route while locked, render Secret Access Portal
  if (!isUnlocked && isSecretRoute) {
    return (
      <Routes>
        <Route path="/secret-access" element={<SecretAccessPortal />} />
        <Route path="/owner-portal" element={<SecretAccessPortal />} />
        <Route path="/admin-gate" element={<SecretAccessPortal />} />
        <Route path="*" element={<Navigate to="/secret-access" replace />} />
      </Routes>
    );
  }

  // If system is UNLOCKED, render the full application normally
  const isHomePage = location.pathname === '/' || location.pathname === '/ilalhabeeb';
  const isFullWidthPage = isHomePage || location.pathname === '/demo';

  return (
    <div className="app-container">
      <Navbar />
      <main className={`main-content ${isFullWidthPage ? 'main-content--home' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/ilalhabeeb" replace />} />
          <Route path="/ilalhabeeb" element={<HomePage />} />
          <Route path="/demo" element={<ProductDemoPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/team-status" element={<TeamStatsPage />} />
          <Route path="/login" element={<Login />} />

          {/* Secret Access Portal accessible anytime when unlocked */}
          <Route path="/secret-access" element={<SecretAccessPortal />} />
          <Route path="/owner-portal" element={<SecretAccessPortal />} />
          <Route path="/admin-gate" element={<SecretAccessPortal />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/judge/*" element={
            <ProtectedRoute allowedRoles={['judge']}>
              <JudgePanel />
            </ProtectedRoute>
          } />

          <Route path="/teamlead/*" element={
            <ProtectedRoute allowedRoles={['teamlead']}>
              <TeamLeadPanel />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/ilalhabeeb" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccessControlProvider>
          <UIProvider>
            <Router>
              <AppContent />
            </Router>
          </UIProvider>
        </AccessControlProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
