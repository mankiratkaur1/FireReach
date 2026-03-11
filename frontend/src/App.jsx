import React, { useState, useEffect } from 'react';
import { 
  Play, Loader2, AlertTriangle, CheckCircle2, Shield, 
  Briefcase, Mail, Building, TrendingUp, Search, 
  FileText, Send, Link as LinkIcon, Calendar, Activity, XCircle, Copy
} from 'lucide-react';

function App() {
  // Input State
  const [icp, setIcp] = useState('We sell high-end cybersecurity training to Series B startups.');
  const [company, setCompany] = useState('Acme Corp');
  const [email, setEmail] = useState('founder@acme.example.com');
  
  // Execution State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState({
    gemini_connected: false,
    resend_connected: false,
    live_search_configured: false,
    resend_from_email: null
  });

  // Fetch Diagnostics on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/diagnostics')
      .then(res => res.json())
      .then(data => setDiagnostics(data))
      .catch(err => console.error("Failed to load diagnostics:", err));
  }, []);

  const handleRun = async (e) => {
    e.preventDefault();
    if (!icp || !company || !email) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icp, company, recipient_email: email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to connect to backend execution flow.');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Determine Current Step Based on Loading/Results
  let currentStep = 0; // 0 = not started
  if (loading) currentStep = 1;
  if (result) {
    currentStep = 1; // Harvested
    if (result.account_brief || result.status === 'failure') currentStep = 2; // Analyst / Failed early
    if (result.outreach_result || result.status === 'success') currentStep = 3; // Finished
  }

  return (
    <>
      <nav className="navbar">
        <div className="brand">
          <Activity className="brand-icon" size={28} />
          <span className="brand-text">FireReach</span>
        </div>
        <div className="diagnostics-container">
          <div className="diagnostics-pill" title={diagnostics.live_search_configured ? "Tavily/SerpAPI connected" : "Live search tools missing"}>
            <div className={`status-dot ${diagnostics.live_search_configured ? 'active' : 'inactive'}`}></div>
            Live Search
          </div>
          <div className="diagnostics-pill" title={diagnostics.gemini_connected ? "Groq LLM Key Authorized" : "Missing Groq Key"}>
            <div className={`status-dot ${diagnostics.gemini_connected ? 'active' : 'inactive'}`}></div>
            Groq LLM
          </div>
          <div className="diagnostics-pill" title={diagnostics.resend_connected ? `Resend connected as ${diagnostics.resend_from_email}` : "Missing Resend Key"}>
            <div className={`status-dot ${diagnostics.resend_connected ? 'active' : 'inactive'}`}></div>
            Resend Email API
          </div>
        </div>
      </nav>

      <div className="app-container">
        <div className="dashboard">
          
          {/* Left Column: CONTROL PANEL */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title"><Shield className="brand-icon" size={22} /> Strategy Input</h2>
              <p className="panel-subtitle">Define targeting parameters for the autonomous sequence.</p>
            </div>
            
            <form onSubmit={handleRun}>
              <div className="form-group">
                <label className="form-label">Ideal Customer Profile (ICP)</label>
                <textarea 
                  className="form-control" 
                  value={icp} 
                  onChange={(e) => setIcp(e.target.value)}
                  placeholder="e.g. We sell high-end cybersecurity training to Series B startups."
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Target Company</label>
                <div className="input-wrapper">
                  <Building size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-control" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Recipient Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@acme.com"
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <><Loader2 size={20} className="spinner" /> Executing Pipeline...</>
                ) : (
                  <><Play size={20} /> Launch FireReach Sequence</>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: RESULTS & TIMELINE */}
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title"><TrendingUp className="brand-icon" size={22} /> Output Dashboard</h2>
              <p className="panel-subtitle">Live intelligence tracking and outreach results.</p>
            </div>

            {/* Progress Tracker Tracker */}
            <div className="tracker">
              <div className={`tracker-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-icon"><Search size={16} /></div>
                <span className="step-label">Signal Harvest</span>
              </div>
              <div className={`tracker-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-icon"><FileText size={16} /></div>
                <span className="step-label">Account Brief</span>
              </div>
              <div className={`tracker-step ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'completed' : ''}`}>
                <div className="step-icon"><Send size={16} /></div>
                <span className="step-label">Outreach Sent</span>
              </div>
            </div>

            <div className="result-cards">
              
              {/* Errors & Banners */}
              {error && (
                <div className="banner error">
                  <AlertTriangle className="banner-icon" size={24} />
                  <div className="banner-content">
                    <div className="banner-title">Execution Failed</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}
              
              {result && result.status === 'failure' && (
                <div className="banner error">
                  <XCircle className="banner-icon" size={24} />
                  <div className="banner-content">
                    <div className="banner-title">Workflow Aborted</div>
                    <div>{result.message}</div>
                  </div>
                </div>
              )}
              
              {result && result.status === 'success' && (
                <div className="banner success">
                  <CheckCircle2 className="banner-icon" size={24} />
                  <div className="banner-content">
                    <div className="banner-title">Workflow Successful</div>
                    <div>Email successfully crafted and dispatched via Resend.</div>
                  </div>
                </div>
              )}

              {/* Loading State Empty */}
              {loading && !result && (
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <Search className="spinner" size={32} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'inline-block' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Tool 1: Actively traversing public datasets for buyer signals...</p>
                  </div>
                </div>
              )}
              
              {/* Default Empty */}
              {!loading && !result && !error && (
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.6 }}>
                    <Activity size={48} style={{ marginBottom: '1rem', color: 'var(--text-tertiary)' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>Awaiting Instructions</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Fill out the strategy parameters to begin.</p>
                  </div>
                </div>
              )}

              {/* Rendered Results */}
              {result && result.timeline && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-title"><Activity size={18} className="brand-icon" /> Execution Trace</div>
                  </div>
                  <div className="card-body">
                    {result.timeline.map((item, idx) => {
                      let type = 'active';
                      if (item.toLowerCase().includes('failed') || item.includes('Safeguard') || item.includes('Error')) type = 'error';
                      if (item.toLowerCase().includes('successfully') || item.includes('constructed')) type = 'success';
                      return (
                        <div key={idx} className={`timeline-event ${type}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">{item}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Signals */}
              {result && result.harvested_signals?.signals?.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-title"><TrendingUp size={18} className="brand-icon" /> Tool 1: Live Buyer Signals</div>
                    <span className="badge badge-high">{result.harvested_signals.signals.length} Found</span>
                  </div>
                  <div className="card-body signal-list">
                    {result.harvested_signals.signals.map((signal, idx) => (
                      <div key={idx} className="signal-item">
                        <div className="signal-header">
                          <div className="signal-title">{signal.summary}</div>
                          <span className={`badge badge-${signal.confidence}`}>{signal.confidence}</span>
                        </div>
                        <div className="signal-meta">
                          <span><TrendingUp size={14}/> {signal.type} ({signal.value})</span>
                          <span><Calendar size={14}/> {signal.date}</span>
                          <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="signal-link">
                            <LinkIcon size={12}/> {signal.source_name}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brief */}
              {result && result.account_brief && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-title"><Briefcase size={18} className="brand-icon" /> Tool 2: Analyst Account Brief</div>
                  </div>
                  <div className="card-body">
                    <div className="brief-text">{result.account_brief}</div>
                  </div>
                </div>
              )}

              {/* Email Result */}
              {result && result.outreach_result && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-title"><Send size={18} className="brand-icon" /> Tool 3: Automated Sender</div>
                    <button 
                      onClick={() => copyToClipboard(result.outreach_result.body)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                    >
                      <Copy size={16} /> <span style={{fontSize: '0.8rem'}}>Copy Copy</span>
                    </button>
                  </div>
                  <div className="card-body">
                    
                    <div className="email-container">
                      <div className="email-header">
                        <div className="email-header-row">
                          <span className="email-header-label">To:</span> {email}
                        </div>
                        <div className="email-header-row">
                          <span className="email-header-label">From:</span> {diagnostics.resend_from_email || 'onboarding@resend.dev'}
                        </div>
                        <div className="email-header-row">
                          <span className="email-header-label">Subject:</span> {result.outreach_result.subject}
                        </div>
                      </div>
                      <div className="email-body">
                        {result.outreach_result.body}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Provider Status:</span>
                        <strong style={{ color: result.outreach_result.delivery_status === 'sent' ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>
                          {result.outreach_result.delivery_status}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Provider Details:</span>
                        <span>{result.outreach_result.provider_response}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Timestamp:</span>
                        <span>{new Date(result.outreach_result.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
