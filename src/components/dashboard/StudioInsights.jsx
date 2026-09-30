import React from 'react';
import { MoreHorizontal, Mic, Layers, HelpCircle, Network, CheckCheck } from 'lucide-react';

export function StudioInsights() {
  return (
    <div className="right-panel-card">
      <div className="right-panel-header">
        <h4>Study Tools & Review</h4>
        <button className="icon-subtle-btn" title="Options">
          <MoreHorizontal size={15} />
        </button>
      </div>

      <div className="insights-progress-list">
        <div className="insight-metric-row">
          <div className="insight-icon-pill brand-linkedin"><Mic size={14} /></div>
          <div className="insight-bar-info">
            <div className="insight-label-wrap">
              <span>Audio Discussions</span>
              <strong>60%</strong>
            </div>
            <div className="insight-progress-track">
              <div className="insight-progress-fill w-60" />
            </div>
          </div>
        </div>

        <div className="insight-metric-row">
          <div className="insight-icon-pill brand-glassdoor"><Layers size={14} /></div>
          <div className="insight-bar-info">
            <div className="insight-label-wrap">
              <span>Flashcard Decks</span>
              <strong>85%</strong>
            </div>
            <div className="insight-progress-track">
              <div className="insight-progress-fill w-85" />
            </div>
          </div>
        </div>

        <div className="insight-metric-row">
          <div className="insight-icon-pill brand-monster"><HelpCircle size={14} /></div>
          <div className="insight-bar-info">
            <div className="insight-label-wrap">
              <span>Practice Questions</span>
              <strong>70%</strong>
            </div>
            <div className="insight-progress-track">
              <div className="insight-progress-fill w-70" />
            </div>
          </div>
        </div>

        <div className="insight-metric-row">
          <div className="insight-icon-pill brand-career"><Network size={14} /></div>
          <div className="insight-bar-info">
            <div className="insight-label-wrap">
              <span>Topic Concept Trees</span>
              <strong>45%</strong>
            </div>
            <div className="insight-progress-track">
              <div className="insight-progress-fill w-45" />
            </div>
          </div>
        </div>

        <div className="insight-metric-row">
          <div className="insight-icon-pill brand-zip"><CheckCheck size={14} /></div>
          <div className="insight-bar-info">
            <div className="insight-label-wrap">
              <span>Citations Verified</span>
              <strong>98%</strong>
            </div>
            <div className="insight-progress-track">
              <div className="insight-progress-fill w-98" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
