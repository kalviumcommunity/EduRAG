import React from 'react';

export function QuotaResultCard({ result }) {
  if (!result) return null;
  const isValid = result.valid;
  const isExhausted = result.status === 'EXHAUSTED';
  return (
    <div className="quota-result-card">
      <div className="result-card-top">
        <span className="result-provider-title">{result.provider}</span>
        <span className={`status-pill ${result.status?.toLowerCase()}`}>
          {isValid ? '🟢 VALID' : isExhausted ? '⚠️ EXHAUSTED' : '🔴 INVALID'}
        </span>
      </div>

      {result.fingerprint && result.fingerprint !== 'none' && (
        <div className="fingerprint-row">
          Fingerprint: <code>{result.fingerprint}</code>
          {result.cached && <span className="cached-badge">⚡ Cached</span>}
        </div>
      )}

      {result.error_message && (
        <div className="error-callout">
          <strong>{result.error_code || 'Error'}:</strong> {result.error_message}
        </div>
      )}

      <div className="quota-section-block">
        <div className="section-label-tag">
          <span className="live-tag">LIVE</span> Real-time from provider
        </div>
        {Object.keys(result.live || {}).length > 0 ? (
          <div className="quota-metrics-3grid">
            {result.live.tokens && (
              <div className="quota-stat-box">
                <small>Remaining Tokens</small>
                <strong>{result.live.tokens.remaining != null ? result.live.tokens.remaining.toLocaleString() : 'N/A'}</strong>
              </div>
            )}
            {result.live.requests && (
              <div className="quota-stat-box">
                <small>Remaining Req.</small>
                <strong>{result.live.requests.remaining != null ? result.live.requests.remaining.toLocaleString() : 'N/A'}</strong>
              </div>
            )}
            {result.live.credits && (
              <div className="quota-stat-box">
                <small>Credits Left</small>
                <strong>{result.live.credits.remaining != null ? `${result.live.credits.remaining.toLocaleString()} cr` : 'Unlimited'}</strong>
              </div>
            )}
          </div>
        ) : (
          <p className="no-headers-note">Provider does not broadcast real-time quota headers.</p>
        )}
      </div>

      {result.calculated && (
        <div className="quota-section-block">
          <div className="section-label-tag">Usage Summary</div>
          <p className="summary-label">{result.calculated.display_label}</p>
          {result.calculated.percentage_used != null && (
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(2, result.calculated.percentage_used))}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
