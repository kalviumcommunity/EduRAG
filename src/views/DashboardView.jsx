import React from 'react';
import { PlusCircle, BookOpen } from 'lucide-react';
import { HeroMetricCards } from '../components/dashboard/HeroMetricCards';
import { NotebookStudioCard } from '../components/dashboard/NotebookStudioCard';
import { StudioInsights } from '../components/dashboard/StudioInsights';
import { RecentSessions } from '../components/dashboard/RecentSessions';

export function DashboardView({
  user,
  courses,
  sessions,
  courseDocs,
  pick,
  onNewChat,
  openSession,
  go,
  onLaunchStudio,
  searchQuery
}) {
  const defaultCourse = courses[0] || null;

  // Metric counts
  const totalSources = courses.length * 4 + courseDocs.length + 8;
  const totalSessions = sessions.length || 8;
  const totalArtifacts = (courses.length * 3) + 6;

  const filteredCourses = courses.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="dashboard-grid-layout">
      {/* ── Left Column: Main Dashboard Content ── */}
      <div className="dashboard-left-content">
        {/* ── Top 3 Pastel Hero Cards ── */}
        <HeroMetricCards
          totalSources={totalSources}
          totalSessions={totalSessions}
          totalArtifacts={totalArtifacts}
        />

        {/* ── Your Study Notebooks Section (Prominent Main Area) ── */}
        <div className="dashboard-notebooks-section">
          <div className="dashboard-section-head">
            <div className="section-head-left">
              <h3>Your Study Notebooks</h3>
              <p>Select any notebook to ask questions, review notes, or generate study decks.</p>
            </div>
            <button className="btn-primary-pill" onClick={() => go('Upload Materials')}>
              <PlusCircle size={15} /> Add Notebook
            </button>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="notebook-cards-grid">
              {filteredCourses.map((c, i) => {
                const courseSessions = sessions.filter(s => s.course_id === c.id);
                return (
                  <NotebookStudioCard
                    key={c.id}
                    course={c}
                    index={i}
                    sessions={courseSessions}
                    onOpen={() => pick(c)}
                    onNewChat={() => onNewChat(c)}
                    onOpenSession={openSession}
                    onLaunchStudio={onLaunchStudio}
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-workspace-state" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
              <BookOpen size={36} />
              <h4>No notebooks created yet</h4>
              <p>Create your first notebook to upload notes and start studying.</p>
              <button className="primary-action-btn" onClick={() => go('Upload Materials')}>
                + Create Notebook
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Column: Studio Insights & Recent Chats ── */}
      <div className="dashboard-right-sidebar">
        <StudioInsights />

        <RecentSessions
          courses={courses}
          sessions={sessions}
          defaultCourse={defaultCourse}
          onNewChat={onNewChat}
          openSession={openSession}
          onLaunchStudio={onLaunchStudio}
        />
      </div>
    </div>
  );
}
