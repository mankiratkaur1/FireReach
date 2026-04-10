import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/pricing', label: 'Pricing' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
        <Activity className="brand-icon" size={26} />
        <span className="brand-text">FireReach</span>
      </Link>

      {/* Desktop Nav */}
      <div className="nav-links">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
        <Link to="/app" className="nav-cta">Launch App →</Link>
      </div>

      {/* Mobile Hamburger */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="mobile-link" onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          <Link to="/app" className="mobile-cta" onClick={() => setMenuOpen(false)}>Launch App →</Link>
        </div>
      )}
    </nav>
  );
}
