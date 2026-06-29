import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Views
import PublicDashboard from './views/PublicDashboard';
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

  return (
    <nav className="navbar" style={{ padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" className="nav-brand" style={{ marginRight: '1rem', flexShrink: 0 }}>
        <Trophy size={18} style={{ color: 'var(--accent)' }} />
        <span className="gradient-text" style={{ fontSize: '1.1rem' }}>FestAlchemy</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
        >
          Home
        </Link>

        {/* Portal Switch Button */}
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
              >
                Admin
              </Link>
            )}
            {user?.role === 'judge' && (
              <Link 
                to="/judge" 
                className={`nav-link ${location.pathname.startsWith('/judge') ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
              >
                Judge
              </Link>
            )}
            {user?.role === 'teamlead' && (
              <Link 
                to="/teamlead" 
                className={`nav-link ${location.pathname.startsWith('/teamlead') ? 'active' : ''}`}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.6rem' }}
              >
                Team
              </Link>
            )}
            
            {/* User Greeting (Desktop only to save space on mobile) */}
            <span className="desktop-only" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>
              Hi, <strong>{user.first_name || user.username}</strong>
            </span>

            <button 
              onClick={logout} 
              className="btn btn-secondary" 
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="btn btn-primary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            Portal Login
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </nav>
  );
}

// ── App Shell ─────────────────────────────────────────────────
function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PublicDashboard />} />
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
