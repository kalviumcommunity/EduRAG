import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, X, Search, Bell, Sparkles, Mic, ChevronDown, Check,
  BookOpen, Brain, PlusCircle, LogOut, User, ShieldCheck, FileText, Code, Terminal, Atom, Orbit
} from 'lucide-react';

export function MainHeader({
  user,
  courses,
  sessions,
  page,
  course,
  chooseCourse,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  globalSearch,
  setGlobalSearch,
  onSearchSubmit,
  notificationsOpen,
  setNotificationsOpen,
  signOut
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [subjectSwitcherOpen, setSubjectSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');

  const profileRef = useRef(null);
  const switcherRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setSubjectSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const firstName = user.name?.split(' ')?.[0] || 'there';
    return `${g}, ${firstName}`;
  };

  const themes = [
    { class: 'theme-lavender', icon: Code },
    { class: 'theme-sky', icon: Brain },
    { class: 'theme-rose', icon: Terminal },
    { class: 'theme-mint', icon: Atom },
    { class: 'theme-peach', icon: Orbit },
  ];

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  return (
    <header className="main-header">
      <div className="header-greeting-wrap">
        <button
          className="mobile-hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {page === 'Dashboard' ? (
          <div className="greeting-text">
            <h1 className="greeting-title">{getGreeting()}</h1>
            <p className="greeting-sub">
              {courses.length} active notebook{courses.length !== 1 ? 's' : ''} · {sessions.length} discussion{sessions.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : page === 'My Courses' ? (
          <div className="greeting-text">
            <h1 className="greeting-title">My Notebooks</h1>
            <p className="greeting-sub">
              {courses.length} course notebook{courses.length !== 1 ? 's' : ''} with vector knowledge bases
            </p>
          </div>
        ) : page === 'AI Tutor' ? (
          <div className="greeting-text">
            <div className="header-breadcrumb" ref={switcherRef}>
              <span className="breadcrumb-link" onClick={() => setPage('My Courses')}>Notebooks</span>
              <span className="breadcrumb-separator">/</span>

              {/* ── Interactive Subject Switcher Pill ── */}
              <div className="subject-switcher-container">
                <button
                  className={`breadcrumb-switcher-btn${subjectSwitcherOpen ? ' active' : ''}`}
                  onClick={() => setSubjectSwitcherOpen(!subjectSwitcherOpen)}
                  title="Switch notebook"
                >
                  <span className="current-course-label">{course?.name || 'Select Notebook'}</span>
                  <ChevronDown size={14} className={`switcher-chevron${subjectSwitcherOpen ? ' open' : ''}`} />
                </button>

                {subjectSwitcherOpen && (
                  <div className="subject-switcher-dropdown">
                    <div className="switcher-dropdown-header">
                      <span>Switch Notebook</span>
                      <small>{courses.length} total</small>
                    </div>

                    <div className="switcher-search-box">
                      <Search size={13} />
                      <input
                        placeholder="Search notebooks…"
                        value={switcherSearch}
                        onChange={e => setSwitcherSearch(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="switcher-courses-list">
                      {filteredCourses.map((c, idx) => {
                        const theme = themes[idx % themes.length];
                        const Icon = theme.icon;
                        const isSelected = course?.id === c.id;
                        return (
                          <div
                            key={c.id}
                            className={`switcher-course-item${isSelected ? ' selected' : ''}`}
                            onClick={() => {
                              chooseCourse(c);
                              setSubjectSwitcherOpen(false);
                            }}
                          >
                            <div className={`switcher-icon-circle ${theme.class}`}>
                              <Icon size={14} />
                            </div>
                            <div className="switcher-course-info">
                              <strong>{c.name}</strong>
                              <small>{sessions.filter(s => s.course_id === c.id).length} discussions</small>
                            </div>
                            {isSelected && <Check size={15} className="switcher-check-icon" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="switcher-dropdown-footer">
                      <button
                        className="switcher-add-btn"
                        onClick={() => {
                          setSubjectSwitcherOpen(false);
                          setPage('Upload Materials');
                        }}
                      >
                        <PlusCircle size={13} /> + Create New Notebook
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="greeting-text">
            <h1 className="greeting-title">Add Knowledge Sources</h1>
            <p className="greeting-sub">Upload textbooks, lecture PDFs, and notes to your notebooks</p>
          </div>
        )}
      </div>

      <div className="header-right-tools">
        {/* Search Pill */}
        <div className="header-search-pill">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes, textbooks, or topics..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && globalSearch.trim()) {
                onSearchSubmit(globalSearch.trim());
              }
            }}
          />
        </div>

        {/* Notification Bell */}
        <div className="notification-wrap">
          <button
            className="header-circle-btn"
            title="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell size={16} />
            <span className="bell-badge-dot" />
          </button>
          {notificationsOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span>Updates</span>
                <small>All caught up</small>
              </div>
              <div className="notifications-item">
                <div className="notif-icon-circle"><Sparkles size={14} /></div>
                <div className="notif-content">
                  <strong>Course Indexing Ready</strong>
                  <p>All documents are indexed and ready for search & questioning.</p>
                </div>
              </div>
              <div className="notifications-item">
                <div className="notif-icon-circle"><Mic size={14} /></div>
                <div className="notif-content">
                  <strong>Audio Podcasts Available</strong>
                  <p>Listen to generated audio overviews for any of your courses.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Interactive Menu */}
        <div className="header-user-pill-wrap" ref={profileRef}>
          <div
            className={`header-user-pill${profileOpen ? ' active' : ''}`}
            onClick={() => setProfileOpen(!profileOpen)}
            title="Your Profile & Settings"
          >
            <div className="user-avatar-circle">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={14} className={`user-chevron${profileOpen ? ' open' : ''}`} />
          </div>

          {profileOpen && (
            <div className="user-profile-dropdown">
              {/* Profile Card Header */}
              <div className="profile-dropdown-head">
                <div className="profile-head-avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="profile-head-info">
                  <h4>{user.name || 'Scholar'}</h4>
                  <p>{user.email || 'student@university.edu'}</p>
                  <span className="profile-status-badge">
                    <span className="status-online-dot" /> Grounded RAG Workspace
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="profile-stats-grid">
                <div className="profile-stat-box">
                  <strong>{courses.length}</strong>
                  <span>Notebooks</span>
                </div>
                <div className="profile-stat-box">
                  <strong>{sessions.length}</strong>
                  <span>Discussions</span>
                </div>
                <div className="profile-stat-box">
                  <strong>98%</strong>
                  <span>Grounded Citations</span>
                </div>
              </div>

              {/* Nav Options */}
              <div className="profile-dropdown-links">
                <button
                  className="profile-link-item"
                  onClick={() => { setProfileOpen(false); setPage('My Courses'); }}
                >
                  <BookOpen size={15} />
                  <span>My Study Notebooks</span>
                </button>
                <button
                  className="profile-link-item"
                  onClick={() => { setProfileOpen(false); setPage('Upload Materials'); }}
                >
                  <PlusCircle size={15} />
                  <span>Upload Course Documents</span>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="profile-dropdown-footer">
                <button
                  className="profile-signout-btn"
                  onClick={() => {
                    setProfileOpen(false);
                    signOut();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

