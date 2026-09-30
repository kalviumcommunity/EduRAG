import React, { useState } from 'react';
import { EyeOff, Eye, LoaderCircle, BookOpen, Brain, Mic, ShieldCheck, Sparkles, User, Mail, Lock } from 'lucide-react';
import { api } from '../api';

export function AuthScreen({ onAuthenticated, error: appError }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'register') await api.register({ name: name.trim(), email: email.trim(), password });
      const result = await api.login({ email: email.trim(), password });
      await onAuthenticated(result.access_token);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  // Quick fill demo account for convenience
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="auth-canvas">
      <div className="auth-card-floating">
        {/* Left Side: Brand Story & Pastel Feature Cards */}
        <div className="auth-left-brand">
          <div className="auth-logo-badge">
            <div className="logo-ring-lg" />
            <span>EduRAG Workspace</span>
          </div>

          <div className="auth-hero-copy">
            <h2>
              Your Intelligent<br />
              <span className="pastel-highlight">Study & RAG Studio</span>
            </h2>
            <p>
              Upload lecture notes, textbooks, and research papers to generate instant summaries,
              interactive 3D flashcards, two-host audio podcasts, and verifiable answers with exact page citations.
            </p>
          </div>

          {/* Live Study Workspace Showcase Preview */}
          <div className="auth-preview-showcase-card">
            <div className="showcase-top-row">
              <div className="showcase-topic-pill">
                <span className="topic-dot" />
                <span>Web Engineering & AI Systems</span>
              </div>
              <span className="showcase-sources-tag">14 Sources Loaded</span>
            </div>

            <div className="showcase-chat-bubble user-bubble">
              <span>Explain the core architecture and create 5 practice questions</span>
            </div>

            <div className="showcase-chat-bubble ai-bubble">
              <div className="ai-bubble-head">
                <span className="ai-badge-mini">AI Studio</span>
                <span className="citation-tag-mini">✓ Cited from L3 Slide 12</span>
              </div>
              <p>Architecture synthesizes FastAPI vector pipelines with React frontend and real-time grounding.</p>
            </div>

            {/* Quick Tools Badge Row */}
            <div className="showcase-tools-pills-row">
              <span className="tool-chip-mini">🎙️ Audio Podcast</span>
              <span className="tool-chip-mini">🗂️ 3D Flashcards</span>
              <span className="tool-chip-mini">❓ Self-Quiz</span>
              <span className="tool-chip-mini">🧠 Mind Map</span>
            </div>
          </div>

          <div className="auth-stats-bar-bottom">
            <div className="auth-stat-item">
              <strong>100%</strong>
              <span>Grounded</span>
            </div>
            <div className="auth-stat-item">
              <strong>98%</strong>
              <span>Accuracy</span>
            </div>
            <div className="auth-stat-item">
              <strong>Instant</strong>
              <span>Synthesis</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Modern Form */}
        <div className="auth-right-form">
          <div className="auth-form-top-nav">
            <div className="auth-segmented-pill">
              <button
                type="button"
                className={`auth-segment-btn${mode === 'login' ? ' active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-segment-btn${mode === 'register' ? ' active' : ''}`}
                onClick={() => { setMode('register'); setError(''); }}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="auth-form-head">
            <h3>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h3>
            <p>
              {mode === 'login'
                ? 'Enter your credentials to access your course notebooks.'
                : 'Join EduRAG and start studying with intelligent grounded AI.'}
            </p>
          </div>

          {(error || appError) && (
            <div className="notice-banner error" role="alert">
              <span>{error || appError}</span>
              <button onClick={() => setError('')}>×</button>
            </div>
          )}

          <form onSubmit={submit} className="auth-form-fields">
            {mode === 'register' && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input
                    required minLength={2} autoComplete="name"
                    placeholder="e.g. Vedant Sharma"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  required type="email" autoComplete="email"
                  placeholder="vedant@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  required type={showPwd ? 'text' : 'password'}
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="password-eye-btn" onClick={() => setShowPwd(!showPwd)} title="Toggle visibility">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button className="primary-action-btn full-w auth-submit-btn" disabled={busy}>
              {busy
                ? <><LoaderCircle size={15} className="spin-icon" /> Authenticating…</>
                : mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          {mode === 'login' && (
            <div className="auth-demo-hint">
              <span>Quick Login:</span>
              <button
                type="button"
                className="demo-account-chip"
                onClick={() => fillDemo('alex@test.com', 'password123')}
              >
                Alex Vance (alex@test.com)
              </button>
            </div>
          )}

          <div className="auth-footer-toggle">
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
            {' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

