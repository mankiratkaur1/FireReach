import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Search, Target, FileText, Mail, Send, ArrowRight, CheckCircle2, XCircle, Zap } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <Target size={32} />,
    title: 'Contact Discovery',
    badge: 'Step 1',
    color: '#3b82f6',
    detail: 'FireReach calls the contact discovery tool with your target company. It returns 2–3 key decision makers — prioritizing CTO, VP Engineering, Head of Security, or CISO — with verified email addresses and LinkedIn profiles.',
    rules: [
      'Prioritizes budget-controlling roles',
      'Returns verified email addresses',
      'Stops the sequence if no contacts found',
      'Checks for LinkedIn URLs when available',
    ],
    sample: `Contacts found:\n• Rahul Mahna — CTO — rahul@company.com\n• Priya Kaur — VP Engineering — priya@company.com\n• Amit Sharma — CISO — amit@company.com`,
  },
  {
    num: '02',
    icon: <Search size={32} />,
    title: 'Signal Harvesting',
    badge: 'Step 2',
    color: '#8b5cf6',
    detail: 'The signal harvester queries Tavily and SerpAPI with intelligent news filters targeting funding, hiring, leadership changes, and tech stack shifts. Only real, sourced results are accepted.',
    rules: [
      'Queries TechCrunch, Bloomberg, Forbes, LinkedIn',
      'Detects: funding rounds, hiring surges, leadership changes, expansion',
      'Deduplicates signals by source URL',
      'Never fabricates — if nothing found, reports it clearly',
    ],
    sample: `Signals captured:\n✓ [FUNDING] "Acme Corp raises $14M Series B" — TechCrunch\n✓ [HIRING] "Acme Corp is actively hiring 40+ engineers" — LinkedIn\n✓ [LEADERSHIP] "New CTO appointed at Acme Corp" — Forbes`,
  },
  {
    num: '03',
    icon: <FileText size={32} />,
    title: 'Role-Aware Account Brief',
    badge: 'Step 3',
    color: '#10b981',
    detail: 'The research analyst generates a 2-paragraph account brief per contact. Para 1 explains the company\'s momentum. Para 2 maps the pain directly to the contact\'s role. The CTO brief and the CISO brief for the same company differ completely.',
    rules: [
      'Strictly uses only harvested signals — no invention',
      'Para 1: company signals and momentum',
      'Para 2: role-specific pain mapped to your ICP',
      'Under 150 words per brief',
    ],
    sample: `[For CTO]\nPara 1: Acme just closed a $14M Series B and is scaling engineering aggressively...\nPara 2: As CTO, you'll now own infrastructure decisions for 40+ new engineers...\n\n[For CISO]\nPara 1: Same signal context...\nPara 2: With rapid headcount growth, new attack surfaces emerge daily...`,
  },
  {
    num: '04',
    icon: <Mail size={32} />,
    title: 'Email Draft Generation',
    badge: 'Step 4',
    color: '#f59e0b',
    detail: 'Using the account brief and signals, FireReach drafts one email per contact under 120 words. No templates. Each email opens with a real named signal, connects to the contact\'s specific role-owned pain, pitches the solution in one sentence, and ends with a 15-minute call CTA.',
    rules: [
      'Under 120 words — hard limit',
      'Opens with a specific named signal',
      'One sentence pitch — no feature lists',
      '15-minute call CTA only',
      'Human rhythm — no jargon, no "hope this email finds you well"',
    ],
    sample: `Subject: Congrats on the Series B, Rahul — quick thought\n\nRahul,\n\nCongrats on Acme's $14M raise — scaling 40+ engineers fast is exciting, but it also compresses every security decision. Teams at that inflection point usually find their devs outrunning their security posture.\n\nWe help Series B engineering orgs close that gap in one sprint, not a quarter.\n\nGot 15 minutes this week?\n\n— FireReach`,
  },
  {
    num: '05',
    icon: <Send size={32} />,
    title: 'Automated Delivery',
    badge: 'Step 5',
    color: '#ec4899',
    detail: 'Every email is dispatched via Resend with full metadata attachment. A complete send log is returned: Contact | Role | Email | Status | Key Signal Used. Failed sends are logged but never silently dropped.',
    rules: [
      'Sends via Resend with your configured FROM address',
      'Logs delivery status per contact',
      'Returns: Subject, Body, Status, Provider ID, Timestamp',
      'Signal attribution tracked per send',
    ],
    sample: `Send Log:\n┌─────────────────────────────────────────────────────┐\n│ Contact     │ Role   │ Status │ Key Signal            │\n├─────────────────────────────────────────────────────┤\n│ Rahul Mahna │ CTO    │ SENT   │ $14M Series B raise   │\n│ Priya Kaur  │ VP Eng │ SENT   │ 40+ engineering hires │\n│ Amit Sharma │ CISO   │ SENT   │ Leadership change      │\n└─────────────────────────────────────────────────────┘`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page">
      <Navbar />

      <section className="inner-hero">
        <div className="section-badge">Pipeline Breakdown</div>
        <h1 className="inner-hero-title">How FireReach <span className="gradient-text">Actually Works</span></h1>
        <p className="inner-hero-sub">
          Five deterministic steps. Strict ordering. Zero shortcuts. Every output grounded in real tool responses.
        </p>
      </section>

      <section className="section">
        <div className="hiw-pipeline">
          {steps.map((s, i) => (
            <div className="hiw-step" key={i}>
              <div className="hiw-step-left">
                <div className="hiw-step-num" style={{ color: s.color, borderColor: s.color }}>{s.num}</div>
                {i < steps.length - 1 && <div className="hiw-connector" style={{ background: `linear-gradient(to bottom, ${s.color}, transparent)` }} />}
              </div>
              <div className="hiw-step-card">
                <div className="hiw-step-header">
                  <div className="hiw-step-icon" style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}30` }}>{s.icon}</div>
                  <div>
                    <span className="section-badge" style={{ color: s.color, marginBottom: '0.35rem', display: 'block' }}>{s.badge}</span>
                    <h3 className="hiw-step-title">{s.title}</h3>
                  </div>
                </div>
                <p className="hiw-detail">{s.detail}</p>
                <div className="hiw-rules">
                  {s.rules.map((r, ri) => (
                    <div className="hiw-rule" key={ri}>
                      <CheckCircle2 size={15} style={{ color: s.color, flexShrink: 0 }} /> {r}
                    </div>
                  ))}
                </div>
                <div className="hiw-sample">
                  <div className="hiw-sample-label">Example Output</div>
                  <pre className="hiw-sample-text">{s.sample}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hiw-cta">
          <h3>Ready to run the pipeline?</h3>
          <p>Just provide a company name and ICP. FireReach handles the rest.</p>
          <Link to="/app" className="btn-hero-primary" style={{ display: 'inline-flex' }}>
            <Zap size={16} /> Launch FireReach <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
