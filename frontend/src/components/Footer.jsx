import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand" style={{ marginBottom: '0.75rem' }}>
            <Activity size={22} className="brand-icon" />
            <span className="brand-text" style={{ fontSize: '1.2rem' }}>FireReach</span>
          </div>
          <p className="footer-desc">
            Autonomous B2B outreach powered by live signals, grounded AI, and zero hallucination.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" title="GitHub"><Github size={18} /></a>
            <a href="#" className="social-icon" title="Twitter"><Twitter size={18} /></a>
            <a href="#" className="social-icon" title="LinkedIn"><Linkedin size={18} /></a>
            <a href="#" className="social-icon" title="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>Product</h4>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/app">Launch App</Link>
        </div>

        <div className="footer-links-group">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
        </div>

        <div className="footer-links-group">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Security</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 FireReach. Built on the Rabbitt AI ecosystem.</span>
        <span>Made with ⚡ for B2B sales teams.</span>
      </div>
    </footer>
  );
}
