import React from 'react';
import {
  Code, Brain, Terminal, Atom, Orbit,
  FileText, MessageCircle, MoreVertical, PlusCircle, ArrowRight
} from 'lucide-react';

export function NotebookStudioCard({
  course,
  index,
  sessions,
  onOpen,
  onNewChat,
  onOpenSession,
  onLaunchStudio
}) {
  // Curated theme styles & icons for diverse academic topics with soft pastel tones
  const themes = [
    { class: 'theme-lavender', icon: Code, badge: 'Computer Science' },
    { class: 'theme-sky', icon: Brain, badge: 'Machine Learning' },
    { class: 'theme-rose', icon: Terminal, badge: 'Software & Web' },
    { class: 'theme-mint', icon: Atom, badge: 'Hardware & Systems' },
    { class: 'theme-peach', icon: Orbit, badge: 'Physics & Science' },
  ];

  const currentTheme = themes[index % themes.length];
  const TopicIcon = currentTheme.icon;

  const dateFormatted = sessions.length > 0 && sessions[0].updated_at
    ? new Date(sessions[0].updated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Ready';

  return (
    <div className="notebook-nlm-card" onClick={onOpen}>
      {/* Top row: Pastel Topic Icon Squircle + Category & 3-Dots */}
      <div className="notebook-nlm-card-top">
        <div className={`notebook-icon-circle ${currentTheme.class}`}>
          <TopicIcon size={20} strokeWidth={2} />
        </div>
        <div className="notebook-card-top-right">
          <span className="notebook-category-pill">{currentTheme.badge}</span>
          <button
            className="notebook-menu-dots"
            title="Notebook Options"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="notebook-nlm-body">
        <h4 className="notebook-nlm-title">{course.name}</h4>
        <p className="notebook-nlm-sub">
          {course.description || 'Grounded vector knowledge base with lecture slides and textbooks.'}
        </p>
      </div>

      {/* Card Footer: Sources metadata + Clean Action Pills */}
      <div className="notebook-nlm-card-footer">
        <div className="sources-meta-count">
          <FileText size={13} />
          <span>{dateFormatted}</span>
          <span>·</span>
          <span>{sessions.length} chat{sessions.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="notebook-nlm-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-card-action-mini"
            onClick={onNewChat}
            title="Start new discussion"
          >
            <PlusCircle size={12} /> New Chat
          </button>
          <button
            className="btn-card-action-primary"
            onClick={onOpen}
            title="Open Notebook"
          >
            Open <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

