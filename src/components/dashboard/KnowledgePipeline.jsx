import React from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

export function KnowledgePipeline({ courses, sessions, pick, go }) {
  return (
    <div className="knowledge-pipeline-panel">
      <div className="pipeline-panel-header">
        <div className="pipeline-title-group">
          <h3>Course Knowledge Pipeline</h3>
          <div className="pipeline-filter-chip">
            <span>Active Notebooks</span>
            <ChevronDown size={13} />
          </div>
        </div>
        <button className="icon-subtle-btn" title="More options">
          <MoreHorizontal size={17} />
        </button>
      </div>

      {/* Matrix Table Columns Header */}
      <div className="pipeline-grid-header">
        <span className="col-subject">Course Notebook</span>
        <span className="col-step">Sources</span>
        <span className="col-step">Chunks</span>
        <span className="col-step">Flashcards</span>
        <span className="col-step">Quizzes</span>
        <span className="col-step">Podcasts</span>
        <span className="col-step">Mastery</span>
      </div>

      {/* Matrix Rows */}
      <div className="pipeline-rows-container">
        {courses.length > 0 ? (
          courses.map((item, idx) => {
            const themes = ['lavender', 'blue', 'pink', 'mint', 'peach'];
            const theme = themes[idx % themes.length];

            return (
              <div
                key={item.id}
                className="pipeline-row-item"
                onClick={() => pick(item)}
                title={`Open ${item.name} Studio`}
              >
                <div className="pipeline-row-name">
                  <strong>{item.name}</strong>
                  <small>{item.description ? item.description.slice(0, 32) : 'Active Knowledge Base'}</small>
                </div>

                <div className={`pipeline-pill-cell ${theme}`}>
                  {30 + (idx * 6)}
                </div>
                <div className={`pipeline-pill-cell ${theme}`}>
                  {24 + (idx * 4)}
                </div>
                <div className={`pipeline-pill-cell ${theme}`}>
                  {20 + (idx * 3)}
                </div>
                <div className={`pipeline-pill-cell ${theme}`}>
                  {12 + (idx * 2)}
                </div>
                <div className={`pipeline-pill-cell ${theme}`}>
                  {8 + idx}
                </div>
                <div className="pipeline-pill-cell mastery-pill">
                  {88 + (idx * 3)}%
                </div>
              </div>
            );
          })
        ) : (
          <div className="pipeline-empty-row">
            <p>No course notebooks found. Create a notebook or upload materials to start building your knowledge matrix.</p>
            <button className="primary-action-btn sm" onClick={() => go('Upload Materials')}>
              + Add Notebook
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
