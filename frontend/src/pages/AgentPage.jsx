import React, { useState, useEffect } from 'react';
import {
  Play, Loader2, AlertTriangle, CheckCircle2, Shield,
  Mail, Building, TrendingUp, Search, FileText, Send,
  Link as LinkIcon, Calendar, Activity, XCircle, Copy,
  Users, UserCheck, ChevronRight, Linkedin, CheckSquare,
  Square, Zap, ArrowRight, RefreshCw, Paperclip, X
} from 'lucide-react';
import Navbar from '../components/Navbar';

const ROLE_COLORS = {
  cto: '#3b82f6',
  'vp engineering': '#8b5cf6',
  'head of engineering': '#8b5cf6',
  ciso: '#ef4444',
  'head of security': '#ef4444',
  'vp product': '#10b981',
  default: '#6b7280',
};

function roleColor(role = '') {
  const lower = role.toLowerCase();
  for (const [key, color] of Object.entries(ROLE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return ROLE_COLORS.default;
}

function roleInitial(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function AgentPage() {
  /* ── State ── */
  const [icp, setIcp] = useState('We sell high-end cybersecurity training to Series B startups.');
  const [company, setCompany] = useState('');
  const [diagnostics, setDiagnostics] = useState({ gemini_connected: false, smtp_configured: false, live_search_configured: false, smtp_username: null });
  const [attachments, setAttachments] = useState([]);
  const [senderName, setSenderName] = useState('');
  const [senderCompany, setSenderCompany] = useState('');
  const [senderDesignation, setSenderDesignation] = useState('');

  // Phase 1: discovery
  const [discovering, setDiscovering] = useState(false);
  const [discoveredContacts, setDiscoveredContacts] = useState(null); // null = not yet
  const [discoveryError, setDiscoveryError] = useState(null);
  const [selected, setSelected] = useState(new Set()); // set of indices

  // Phase 2: outreach
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [runError, setRunError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/diagnostics').then(r => r.json()).then(setDiagnostics).catch(() => {});
  }, []);

  /* ── Phase 1: Discover Contacts ── */
  const handleDiscover = async (e) => {
    e.preventDefault();
    if (!company || !icp) return;
    setDiscovering(true);
    setDiscoveredContacts(null);
    setDiscoveryError(null);
    setSelected(new Set());
    setResult(null);
    setRunError(null);
    try {
      const res = await fetch('http://localhost:8000/discover-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, icp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Discovery failed');
      setDiscoveredContacts(data.contacts || []);
      // Pre-select only ICP matches
      const icpMatches = data.contacts?.map((c, i) => c.is_icp_match ? i : -1).filter(i => i !== -1) || [];
      setSelected(new Set(icpMatches));
    } catch (err) {
      setDiscoveryError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  /* ── Phase 2: Run Outreach for Selected ── */
  const handleRunOutreach = async () => {
    const selectedContacts = discoveredContacts.filter((_, i) => selected.has(i));
    if (selectedContacts.length === 0) return;
    setRunning(true);
    setResult(null);
    setRunError(null);
    try {
      const res = await fetch('http://localhost:8000/run-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icp, company, contacts: selectedContacts, attachments, sender_name: senderName, sender_company: senderCompany, sender_designation: senderDesignation })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Pipeline failed');
      setResult(data);
    } catch (err) {
      setRunError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Strip data prefix (e.g., 'data:application/pdf;base64,')
        const base64String = event.target.result.split(',')[1];
        setAttachments(prev => [...prev, {
          filename: file.name,
          mime_type: file.type,
          data_base64: base64String
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSelect = (i) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === discoveredContacts.length) setSelected(new Set());
    else setSelected(new Set(discoveredContacts.map((_, i) => i)));
  };

  const copy = (text) => navigator.clipboard.writeText(text);

  const phase = result ? 3 : discoveredContacts ? 2 : 1;

  return (
    <div className="page">
      <Navbar />
      <div className="app-container">

        <div className="app-page-header">
          <h1 className="app-page-title"><Zap className="brand-icon" size={22} /> FireReach Agent Console</h1>
          <p className="app-page-sub">Discover decision-makers → select your targets → launch personalized outreach.</p>
        </div>

        <div className="dashboard">

          {/* ── LEFT: Strategy Input ── */}
          <div className="panel" style={{ position: 'sticky', top: '80px' }}>
            <div className="panel-header">
              <h2 className="panel-title"><Shield className="brand-icon" size={19} /> Strategy Input</h2>
              <p className="panel-subtitle">Define your ICP and target company.</p>
            </div>

            {/* Connection badges */}
            <div className="diag-row">
              {[
                { label: 'Live Search', active: diagnostics.live_search_configured },
                { label: 'Groq LLM', active: diagnostics.gemini_connected },
                { label: 'SMTP', active: diagnostics.smtp_configured, note: diagnostics.smtp_configured ? `→ ${diagnostics.smtp_username}` : 'not configured' },
              ].map((d, i) => (
                <div className="diag-pill" key={i} title={d.note}>
                  <div className={`status-dot ${d.active ? 'active' : 'inactive'}`} /> {d.label}
                </div>
              ))}
            </div>

            <form onSubmit={handleDiscover}>
              <div className="form-group">
                <label className="form-label">Ideal Customer Profile (ICP)</label>
                <textarea className="form-control" value={icp} onChange={e => setIcp(e.target.value)} placeholder="e.g. We sell cybersecurity training to Series B startups." required rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Company</label>
                <div className="input-wrapper">
                  <Building size={17} className="input-icon" />
                  <input type="text" className="form-control" value={company} onChange={e => { setCompany(e.target.value); setDiscoveredContacts(null); setResult(null); }} placeholder="e.g. Stripe, Notion, Acme Corp" required />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Full Name</label>
                  <input type="text" className="form-control" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. Alex Johnson" required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Your Company Name</label>
                    <input type="text" className="form-control" value={senderCompany} onChange={e => setSenderCompany(e.target.value)} placeholder="e.g. FireReach" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Your Designation</label>
                    <input type="text" className="form-control" value={senderDesignation} onChange={e => setSenderDesignation(e.target.value)} placeholder="e.g. Account Executive" required />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Paperclip size={14} /> Attachments (PDF/PPT)
                </label>
                <div className="input-wrapper" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  <input type="file" multiple accept=".pdf,.ppt,.pptx" onChange={handleFileUpload} style={{ width: '100%', fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                </div>
                {attachments.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {attachments.map((att, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{att.filename}</span>
                        <button type="button" onClick={() => removeAttachment(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={discovering || running} style={{ marginTop: '1rem' }}>
                {discovering
                  ? <><Loader2 size={18} className="spinner" /> Discovering Contacts...</>
                  : discoveredContacts
                    ? <><RefreshCw size={17} /> Re-discover Contacts</>
                    : <><Search size={17} /> Discover Decision Makers</>}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Output ── */}
          <div>

            {/* ─── PHASE 1: Idle ─── */}
            {!discoveredContacts && !discovering && !discoveryError && (
              <div className="panel" style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.55 }}>
                <Users size={52} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No Contacts Yet</h3>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Enter a company name and click "Discover Decision Makers".</p>
              </div>
            )}

            {/* ─── Discovering spinner ─── */}
            {discovering && (
              <div className="panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <Search className="spinner" size={36} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'inline-block' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Searching for decision makers at <strong>{company}</strong>...</p>
              </div>
            )}

            {/* ─── Discovery error ─── */}
            {discoveryError && (
              <div className="banner error" style={{ margin: 0 }}>
                <AlertTriangle size={20} className="banner-icon" />
                <div className="banner-content"><div className="banner-title">Discovery Failed</div><div>{discoveryError}</div></div>
              </div>
            )}

            {/* ─── PHASE 2: Contact Selection ─── */}
            {discoveredContacts && !result && (
              <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 className="panel-title" style={{ marginBottom: '0.2rem' }}>
                      <UserCheck className="brand-icon" size={20} /> Contacts Found — {discoveredContacts.length}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Select who you want to reach. Personalized emails will be drafted per role.
                    </p>
                  </div>
                  <button onClick={toggleAll} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {selected.size === discoveredContacts.length ? <Square size={13} /> : <CheckSquare size={13} />}
                    {selected.size === discoveredContacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  {/* Recommended Contacts */}
                  {discoveredContacts.some(c => c.is_icp_match) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, marginTop: '0.2rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>★ Recommended (ICP Matches)</h3>
                      {discoveredContacts.map((c, i) => {
                        if (!c.is_icp_match) return null;
                        const color = roleColor(c.role);
                        const isSelected = selected.has(i);
                        return (
                          <div key={i} onClick={() => toggleSelect(i)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', border: `1px solid ${isSelected ? color + '55' : 'var(--border-color)'}`, background: isSelected ? color + '10' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.18s ease' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}66, ${color}22)`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: color, flexShrink: 0 }}>
                              {roleInitial(c.name)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.1rem' }}>{c.name}</div>
                              <div style={{ fontSize: '0.8rem', color: color, fontWeight: 600, marginBottom: '0.2rem' }}>{c.role}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={11} /> {c.email}</div>
                            </div>
                            {c.linkedin && (
                              <a href={c.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', padding: '0.25rem' }}><Linkedin size={16} /></a>
                            )}
                            <div style={{ color: isSelected ? color : 'var(--text-tertiary)', flexShrink: 0 }}>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Other Contacts */}
                  {discoveredContacts.some(c => !c.is_icp_match) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '0.5rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Other Discovered Contacts</h3>
                      {discoveredContacts.map((c, i) => {
                        if (c.is_icp_match) return null;
                        const color = roleColor(c.role);
                        const isSelected = selected.has(i);
                        return (
                          <div key={i} onClick={() => toggleSelect(i)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', border: `1px solid ${isSelected ? color + '55' : 'var(--border-color)'}`, background: isSelected ? color + '10' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.18s ease', opacity: 0.85 }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}44, ${color}11)`, border: `2px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: color, flexShrink: 0 }}>
                              {roleInitial(c.name)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.90rem', marginBottom: '0.1rem' }}>{c.name}</div>
                              <div style={{ fontSize: '0.8rem', color: color, fontWeight: 600, marginBottom: '0.2rem' }}>{c.role}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={11} /> {c.email}</div>
                            </div>
                            {c.linkedin && (
                              <a href={c.linkedin} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', padding: '0.25rem' }}><Linkedin size={16} /></a>
                            )}
                            <div style={{ color: isSelected ? color : 'var(--text-tertiary)', flexShrink: 0 }}>
                              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleRunOutreach}
                  disabled={selected.size === 0 || running}
                  className="btn-primary"
                >
                  {running
                    ? <><Loader2 size={18} className="spinner" /> Running Pipeline for {selected.size} contact{selected.size !== 1 ? 's' : ''}...</>
                    : <><Zap size={18} /> Send Outreach to {selected.size} Selected Contact{selected.size !== 1 ? 's' : ''} <ArrowRight size={15} /></>}
                </button>

                {runError && (
                  <div className="banner error" style={{ marginTop: '1rem' }}>
                    <XCircle size={18} className="banner-icon" />
                    <div className="banner-content"><div className="banner-title">Pipeline Error</div><div>{runError}</div></div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Running spinner over contacts ─── */}
            {running && !result && (
              <div className="panel" style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '1rem' }}>
                <Zap className="spinner" size={32} style={{ color: '#f59e0b', marginBottom: '1rem', display: 'inline-block' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Harvesting signals, generating briefs, and drafting emails for <strong>{selected.size}</strong> contact{selected.size !== 1 ? 's' : ''}...</p>
              </div>
            )}

            {/* ─── PHASE 3: Results ─── */}
            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Status Banner */}
                {result.status === 'success'
                  ? <div className="banner success"><CheckCircle2 size={20} className="banner-icon" /><div className="banner-content"><div className="banner-title">Outreach Complete</div><div>{result.outreach_logs?.length} email{result.outreach_logs?.length !== 1 ? 's' : ''} drafted and dispatched.</div></div></div>
                  : <div className="banner error"><XCircle size={20} className="banner-icon" /><div className="banner-content"><div className="banner-title">Pipeline Issue</div><div>{result.message}</div></div></div>
                }

                {/* Send Log Table */}
                {result.outreach_logs?.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <div className="card-header-title"><Send size={15} className="brand-icon" /> Outreach Send Log</div>
                      <span className="badge badge-high">{result.outreach_logs.length} Processed</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                            {['Contact', 'Role', 'Email', 'Status', 'Key Signal'].map(h => (
                              <th key={h} style={{ padding: '0.7rem 1rem', color: 'var(--text-secondary)', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.outreach_logs.map((log, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.7rem 1rem', fontWeight: 600 }}>{log.contact_name}</td>
                              <td style={{ padding: '0.7rem 1rem', color: 'var(--text-secondary)' }}>{log.role}</td>
                              <td style={{ padding: '0.7rem 1rem', color: 'var(--accent-primary)', fontSize: '0.78rem' }}>{log.email}</td>
                              <td style={{ padding: '0.7rem 1rem' }}>
                                <span style={{ color: log.status === 'sent' ? 'var(--success)' : 'var(--error)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>{log.status}</span>
                              </td>
                              <td style={{ padding: '0.7rem 1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.key_signal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Individual Emails */}
                {result.outreach_logs?.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} /> Dispatched Emails
                    </h3>
                    {result.outreach_logs.map((log, i) => {
                      const color = roleColor(log.role);
                      return (
                        <div className="card" key={i} style={{ marginBottom: '1rem', borderLeft: `3px solid ${color}55` }}>
                          <div className="card-header" style={{ background: `${color}08` }}>
                            <div className="card-header-title" style={{ fontSize: '0.88rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${color}25`, border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', color }}>
                                {roleInitial(log.contact_name)}
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>{log.contact_name}</span>
                                <span style={{ color, fontWeight: 500, marginLeft: '0.4rem', fontSize: '0.78rem' }}>({log.role})</span>
                              </div>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', marginLeft: '0.25rem' }}>→ {log.email}</span>
                            </div>
                            <button onClick={() => copy(log.body)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.78rem' }}>
                              <Copy size={12} /> Copy
                            </button>
                          </div>
                          <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Subject:</strong> {log.subject}
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, color: '#1f2937', background: '#fdfcff', padding: '1rem', borderRadius: '8px', fontSize: '0.88rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                              {log.body}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Timeline */}
                {result.timeline && (
                  <div className="card">
                    <div className="card-header"><div className="card-header-title"><Activity size={14} className="brand-icon" /> Execution Trace</div></div>
                    <div className="card-body">
                      {result.timeline.map((item, idx) => {
                        let type = 'active';
                        if (item.toLowerCase().includes('failed') || item.includes('Error') || item.includes('No contacts')) type = 'error';
                        if (item.toLowerCase().includes('successfully') || item.includes('constructed') || item.includes('Found') || item.includes('sent')) type = 'success';
                        return (
                          <div key={idx} className={`timeline-event ${type}`}>
                            <div className="timeline-dot" />
                            <div className="timeline-content">{item}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Signal Summary */}
                {result.harvested_signals?.signals?.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <div className="card-header-title"><TrendingUp size={14} className="brand-icon" /> Live Signals Harvested</div>
                      <span className="badge badge-high">{result.harvested_signals.signals.length}</span>
                    </div>
                    <div className="card-body signal-list">
                      {result.harvested_signals.signals.map((sig, idx) => (
                        <div key={idx} className="signal-item">
                          <div className="signal-header">
                            <div className="signal-title">{sig.summary}</div>
                            <span className={`badge badge-${sig.confidence}`}>{sig.confidence}</span>
                          </div>
                          <div className="signal-meta">
                            <span><TrendingUp size={11} /> {sig.type}</span>
                            <span><Calendar size={11} /> {sig.date}</span>
                            <a href={sig.source_url} target="_blank" rel="noreferrer" className="signal-link"><LinkIcon size={10} /> {sig.source_name}</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Run again */}
                <button onClick={() => { setResult(null); setRunError(null); }} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <RefreshCw size={15} /> Back to Contact Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
