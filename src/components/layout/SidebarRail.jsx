import React from 'react';
import {
  LayoutDashboard, BookOpen, Brain, PlusCircle, LogOut
} from 'lucide-react';

export function SidebarRail({
  page,
  setPage,
  sidebarOpen,
  setSidebarOpen,
  signOut,
  setError
}) {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'My Courses', label: 'My Notebooks', icon: BookOpen },
    { id: 'AI Tutor', label: 'Study Studio', icon: Brain },
    { id: 'Upload Materials', label: 'Upload Materials', icon: PlusCircle },
  ];

  return (
    <aside className={`sidebar-rail${sidebarOpen ? ' open' : ''}`}>
      <div className="sidebar-rail-top">
        <button
          className="logo-squircle"
          onClick={() => { setPage('Dashboard'); setSidebarOpen(false); }}
          title="EduRAG"
        >
          <div className="logo-ring" />
        </button>

        <nav className="nav-icons-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                className={`nav-icon-btn${isActive ? ' active' : ''}`}
                onClick={() => { setPage(item.id); setError(''); setSidebarOpen(false); }}
                title={item.label}
                aria-label={item.label}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
                <span className="nav-mobile-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-rail-bottom">
        <button
          className="nav-icon-btn logout-btn"
          onClick={signOut}
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={17} strokeWidth={2} />
          <span className="nav-mobile-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
