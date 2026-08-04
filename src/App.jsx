import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Views
import HomePage from './views/HomePage';
import TeamStatsPage from './views/TeamStatsPage';
import ResultsPage from './views/ResultsPage';
import CustomCursor from './components/CustomCursor';
import Login from './views/Login';
import AdminPanel from './views/AdminPanel';
import JudgePanel from './views/JudgePanel';
import TeamLeadPanel from './views/TeamLeadPanel';

// Icons
import { Trophy, LogIn, LogOut, Shield, Award, Users, RefreshCw, Moon, Sun, CheckCircle2, AlertTriangle, Info, XCircle, X, Menu } from 'lucide-react';


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
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// ── Navbar ───────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = React.useContext(ThemeContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';
  const isPublicPage = ['/', '/results', '/team-status'].includes(location.pathname);

  // Detect scroll for transparent → solid navbar on home page
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClass = [
    'navbar',
    isHomePage && !scrolled ? 'navbar--transparent' : '',
    scrolled ? 'navbar--scrolled' : '',
    mobileMenuOpen ? 'navbar--menu-open' : '',
  ].filter(Boolean).join(' ');

  // Only show Results/Team Status on public pages
  const publicLinks = isPublicPage
    ? [
        { to: '/', label: 'Home', exact: true },
        { to: '/results', label: 'Results' },
        { to: '/team-status', label: 'Team Status' },
      ]
    : [
        { to: '/', label: 'Home', exact: true },
      ];

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname === link.to;
  };

  return (
    <nav className={navClass}>
      <Link to="/" className="nav-brand">
        <div className="nav-brand-icon">
          <Trophy size={18} />
        </div>
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
  const location = useLocation();
  return (
    <div className="app-container">
      <CustomCursor />
      <Navbar />
      <main className={`main-content ${location.pathname === '/' ? 'main-content--home' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/team-status" element={<TeamStatsPage />} />
          <Route path="/login" element={<Login />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <Router>
            <AppContent />
          </Router>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
