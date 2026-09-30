import React from 'react';
import { BookOpen, Volume2, MessageSquare } from 'lucide-react';

export function RecentSessions({ courses, sessions, defaultCourse, onNewChat, openSession, onLaunchStudio }) {
  return (
    <div className="right-panel-card">
      <div className="right-panel-header">
        <h4>Recent Discussions</h4>
        <button className="btn-clean-link" onClick={() => onNewChat(defaultCourse)}>+ New</button>
      </div>

      <div className="recent-students-list">
        {sessions.length > 0 ? (
          sessions.slice(0, 4).map((s, idx) => {
            const matched = courses.find(c => c.id === s.course_id);
            const tagLabels = ['Core Notes', 'Exam Prep', 'Lecture Review', 'Assignment'];
            const tag = tagLabels[idx % tagLabels.length];
            const initials = s.title.slice(0, 2).toUpperCase();

            return (
              <div key={s.id} className="student-chat-item" onClick={() => openSession(s)}>
                <div className="student-avatar-wrap">
                  <div className="avatar-chip">{initials}</div>
                </div>

                <div className="student-meta-info">
                  <div className="student-name-row">
                    <strong>{s.title}</strong>
                  </div>
                  <div className="student-course-email">
                    {matched?.name || 'Study Notebook'}
                  </div>
                  <span className="student-role-tag">{tag}</span>
                </div>

                <div className="student-action-icons">
                  <button
                    className="subtle-round-btn"
                    title="Audio Summary"
                    onClick={(e) => { e.stopPropagation(); onLaunchStudio('audio', matched); }}
                  >
                    <Volume2 size={14} />
                  </button>
                  <button
                    className="subtle-round-btn"
                    title="Open Chat"
                    onClick={(e) => { e.stopPropagation(); openSession(s); }}
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-side-note">
            <BookOpen size={20} />
            <p>No recent discussions. Open a notebook to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}
