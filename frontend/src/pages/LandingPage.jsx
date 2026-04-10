import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Play, Zap, Target, TrendingUp, Shield, Mail, Search,
  ArrowRight, CheckCircle2, Star, Globe, Clock, Users
} from 'lucide-react';

const features = [
  {
    icon: <Search size={28} />,
    title: 'Live Signal Harvesting',
    desc: 'Scans TechCrunch, Bloomberg, LinkedIn and 50+ sources in real-time to capture funding rounds, leadership changes, and hiring surges.'
  },
  {
    icon: <Target size={28} />,
    title: 'Contact Discovery',
    desc: 'Automatically identifies CTO, VP Engineering, Head of Security — the exact decision-makers who control the budget and the buy.'
  },
  {
    icon: <Shield size={28} />,
    title: 'Zero Hallucination Policy',
    desc: 'Every signal, every claim, every email is grounded in real data returned by live tools. No fabrication, ever.'
  },
  {
    icon: <Mail size={28} />,
    title: 'Role-Aware Emails',
    desc: 'The CTO email and the CISO email for the same company are completely different — each one mapped to their specific pain point.'
  },
  {
    icon: <Zap size={28} />,
    title: 'Fully Autonomous',
    desc: 'One company name. One ICP. Five steps executed automatically — contact discovery to email delivery — zero manual work.'
  },
  {
    icon: <TrendingUp size={28} />,
    title: 'Signal-Grounded Outreach',
    desc: 'Every email opens with a named, real event — Series B raise, a new VP hire, headcount surge — making you impossible to ignore.'
  },
];

const steps = [
  { num: '01', title: 'Contact Discovery', desc: 'Agent autonomously identifies 2–3 decision makers and their verified emails.' },
  { num: '02', title: 'Signal Harvesting', desc: 'Live APIs scan for funding rounds, leadership changes, and hiring patterns.' },
  { num: '03', title: 'Account Brief', desc: 'Role-aware 2-paragraph analysis maps signals to each contact\'s specific pain.' },
  { num: '04', title: 'Email Drafting', desc: 'Under 120 words. Named signal. 1-sentence pitch. Low-friction 15-min CTA.' },
  { num: '05', title: 'Auto Send', desc: 'All emails dispatched via Resend with full delivery log and signal attribution.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'VP Sales, Arclight AI', quote: 'FireReach drafted better cold emails than my best SDR — and did it in 8 seconds.', stars: 5 },
  { name: 'Marcus Webb', role: 'Founder, NeuralPipe', quote: 'The signal-grounding is unreal. Got a reply within 2 hours referencing exactly what they said about funding.', stars: 5 },
  { name: 'Priya Nair', role: 'Head of Growth, DataStack', quote: 'Replaced our 3-person outreach team workflow with a single ICP prompt. Remarkable.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="page">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          <Zap size={14} /> Powered by Groq · Llama 3.3 70B · Resend
        </div>
        <h1 className="hero-title">
          Autonomous B2B Outreach<br />
          <span className="gradient-text">Grounded in Live Signals</span>
        </h1>
        <p className="hero-subtitle">
          FireReach discovers decision-makers, harvests real buying signals, and sends
          hyper-personalized emails — all in one autonomous pipeline. No templates. No hallucinations.
        </p>
        <div className="hero-actions">
          <Link to="/app" className="btn-hero-primary">
            <Play size={18} /> Launch FireReach <ArrowRight size={16} />
          </Link>
          <Link to="/how-it-works" className="btn-hero-secondary">
            See how it works
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat"><span className="stat-val">5-Step</span><span className="stat-label">Autonomous Pipeline</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">0</span><span className="stat-label">Hallucinated Facts</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">&lt;2min</span><span className="stat-label">Full Sequence</span></div>
          <div className="stat-divider" />
          <div className="stat"><span className="stat-val">3x</span><span className="stat-label">Reply Rate vs Templates</span></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-header">
          <div className="section-badge">Core Capabilities</div>
          <h2 className="section-title">Everything an elite SDR does.<br /><span className="gradient-text">Done autonomously.</span></h2>
          <p className="section-subtitle">FireReach executes the full outreach workflow in a strict, ordered pipeline — no shortcuts, no guessing.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - MINI */}
      <section className="section section-dark" id="pipeline">
        <div className="section-header">
          <div className="section-badge">The Pipeline</div>
          <h2 className="section-title">Five steps. <span className="gradient-text">Zero manual work.</span></h2>
        </div>
        <div className="steps-row">
          {steps.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-num">{s.num}</div>
              <h4 className="step-title">{s.title}</h4>
              <p className="step-desc">{s.desc}</p>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/how-it-works" className="btn-hero-secondary">Full Pipeline Breakdown →</Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <div className="section-header">
          <div className="section-badge">Testimonials</div>
          <h2 className="section-title">What teams are <span className="gradient-text">saying</span></h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="stars">{Array(t.stars).fill(0).map((_, si) => <Star key={si} size={14} fill="currentColor" />)}</div>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name[0]}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-badge" style={{ color: '#a5b4fc' }}>Free to try</div>
        <h2 className="cta-title">Start reaching the right buyers<br />with zero guesswork.</h2>
        <p className="cta-sub">Enter a company name and ICP. FireReach handles the rest.</p>
        <Link to="/app" className="btn-hero-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
          <Zap size={18} /> Launch FireReach Free <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
