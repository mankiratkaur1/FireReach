import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle2, Zap, ArrowRight, Star } from 'lucide-react';

const plans = [
  {
    name: 'Prototype',
    price: 'Free',
    period: '',
    desc: 'Set up locally and run unlimited sequences. Perfect for demos and evaluation.',
    badge: null,
    color: '#6b7280',
    features: [
      'Full 5-step autonomous pipeline',
      'Contact discovery via Groq LLM',
      'Live signal harvesting (Tavily/SerpAPI)',
      'Role-aware account brief generation',
      'Email drafting + Resend delivery',
      'Execution trace & send log',
      'Self-hosted on your machine',
    ],
    cta: 'Get Started Free',
    ctaLink: '/app',
    outline: true,
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    desc: 'For sales teams running outreach at scale with verified contact data and analytics.',
    badge: 'Most Popular',
    color: '#3b82f6',
    features: [
      'Everything in Prototype',
      'Apollo / ZoomInfo contact enrichment',
      'Verified email sourcing (bounce <2%)',
      'Multi-company batch runs',
      'CRM integration (HubSpot / Salesforce)',
      'Signal history dashboard',
      'Email reply tracking',
      'Priority Groq API throughput',
    ],
    cta: 'Start Growth →',
    ctaLink: '/app',
    outline: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'White-glove deployment, dedicated infrastructure, and custom signal sources.',
    badge: null,
    color: '#8b5cf6',
    features: [
      'Everything in Growth',
      'Custom signal source integration',
      'BYO LLM (OpenAI, Gemini, Claude)',
      'On-premise / VPC deployment',
      'SOC 2 Type II compliance',
      'Dedicated success manager',
      'SLA guarantees & 24/7 support',
      'Custom domain email routing',
    ],
    cta: 'Contact Sales →',
    ctaLink: '/app',
    outline: true,
  },
];

const faqs = [
  { q: 'Does FireReach hallucinate signals?', a: 'Never. Every signal must be returned by a live tool call (Tavily or SerpAPI). If the tool returns nothing, FireReach clearly flags it as signal-sparse and proceeds with a curiosity-based approach.' },
  { q: 'What email API does it use?', a: 'FireReach sends via Resend. In sandbox mode, emails are routed to your verified address. Verify a domain at resend.com/domains to send to any recipient.' },
  { q: 'Can I use my own API keys?', a: 'Yes. The .env file accepts GROQ_API_KEY, RESEND_API_KEY, TAVILY_API_KEY, and SERPAPI_KEY. Bring your own keys and run the stack locally.' },
  { q: 'How long does one full run take?', a: 'Typically 45–90 seconds end-to-end for 3 contacts. Contact discovery, signal harvest, 3x brief generation, 3x email drafting, and 3x sends.' },
  { q: 'Is the outreach actually personalized or just merge-tag spam?', a: 'Genuinely personalized. Each email references a real, named signal specific to the company, connected to the concrete responsibilities of that contact\'s role. The CTO and CISO email for the same company will be completely different.' },
];

export default function PricingPage() {
  return (
    <div className="page">
      <Navbar />

      <section className="inner-hero">
        <div className="section-badge">Pricing</div>
        <h1 className="inner-hero-title">Simple, <span className="gradient-text">transparent</span> pricing</h1>
        <p className="inner-hero-sub">
          Start free with the open-source prototype. Scale when you need verified contacts and CRM sync.
        </p>
      </section>

      {/* Plans */}
      <section className="section">
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div className={`pricing-card ${!plan.outline ? 'pricing-card-featured' : ''}`} key={i} style={{ '--plan-color': plan.color }}>
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                <span className="price-val">{plan.price}</span>
                {plan.period && <span className="price-period">{plan.period}</span>}
              </div>
              <p className="pricing-desc">{plan.desc}</p>
              <div className="pricing-divider" />
              <ul className="pricing-features">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="pricing-feature">
                    <CheckCircle2 size={15} style={{ color: plan.color, flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaLink}
                className={plan.outline ? 'pricing-cta-outline' : 'pricing-cta-filled'}
                style={{ borderColor: plan.color, color: plan.outline ? plan.color : '#fff', background: plan.outline ? 'transparent' : plan.color }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="section section-dark">
        <div className="section-header">
          <div className="section-badge">FAQ</div>
          <h2 className="section-title">Common <span className="gradient-text">Questions</span></h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q">{faq.q}</div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="section-badge" style={{ color: '#a5b4fc' }}>No credit card needed</div>
        <h2 className="cta-title">Run your first sequence free.</h2>
        <p className="cta-sub">Deploy locally in under 5 minutes. Full pipeline. No limits.</p>
        <Link to="/app" className="btn-hero-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
          <Zap size={18} /> Launch FireReach Free <ArrowRight size={16} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
