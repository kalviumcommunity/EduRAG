import React, { useState, useEffect } from 'react';
import { api } from './api';
import './style.css';

import { SidebarRail } from './components/layout/SidebarRail';
import { MainHeader } from './components/layout/MainHeader';
import { StudioToolModal } from './components/modals/StudioToolModal';

import { AuthScreen } from './views/AuthScreen';
import { DashboardView } from './views/DashboardView';
import { CoursesView } from './views/CoursesView';
import { NotebookLMWorkspace } from './views/NotebookLMWorkspace';
import { UploadMaterialsView } from './views/UploadMaterialsView';

export function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('edurag_token'));
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('Dashboard'); // 'Dashboard', 'My Courses', 'AI Tutor', 'Upload Materials'
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseDocs, setCourseDocs] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active studio tool modal: null | 'audio' | 'flashcards' | 'quiz' | 'mindmap' | 'studyguide'
  const [activeStudioTool, setActiveStudioTool] = useState(null);

  const loadWorkspace = async (authToken) => {
    const [profile, availableCourses, chatSessions] = await Promise.all([
      api.me(authToken),
      api.courses(authToken),
      api.sessions(authToken)
    ]);
    setUser(profile);
    setCourses(availableCourses);
    const initialCourse = availableCourses.find(c => c.id === course?.id) || availableCourses[0] || null;
    setCourse(initialCourse);
    setSessions(chatSessions);

    if (initialCourse) {
      api.documents(authToken, initialCourse.id).then(setCourseDocs).catch(console.warn);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadWorkspace(token).catch(err => {
      setError(err.message);
      if (err.status === 401) signOut();
    });
  }, [token]);

  // When active course changes, load its documents
  useEffect(() => {
    if (token && course?.id) {
      api.documents(token, course.id).then(setCourseDocs).catch(console.warn);
    } else {
      setCourseDocs([]);
    }
  }, [token, course?.id]);

  function signOut() {
    sessionStorage.removeItem('edurag_token');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setToken(null); setUser(null); setCourses([]); setSessions([]);
    setCourse(null); setSessionId(null); setMessages([]); setPage('Dashboard');
  }

  function selectCourse(item, targetSession = null) {
    setCourse(item);
    if (targetSession) {
      openSession(targetSession);
    } else {
      setSessionId(null);
      setMessages([]);
      setPage('AI Tutor');
      setError('');
    }
    setSidebarOpen(false);
  }

  async function refreshCoursesList() {
    if (!token) return;
    try {
      const updated = await api.courses(token);
      setCourses(updated);
      return updated;
    } catch (err) { console.error('Failed to refresh courses:', err); }
  }

  async function openSession(item) {
    setBusy(true); setError('');
    try {
      const detail = await api.session(token, item.id);
      const matchingCourse = courses.find(e => e.id === detail.course_id);
      if (matchingCourse) setCourse(matchingCourse);
      setSessionId(detail.id);
      setMessages((detail.messages || []).map(m => ({ role: m.role, text: m.content, sources: [] })));
      setPage('AI Tutor');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function startNewChatForCourse(targetCourse = course) {
    if (targetCourse) setCourse(targetCourse);
    setSessionId(null);
    setMessages([]);
    setPage('AI Tutor');
    setError('');
  }

  async function askQuestion(customText = null) {
    const question = (customText || input).trim();
    if (!question || !course || busy) return;
    setInput(''); setError(''); setBusy(true);
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    try {
      const result = await api.ask(token, { course_id: course.id, question, session_id: sessionId });
      setSessionId(result.session_id);
      setMessages(prev => [...prev, { role: 'assistant', text: result.answer, sources: result.sources || [] }]);
      const updatedSessions = await api.sessions(token);
      setSessions(updatedSessions);
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'user' && m.text === question)));
      if (!customText) setInput(question);
    } finally { setBusy(false); }
  }

  if (!token || !user) return (
    <AuthScreen
      onAuthenticated={async (newToken) => {
        sessionStorage.setItem('edurag_token', newToken);
        setError(''); setToken(newToken);
      }}
      error={error}
    />
  );

  return (
    <div className="canvas-wrapper">
      <div className="app-window">
        {/* ── Left Sidebar Navigation Rail ── */}
        <SidebarRail
          page={page}
          setPage={setPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          signOut={signOut}
          setError={setError}
        />

        {/* ── Main Workspace Body ── */}
        <div className="app-main-layout">
          {/* ── Header ── */}
          <MainHeader
            user={user}
            courses={courses}
            sessions={sessions}
            page={page}
            course={course}
            chooseCourse={selectCourse}
            setPage={setPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onSearchSubmit={(text) => {
              if (page !== 'AI Tutor') setPage('AI Tutor');
              askQuestion(text);
            }}
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            signOut={signOut}
          />

          {/* ── Content View Switcher ── */}
          <main className="content-container">
            {error && (
              <div className="notice-banner error" role="alert">
                <span>{error}</span>
                <button onClick={() => setError('')}>×</button>
              </div>
            )}

            {page === 'Dashboard' && (
              <DashboardView
                user={user}
                courses={courses}
                sessions={sessions}
                courseDocs={courseDocs}
                pick={selectCourse}
                onNewChat={startNewChatForCourse}
                openSession={openSession}
                go={setPage}
                onLaunchStudio={(tool, targetCourse) => {
                  if (targetCourse) setCourse(targetCourse);
                  setActiveStudioTool(tool);
                  setPage('AI Tutor');
                }}
                searchQuery={globalSearch}
              />
            )}

            {page === 'My Courses' && (
              <CoursesView
                courses={courses}
                sessions={sessions}
                pick={selectCourse}
                onNewChat={startNewChatForCourse}
                openSession={openSession}
                go={setPage}
              />
            )}

            {page === 'AI Tutor' && (
              <NotebookLMWorkspace
                course={course}
                courses={courses}
                chooseCourse={selectCourse}
                sessions={sessions}
                currentSessionId={sessionId}
                openSession={openSession}
                onNewChat={() => startNewChatForCourse(course)}
                docs={courseDocs}
                messages={messages}
                input={input}
                setInput={setInput}
                ask={() => askQuestion()}
                onAskQuick={askQuestion}
                busy={busy}
                go={setPage}
                onOpenStudioTool={(tool) => setActiveStudioTool(tool)}
              />
            )}

            {page === 'Upload Materials' && (
              <UploadMaterialsView
                token={token}
                courses={courses}
                onCourseAdded={async (newCourse) => {
                  const list = await refreshCoursesList();
                  if (newCourse) {
                    const matched = list?.find(c => c.name === newCourse.name) || newCourse;
                    setCourse(matched);
                  }
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* ── Studio Interactive Modal (Audio Overview, Flashcards, Quiz, Mindmap, Study Guide) ── */}
      {activeStudioTool && (
        <StudioToolModal
          tool={activeStudioTool}
          course={course}
          docs={courseDocs}
          messages={messages}
          onClose={() => setActiveStudioTool(null)}
          onSendPrompt={(prompt) => {
            setActiveStudioTool(null);
            askQuestion(prompt);
          }}
        />
      )}
    </div>
  );
}

export default App;
