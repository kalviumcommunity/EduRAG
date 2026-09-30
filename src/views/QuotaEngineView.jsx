import React, { useState, useEffect } from 'react';
import { EyeOff, Eye, LoaderCircle, Zap } from 'lucide-react';
import { api } from '../api';
import { QuotaResultCard } from '../components/common/QuotaResultCard';

export function QuotaEngineView({ token, currentQuota, onQuotaUpdated }) {
  const [provider, setProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(currentQuota);
  const [publishedLimits, setPublishedLimits] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.publishedLimits(token).then(setPublishedLimits).catch(console.warn);
  }, [token]);

  const handleCheck = async (e) => {
    e?.preventDefault();
    if (!apiKey.trim()) { setError('Please paste an API key.'); return; }
    setChecking(true); setError('');
    try {
      const res = await api.checkQuota({ provider, api_key: apiKey.trim(), bypass_cache: true });
      setCheckResult(res);
      if (onQuotaUpdated) onQuotaUpdated();
    } catch (err) { setError(err.message); }
    finally { setChecking(false); }
  };

  return (
    <div className="subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h2>API Key & Quota Engine</h2>
          <p>Verify keys in real-time, extract live quota headers, and compare published rate limits.</p>
        </div>
      </div>

      {error && <div className="notice-banner error">{error}</div>}

      <div className="quota-2col-layout">
        <div className="quota-form-card">
          <h4>Test Key / Quota Probe</h4>

          <form onSubmit={handleCheck} className="quota-form-body">
            <div className="input-group">
              <label>Provider</label>
              <select
                className="select-dropdown-styled full-w"
                value={provider}
                onChange={e => setProvider(e.target.value)}
              >
                <option value="groq">Groq (Ultra-fast Inference)</option>
                <option value="nvidia">NVIDIA NIM (Free Sandbox)</option>
                <option value="openai">OpenAI (GPT-4o, mini)</option>
                <option value="gemini">Google Gemini (AI Studio)</option>
                <option value="openrouter">OpenRouter (Aggregator)</option>
              </select>
            </div>

            <div className="input-group">
              <label>API Key</label>
              <div className="relative-input">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={`Paste ${provider.toUpperCase()} key…`}
                />
                <button type="button" className="password-eye-btn" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="primary-action-btn full-w" disabled={checking || !apiKey.trim()}>
              {checking ? <><LoaderCircle size={15} className="spin-icon" /> Probing Quota Headers…</> : '⚡ Check API Key'}
            </button>
          </form>
        </div>

        <div>
          {checkResult ? (
            <QuotaResultCard result={checkResult} />
          ) : (
            <div className="empty-workspace-state">
              <Zap size={28} />
              <h4>No probe results yet</h4>
              <p>Select a provider and enter a key to test authentication and quota limits.</p>
            </div>
          )}
        </div>
      </div>

      {publishedLimits.length > 0 && (
        <div className="published-catalog-wrap">
          <div className="catalog-head">
            <h4>Verified Provider Limits Catalog</h4>
            <p>Documented quotas and rate limits across free developer tiers.</p>
          </div>

          <div className="published-limits-grid-cards">
            {publishedLimits.map(item => (
              <div key={item.id} className="published-limit-pill-card">
                <div className="catalog-pill-top">
                  <strong>{item.provider}</strong>
                  <span className="badge-tier">{item.tier}</span>
                </div>
                <div className="catalog-pill-val">{item.limit_value?.toLocaleString()} {item.unit}</div>
                <div className="catalog-pill-meta">Window: <b>{item.window}</b> · Verified: <b>{item.last_verified_at}</b></div>
                {item.notes && <div className="catalog-pill-notes">{item.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
