import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

export function QuotaLimitBar({ quota, onRefresh, onOpenModal }) {
  if (!quota) return null;
  const pct = quota.calculated?.percentage_used;
  const isWarning = pct != null && pct > 80;
  const displayLabel = quota.calculated?.display_label || `${quota.provider} API active`;
  return (
    <div className="quota-bar-pill-box">
      <div className="quota-bar-top">
        <div className="provider-badge">
          <Zap size={13} />
          <span>{quota.provider}</span>
          {quota.tier && <span className="tier-tag">{quota.tier}</span>}
        </div>
        <span className={`status-pill ${quota.status?.toLowerCase()}`}>
          {quota.status === 'VALID' ? '● Active' : quota.status === 'EXHAUSTED' ? '● Limit Hit' : '● Issue'}
        </span>
      </div>
      {pct != null && (
        <div className="progress-bar-track">
          <div className={`progress-bar-fill${isWarning ? ' warning' : ''}`} style={{ width: `${Math.min(100, Math.max(2, pct))}%` }} />
        </div>
      )}
      <div className="quota-bar-footer">
        <span>{displayLabel}</span>
        <div className="quota-bar-actions">
          <button onClick={onRefresh}><RefreshCw size={11} /> Sync</button>
          <button onClick={onOpenModal}>Details →</button>
        </div>
      </div>
    </div>
  );
}
