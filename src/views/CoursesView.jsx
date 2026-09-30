import React from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';
import { NotebookStudioCard } from '../components/dashboard/NotebookStudioCard';

export function CoursesView({ courses, sessions, pick, onNewChat, openSession, go }) {
  return (
    <div className="subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h2>My Notebooks</h2>
          <p>Organize, question, and review course materials with grounded AI assistance.</p>
        </div>
        <button className="primary-action-btn" onClick={() => go('Upload Materials')}>
          <PlusCircle size={15} /> + New Notebook
        </button>
      </div>

      {courses.length ? (
        <div className="notebook-cards-grid">
          {courses.map((item, idx) => (
            <NotebookStudioCard
              key={item.id}
              course={item}
              index={idx}
              sessions={sessions.filter(s => s.course_id === item.id)}
              onOpen={() => pick(item)}
              onNewChat={() => onNewChat(item)}
              onOpenSession={openSession}
            />
          ))}
        </div>
      ) : (
        <div className="empty-workspace-state">
          <BookOpen size={36} />
          <h3>No notebooks yet</h3>
          <p>Add your first course and upload notes or PDFs to get started.</p>
          <button className="primary-action-btn" onClick={() => go('Upload Materials')}>
            + New Notebook
          </button>
        </div>
      )}
    </div>
  );
}

