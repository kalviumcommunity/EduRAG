import React from 'react';
import { FileText, MessageSquare, Layers, TrendingUp } from 'lucide-react';

export function HeroMetricCards({ totalSources, totalSessions, totalArtifacts }) {
  return (
    <div className="hero-metrics-row">
      {/* Card 1: Soft Lavender */}
      <div className="hero-metric-card pastel-lavender">
        <div className="hero-card-header">
          <span className="hero-card-title">Course Documents</span>
          <div className="hero-card-icon-badge">
            <FileText size={16} />
          </div>
        </div>

        <div className="hero-card-body">
          <div className="hero-card-metric">+{totalSources}</div>
          <div className="hero-trend-pill positive">
            <TrendingUp size={12} /> 24% <span className="trend-label">this week</span>
          </div>
        </div>

        {/* Stylized textured column visual */}
        <div className="decorative-chart lavender-pattern">
          <div className="pattern-col h-55 patterned-stripes" />
          <div className="pattern-col h-75 patterned-crosshatch" />
          <div className="pattern-col h-40 patterned-stripes" />
          <div className="pattern-col h-90 patterned-dots" />
          <div className="pattern-col h-60 patterned-stripes" />
        </div>
      </div>

      {/* Card 2: Soft Sky Blue */}
      <div className="hero-metric-card pastel-sky">
        <div className="hero-card-header">
          <span className="hero-card-title">Questions & Chats</span>
          <div className="hero-card-icon-badge">
            <MessageSquare size={16} />
          </div>
        </div>

        <div className="hero-card-body">
          <div className="hero-card-metric">+{totalSessions}</div>
          <div className="hero-trend-pill neutral">
            <span className="trend-label" style={{ margin: 0, fontWeight: 700 }}>Active discussions</span>
          </div>
        </div>

        {/* Stylized solid dark & gradient vertical bars */}
        <div className="decorative-chart sky-solid-bars">
          <div className="solid-bar h-35" />
          <div className="solid-bar h-80" />
          <div className="solid-bar h-50" />
          <div className="solid-bar h-95" />
          <div className="solid-bar h-65" />
        </div>
      </div>

      {/* Card 3: Soft Blush Pink */}
      <div className="hero-metric-card pastel-rose">
        <div className="hero-card-header">
          <span className="hero-card-title">Study Tools Created</span>
          <div className="hero-card-icon-badge">
            <Layers size={16} />
          </div>
        </div>

        <div className="hero-card-body">
          <div className="hero-card-metric">+{totalArtifacts}</div>
          <div className="hero-trend-pill positive">
            <TrendingUp size={12} /> 30% <span className="trend-label">this week</span>
          </div>
        </div>

        {/* Stylized textured hatch column bars */}
        <div className="decorative-chart rose-stripes">
          <div className="rose-col h-60 patterned-stripes-rose" />
          <div className="rose-col h-45 patterned-stripes-rose" />
          <div className="rose-col h-70 patterned-stripes-rose" />
          <div className="rose-col h-90 patterned-stripes-rose" />
          <div className="rose-col h-100 patterned-stripes-rose" />
        </div>
      </div>
    </div>
  );
}
