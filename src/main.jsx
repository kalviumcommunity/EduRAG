import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  LayoutDashboard,
  MessageCircle,
  UploadCloud,
  History,
  Settings,
  Bell,
  Send,
  FileText,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Clock3
} from 'lucide-react';
import './style.css';

const courses = [
  ['Computer Networks', 'CS401', 72],
  ['Database Management', 'CS402', 48],
  ['Operating Systems', 'CS403', 31]
];

function App() {
  const [page, setPage] = useState('Dashboard');
  const [course, setCourse] = useState(courses[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { r: 'u', t: 'What is the difference between TCP and UDP?' },
    {
      r: 'a',
      t: 'TCP is connection-oriented and provides reliable, ordered delivery. UDP is connectionless and prioritizes speed with lower overhead.',
      s: true
    }
  ]);
  const [mode, setMode] = useState('Simple');
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);

  const ask = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((prev) => [...prev, { r: 'u', t: q }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          r: 'a',
          t: `Demo ${mode.toLowerCase()} answer based on ${course[0]}. Connect your backend API here to generate answers from retrieved course material.`,
          s: true
        }
      ]);
    }, 400);
  };

  const nav = [
    ['Dashboard', LayoutDashboard],
    ['My Courses', BookOpen],
    ['AI Tutor', MessageCircle],
    ['Upload Materials', UploadCloud],
    ['History', History]
  ];

  return (
    <>
      <header>
        <button
          className="mobile"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <b>
          <span>✦</span> LearnMate
        </b>
        <div className="right">
          <Bell className="bell-icon" />
          <i>D</i>
        </div>
      </header>
      <div className="layout">
        <aside className={open ? 'show' : ''}>
          <small>WORKSPACE</small>
          {nav.map(([n, Icon]) => (
            <button
              key={n}
              className={page === n ? 'active' : ''}
              onClick={() => {
                setPage(n);
                setOpen(false);
              }}
            >
              <Icon size={18} />
              {n}
            </button>
          ))}
          <small>YOUR COURSES</small>
          {courses.map((c) => (
            <button
              key={c[0]}
              onClick={() => {
                setCourse(c);
                setPage('AI Tutor');
                setOpen(false);
              }}
            >
              {c[0]}
            </button>
          ))}
          <button className="settings">
            <Settings size={18} />
            Settings
          </button>
        </aside>
        <main>
          {page === 'Dashboard' && <Dashboard go={setPage} pick={setCourse} />}
          {page === 'My Courses' && <Courses go={setPage} pick={setCourse} />}
          {page === 'AI Tutor' && (
            <Tutor
              course={course}
              messages={messages}
              input={input}
              setInput={setInput}
              ask={ask}
              mode={mode}
              setMode={setMode}
            />
          )}
          {page === 'Upload Materials' && (
            <Upload files={files} setFiles={setFiles} />
          )}
          {page === 'History' && <HistoryPage go={setPage} />}
        </main>
      </div>
    </>
  );
}

const Card = ({ c, click }) => (
  <button className="card" onClick={click}>
    <div className="icon">
      <BookOpen />
    </div>
    <h3>{c[0]}</h3>
    <p>{c[1]} · Course material</p>
    <div className="bar">
      <span style={{ width: `${c[2]}%` }} />
    </div>
    <small>{c[2]}% completed</small>
  </button>
);

function Dashboard({ go, pick }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section>
      <p className="muted">{currentDate}</p>
      <h1>Good morning, Divyesh 👋</h1>
      <p className="muted">
        Continue learning with answers grounded in your course material.
      </p>
      <div className="stats">
        <div>
          <small>Questions asked</small>
          <strong>24</strong>
          <em>+12% this week</em>
        </div>
        <div>
          <small>Learning hours</small>
          <strong>8.5h</strong>
          <em>2.1h this week</em>
        </div>
        <div>
          <small>Sources explored</small>
          <strong>47</strong>
          <em>Across 3 courses</em>
        </div>
      </div>
      <h2>Your courses</h2>
      <div className="grid">
        {courses.map((c) => (
          <Card
            key={c[0]}
            c={c}
            click={() => {
              pick(c);
              go('AI Tutor');
            }}
          />
        ))}
      </div>
      <div className="banner">
        <div>
          <b>✦ Ask your course-aware tutor</b>
          <p>Get concise answers with references from your own study material.</p>
        </div>
        <button onClick={() => go('AI Tutor')}>
          Start asking <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

function Courses({ go, pick }) {
  return (
    <section>
      <h1>My Courses</h1>
      <p className="muted">Select a course to start asking questions.</p>
      <div className="grid top">
        {courses.map((c) => (
          <Card
            key={c[0]}
            c={c}
            click={() => {
              pick(c);
              go('AI Tutor');
            }}
          />
        ))}
      </div>
    </section>
  );
}

function Tutor({ course, messages, input, setInput, ask, mode, setMode }) {
  return (
    <section className="tutor">
      <div className="title">
        <div>
          <small>AI TUTOR</small>
          <h1>{course[0]}</h1>
          <p className="muted">
            Answers are grounded in your uploaded course materials.
          </p>
        </div>
        <div className="mode-selector">
          {['Simple', 'Detailed', 'Exam mode'].map((x) => (
            <button
              key={x}
              className={mode === x ? 'pill selected' : 'pill'}
              onClick={() => setMode(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="chat">
        {messages.map((m, idx) => (
          <div key={idx} className={m.r === 'u' ? 'msg user' : 'msg'}>
            <p>{m.t}</p>
            {m.s && (
              <div className="sources">
                <b>📄 SOURCES</b>
                <div>
                  <FileText size={16} />
                  <span>
                    Computer Networks.pdf
                    <br />
                    <small>Textbook · Page 42</small>
                  </span>
                  <ChevronRight size={15} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder="Ask something about your course..."
        />
        <button onClick={ask} aria-label="Send message">
          <Send size={18} />
        </button>
      </div>
      <center>
        AI can make mistakes. Verify important answers using cited sources.
      </center>
    </section>
  );
}

function Upload({ files, setFiles }) {
  return (
    <section>
      <h1>Upload Materials</h1>
      <p className="muted">
        Add lecture transcripts, textbooks, and solved examples.
      </p>
      <label className="drop">
        <UploadCloud size={40} />
        <b>Drop files here or click to browse</b>
        <span>PDF, DOCX, TXT · Maximum 20 MB</span>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
        />
      </label>
      {files.map((f, i) => (
        <div key={i} className="file">
          <FileText />
          <span>
            {f.name}
            <small>{(f.size / 1024 / 1024).toFixed(2)} MB</small>
          </span>
          <CheckCircle2 />
        </div>
      ))}
    </section>
  );
}

function HistoryPage({ go }) {
  const historyItems = [
    'TCP vs UDP explained',
    'Normalization in DBMS',
    'Deadlock prevention methods'
  ];

  return (
    <section>
      <h1>Conversation History</h1>
      <p className="muted">Pick up where you left off.</p>
      {historyItems.map((x) => (
        <button key={x} className="history" onClick={() => go('AI Tutor')}>
          {x}
          <ChevronRight />
        </button>
      ))}
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);

