import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EduFenstaFooter() {
  const { isAuthenticated, user } = useAuth();

  const portalInfo = useMemo(() => {
    if (!isAuthenticated || !user) return { to: '/login', label: 'Portal Login' };
    switch (user.role) {
      case 'admin':
        return { to: '/admin', label: 'Admin Portal' };
      case 'judge':
        return { to: '/judge', label: 'Judge Portal' };
      case 'teamlead':
        return { to: '/teamlead', label: 'Team Portal' };
      default:
        return { to: '/admin', label: 'Dashboard' };
    }
  }, [isAuthenticated, user]);

  return (
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
          <Link to={portalInfo.to}>{portalInfo.label}</Link>
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
          <a href="#">Day 1 — Oct 06</a>
          <a href="#">Day 2 — Oct 07</a>
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
  );
}
