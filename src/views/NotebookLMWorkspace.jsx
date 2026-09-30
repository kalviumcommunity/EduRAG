import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, PlusCircle, Search, MessageCircle, BookOpen, Send,
  LoaderCircle, Layers, HelpCircle, Network, FileCheck, Mic
} from 'lucide-react';
import { MarkdownMessage } from '../components/common/MarkdownMessage';

export function NotebookLMWorkspace({
  course,
  courses,
  chooseCourse,
  sessions,
  currentSessionId,
  openSession,
  onNewChat,
  docs,
  messages,
  input,
  setInput,
  ask,
  onAskQuick,
  busy,
  go,
  onOpenStudioTool
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const chatRef = useRef(null);

  const courseSessions = sessions.filter(s => s.course_id === course?.id);

  useEffect(() => {
    const map = {};
    docs.forEach(d => { map[d.id] = true; });
    setSelectedDocs(map);
    setSelectAll(true);
  }, [docs]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, busy]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const map = {};
    docs.forEach(d => { map[d.id] = checked; });
    setSelectedDocs(map);
  };

  const toggleDoc = (id) => {
    setSelectedDocs(prev => {
      const next = { ...prev, [id]: !prev[id] };
      const allSelected = docs.length > 0 && docs.every(d => next[d.id]);
      setSelectAll(allSelected);
      return next;
    });
  };

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.file_name && d.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSelectedCount = docs.filter(d => selectedDocs[d.id]).length;

  if (!course) {
    return (
      <div className="empty-workspace-state">
        <BookOpen size={36} />
        <h3>No notebook selected</h3>
        <p>Select or create a course notebook to start reviewing.</p>
        <button className="primary-action-btn" onClick={() => go('Upload Materials')}>
          Upload Materials
        </button>
      </div>
    );
  }

  return (
    <div className="notebooklm-3col-workspace">
      {/* ── Col 1: Sources & Notebook Chats ── */}
      <div className="workspace-col sources-panel">
        <div className="panel-top-title">
          <div className="title-left">
            <FileText size={16} />
            <span>Documents</span>
            <span className="count-badge">{docs.length}</span>
          </div>
          <button className="btn-add-mini" onClick={() => go('Upload Materials')}>
            <PlusCircle size={13} /> Add
          </button>
        </div>

        {/* Search sources */}
        <div className="sources-search-wrap">
          <Search size={13} />
          <input
            placeholder="Search documents…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Select all toggle bar */}
        <div className="sources-selection-bar">
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={e => handleSelectAll(e.target.checked)}
            />
            <span>Select all</span>
          </label>
          <span className="selected-stat">{activeSelectedCount} selected</span>
        </div>

        {/* Sources scroll list */}
        <div className="sources-scroll-container">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, idx) => (
              <label key={doc.id} className="source-checkbox-item">
                <input
                  type="checkbox"
                  checked={!!selectedDocs[doc.id]}
                  onChange={() => toggleDoc(doc.id)}
                />
                <div className="source-row-info">
                  <div className="source-title-text" title={doc.title}>
                    {idx + 1}. {doc.title}
                  </div>
                  <div className="source-sub-meta">
                    <span className="doc-badge">{doc.document_type?.slice(0, 7)}</span>
                    <span className="doc-fn">{doc.file_name || 'Material'}</span>
                  </div>
                </div>
              </label>
            ))
          ) : (
            <div className="empty-sources-msg">
              {docs.length === 0 ? 'No documents uploaded yet. Click "+ Add" to add notes & PDFs.' : 'No matching documents.'}
            </div>
          )}
        </div>

        {/* Notebook Saved Chats Section */}
        <div className="notebook-chats-bottom-box">
          <div className="chats-sub-header">
            <span>
              <MessageCircle size={13} /> Saved Chats ({courseSessions.length})
            </span>
            <button className="btn-new-mini" onClick={onNewChat}>
              + New Chat
            </button>
          </div>

          <div className="saved-chats-scroll">
            {courseSessions.length > 0 ? (
              courseSessions.map(s => (
                <div
                  key={s.id}
                  className={`saved-chat-row${currentSessionId === s.id ? ' active' : ''}`}
                  onClick={() => openSession(s)}
                >
                  <span className="chat-title-truncate">{s.title}</span>
                  <small>{new Date(s.updated_at).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <div className="empty-chats-text">No saved discussions in this notebook yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Col 2: Center Chat Workspace ── */}
      <div className="workspace-col chat-panel">
        <div className="workspace-header-bar">
          <div className="workspace-notebook-name">
            <h2>{course.name}</h2>
            {currentSessionId && <span className="active-session-pill">Active Session</span>}
          </div>

          <div className="workspace-header-actions">
            <button className="secondary-pill-btn sm" onClick={onNewChat}>
              <PlusCircle size={13} /> New Chat
            </button>

            {courses.length > 1 && (
              <select
                className="select-dropdown-styled"
                value={course.id}
                onChange={e => chooseCourse(courses.find(c => c.id === Number(e.target.value)))}
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="messages-scroll-area" ref={chatRef}>
          {messages.length === 0 ? (
            <div className="empty-chat-hero">
              <div className="hero-bulb-icon">
                <BookOpen size={28} />
              </div>
              <h3>{course.name} Study Space</h3>
              <p>
                Connected to <strong>{docs.length} uploaded document{docs.length !== 1 ? 's' : ''}</strong>.
                Ask any question, test your understanding, or choose a prompt:
              </p>

              <div className="starter-prompts-grid-styled">
                <button
                  className="starter-prompt-card-styled"
                  onClick={() => onAskQuick(`Summarize the core takeaways and main concepts from ${course.name}.`)}
                >
                  <span className="starter-icon">📝</span>
                  <div className="starter-text">
                    <strong>Summarize key concepts</strong>
                    <span>Core takeaways and lecture review</span>
                  </div>
                </button>

                <button
                  className="starter-prompt-card-styled"
                  onClick={() => onAskQuick(`Create 5 practice exam questions with detailed answers based on ${course.name}.`)}
                >
                  <span className="starter-icon">❓</span>
                  <div className="starter-text">
                    <strong>5 Practice Questions</strong>
                    <span>Test your exam readiness</span>
                  </div>
                </button>

                <button
                  className="starter-prompt-card-styled"
                  onClick={() => onAskQuick(`Explain the most difficult topic in ${course.name} in simple terms with an intuitive example.`)}
                >
                  <span className="starter-icon">💡</span>
                  <div className="starter-text">
                    <strong>Explain complex topics</strong>
                    <span>Simple explanations & examples</span>
                  </div>
                </button>

                <button
                  className="starter-prompt-card-styled"
                  onClick={() => onAskQuick(`List all key formulas, terms, and definitions for ${course.name}.`)}
                >
                  <span className="starter-icon">📊</span>
                  <div className="starter-text">
                    <strong>Key Terms & Formulas</strong>
                    <span>Quick revision cheat sheet</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={`${idx}-${m.role}`} className={`chat-message-row ${m.role}`}>
                <div className={`message-bubble ${m.role}`}>
                  {m.role === 'user' ? m.text : <MarkdownMessage content={m.text} />}
                </div>

                {m.sources?.length > 0 && (
                  <div className="grounded-sources-box">
                    <div className="sources-label-tag">
                      <FileText size={12} /> Supporting Source References:
                    </div>
                    <div className="sources-badges-wrap">
                      {m.sources.map((s, si) => (
                        <div key={`${s.document_id}-${s.page_number}-${si}`} className="citation-badge-item">
                          <FileText size={13} />
                          <div className="citation-text">
                            <strong>{s.document_title}</strong>
                            <span>{s.document_type?.replaceAll('_', ' ')}{s.page_number ? ` · Page ${s.page_number}` : ''}</span>
                          </div>
                          <span className="relevance-pct">{Math.round(s.relevance_score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {busy && (
            <div className="chat-message-row assistant">
              <div className="message-bubble assistant busy-state">
                <LoaderCircle size={16} className="spin-icon" />
                <span>Reading course materials and finding answers…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="chat-input-container">
          <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="chat-composer-form">
            <div className="composer-pill-box">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask a question or create notes for ${course.name}…`}
                disabled={busy}
              />
              <span className="sources-indicator-badge">
                <FileText size={12} />
                {activeSelectedCount} source{activeSelectedCount !== 1 ? 's' : ''}
              </span>
              <button
                type="submit"
                className="composer-send-btn"
                disabled={busy || !input.trim()}
                title="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </form>

          <div className="composer-footer-tip">
            Answers are grounded in your uploaded documents with direct citations
          </div>
        </div>
      </div>

      {/* ── Col 3: Studio Review Tools ── */}
      <div className="workspace-col studio-panel">
        <div className="panel-top-title">
          <div className="title-left">
            <Layers size={16} />
            <span>Study Tools</span>
          </div>
          <span className="ai-tools-pill">TOOLS</span>
        </div>

        <div className="studio-scroll-content">
          {/* Audio Overview Banner Card */}
          <div className="audio-overview-banner">
            <div className="audio-banner-head">
              <span>🎙️ Audio Discussion</span>
              <small>Two-Host Overview</small>
            </div>
            <p>Listen to a deep dive conversational discussion covering your course notes and main ideas.</p>
            <button className="primary-pill-btn sm" onClick={() => onOpenStudioTool('audio')}>
              🎙️ Play Audio Overview
            </button>
          </div>

          {/* 2-Column Grid of Studio Buttons */}
          <div className="studio-tools-2col-grid">
            <button className="studio-tool-button" onClick={() => onOpenStudioTool('audio')}>
              <div className="tool-icon-squircle pastel-lavender"><Mic size={17} /></div>
              <strong>Audio Overview</strong>
              <span>Podcast dialogue</span>
            </button>

            <button className="studio-tool-button" onClick={() => onOpenStudioTool('flashcards')}>
              <div className="tool-icon-squircle pastel-sky"><Layers size={17} /></div>
              <strong>Flashcards</strong>
              <span>3D interactive deck</span>
            </button>

            <button className="studio-tool-button" onClick={() => onOpenStudioTool('quiz')}>
              <div className="tool-icon-squircle pastel-rose"><HelpCircle size={17} /></div>
              <strong>Practice Quiz</strong>
              <span>Questions & scoring</span>
            </button>

            <button className="studio-tool-button" onClick={() => onOpenStudioTool('mindmap')}>
              <div className="tool-icon-squircle pastel-mint"><Network size={17} /></div>
              <strong>Concept Map</strong>
              <span>Topic hierarchy</span>
            </button>

            <button className="studio-tool-button" onClick={() => onOpenStudioTool('studyguide')}>
              <div className="tool-icon-squircle pastel-peach"><FileCheck size={17} /></div>
              <strong>Study Guide</strong>
              <span>Summary sheets</span>
            </button>

            <button
              className="studio-tool-button"
              onClick={() => onAskQuick(`Create a detailed summary report of all key topics in ${course.name}.`)}
            >
              <div className="tool-icon-squircle pastel-lavender"><FileText size={17} /></div>
              <strong>Executive Brief</strong>
              <span>Topic briefing</span>
            </button>
          </div>

          {/* Saved Artifacts Section */}
          <div className="studio-saved-artifacts-box">
            <div className="artifacts-sub-header">
              <span>Saved Course Artifacts</span>
              <button
                className="btn-new-mini"
                onClick={() => onAskQuick(`Write a comprehensive summary note for ${course.name} to save in this notebook.`)}
              >
                + Note
              </button>
            </div>

            <div className="saved-artifacts-list">
              <div className="artifact-item-row" onClick={() => onOpenStudioTool('flashcards')}>
                <Layers size={15} />
                <div>
                  <strong>{course.name} Flashcards</strong>
                  <small>{docs.length} source{docs.length !== 1 ? 's' : ''} · Active</small>
                </div>
              </div>

              <div className="artifact-item-row" onClick={() => onOpenStudioTool('quiz')}>
                <HelpCircle size={15} />
                <div>
                  <strong>Self-Test Practice Quiz</strong>
                  <small>Practice questions & scoring</small>
                </div>
              </div>

              <div className="artifact-item-row" onClick={() => onOpenStudioTool('audio')}>
                <Mic size={15} />
                <div>
                  <strong>Audio Discussion Script</strong>
                  <small>Speech narration ready</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
