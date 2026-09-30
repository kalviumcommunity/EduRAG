import React, { useState } from 'react';
import { Gauge, X, EyeOff, Eye, LoaderCircle } from 'lucide-react';
import { api } from '../../api';
import { QuotaResultCard } from '../common/QuotaResultCard';

export function QuotaModal({ token, onClose, currentQuota, onQuotaUpdated }) {
  const [provider, setProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(currentQuota);
  const [error, setError] = useState('');

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
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="studio-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3><Gauge size={19} /> API Key & Quota Monitor</h3>
          <button className="icon-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="modal-lead-copy">
          Verify API keys in real-time, monitor live inference rate limits, and ensure uninterrupted learning sessions.
        </p>

        {error && <div className="notice-banner error" style={{ marginBottom: '14px' }}>{error}</div>}

        <form onSubmit={handleCheck} className="quota-modal-form">
          <div className="input-group">
            <label>AI Provider</label>
            <select
              className="select-dropdown-styled full-w"
              value={provider}
              onChange={e => { setProvider(e.target.value); setError(''); }}
            >
              <option value="groq">Groq (Llama 3.3, Mixtral – Ultra Fast)</option>
              <option value="nvidia">NVIDIA NIM (1,000 Free Credits)</option>
              <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
              <option value="gemini">Google Gemini (AI Studio Free)</option>
              <option value="openrouter">OpenRouter (Router)</option>
            </select>
          </div>

          <div className="input-group">
            <label>API Key</label>
            <div className="relative-input">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={
                  provider === 'groq' ? 'gsk_…' :
                  provider === 'nvidia' ? 'nvapi-…' :
                  provider === 'openai' ? 'sk-proj-…' :
                  provider === 'openrouter' ? 'sk-or-v1-…' : 'AIzaSy…'
                }
              />
              <button type="button" className="password-eye-btn" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="primary-action-btn full-w" disabled={checking || !apiKey.trim()}>
            {checking
              ? <><LoaderCircle size={15} className="spin-icon" /> Checking & Probing Quotas…</>
              : '⚡ Verify API Key'}
          </button>
        </form>

        {checkResult && <QuotaResultCard result={checkResult} />}
      </div>
    </div>
  );
}
