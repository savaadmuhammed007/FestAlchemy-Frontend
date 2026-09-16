import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EduFenstaNav({ activePage = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const portalInfo = useMemo(() => {
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

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setNavHidden(y > 200 && y > lastScrollY.current);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', to: '/edufensta', id: 'home' },
    { label: 'Standings', to: '/team-status', id: 'standings' },
    { label: 'Results', to: '/results', id: 'results' },
    { label: 'Demo', to: '/demo', id: 'demo' },
  ];

  return (
    <>
      <nav className={`ef-nav ${scrolled ? 'ef-nav--scrolled' : ''} ${navHidden && !mobileMenuOpen ? 'ef-nav--hidden' : ''}`}>
        <Link to="/edufensta" className="ef-nav__brand">
          <img src="/edufensta-logo.png" alt="EDUFENSTA" className="ef-nav__brand-logo" />
        </Link>

        <div className="ef-nav__links">
          {navLinks.map(link => {
            const isActive = activePage === link.id || location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`ef-nav__link ${isActive ? 'ef-nav__link--active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
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
        {navLinks.map(link => {
          const isActive = activePage === link.id || location.pathname === link.to;
          return (
            <Link
              key={link.label}
              to={link.to}
              className={`ef-nav__link ${isActive ? 'ef-nav__link--active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        <Link to={portalInfo.to} className="ef-nav__cta" onClick={() => setMobileMenuOpen(false)}>
          {portalInfo.label}
        </Link>
      </div>
    </>
  );
}
