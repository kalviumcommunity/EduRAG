import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export function UploadMaterialsView({ token, courses, onCourseAdded }) {
  const [courseMode, setCourseMode] = useState(courses.length > 0 ? 'existing' : 'new');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0] ? String(courses[0].id) : '');
  const [customCourseName, setCustomCourseName] = useState('');
  const [inputMethod, setInputMethod] = useState('file');
  const [textContent, setTextContent] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lecture');
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activeCourseId = courseMode === 'existing'
    ? (selectedCourseId || (courses[0] ? String(courses[0].id) : ''))
    : '';

  useEffect(() => {
    if (activeCourseId)
      api.documents(token, activeCourseId).then(setDocuments).catch(err => setError(err.message));
    else
      setDocuments([]);
  }, [token, activeCourseId]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (inputMethod === 'file' && !file) { setError('Please select a file.'); return; }
    if (inputMethod === 'text' && !textContent.trim()) { setError('Please enter text.'); return; }
    if (courseMode === 'new' && !customCourseName.trim()) { setError('Please enter a course name.'); return; }
    if (courseMode === 'existing' && !activeCourseId) { setError('Please select a course.'); return; }

    const form = new FormData();
    if (courseMode === 'existing') form.append('course_id', activeCourseId);
    else form.append('course_name', customCourseName.trim());
    if (inputMethod === 'file') {
      form.append('title', title.trim() || file.name);
      form.append('file', file);
    } else {
      form.append('title', title.trim() || textContent.trim().split('\n')[0].slice(0,40) || 'Pasted Notes');
      form.append('text_content', textContent.trim());
    }
    form.append('document_type', type);

    setBusy(true); setError(''); setNotice('');
    try {
      const saved = await api.upload(token, form);
      setNotice(`"${saved.title}" indexed & vectorized into course knowledge base!`);
      setFile(null); setTextContent(''); setTitle('');
      if (courseMode === 'new') {
        const nm = customCourseName.trim(); setCustomCourseName('');
        if (onCourseAdded) await onCourseAdded({ name: nm });
      } else if (activeCourseId) {
        setDocuments(await api.documents(token, activeCourseId));
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="subpage-wrapper">
      <div className="subpage-header">
        <div>
          <h2>Upload Sources & Course Materials</h2>
          <p>Add PDFs, DOCX, lecture notes, or pasted text to power your AI notebooks and Studio tools.</p>
        </div>
      </div>

      {error  && <div className="notice-banner error" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
      {notice && <div className="notice-banner success" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}

      <div className="upload-2col-layout">
        <div className="upload-form-card">
          <h4>Add New Material</h4>

          <div className="input-group">
            <label>Target Course Notebook</label>
            <div className="segmented-toggle-bar">
              {courses.length > 0 && (
                <button
                  type="button"
                  className={courseMode === 'existing' ? 'active' : ''}
                  onClick={() => { setCourseMode('existing'); setError(''); }}
                >
                  Existing Notebook
                </button>
              )}
              <button
                type="button"
                className={courseMode === 'new' ? 'active' : ''}
                onClick={() => { setCourseMode('new'); setError(''); }}
              >
                + New Notebook
              </button>
            </div>

            {courseMode === 'existing' ? (
              <select
                className="select-dropdown-styled full-w"
                value={activeCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <input
                  required
                  placeholder="e.g. Machine Learning, Physics 101, Data Structures…"
                  value={customCourseName}
                  onChange={e => setCustomCourseName(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Input Format</label>
            <div className="segmented-toggle-bar">
              <button type="button" className={inputMethod === 'file' ? 'active' : ''} onClick={() => { setInputMethod('file'); setError(''); }}>
                📁 Upload File (PDF/DOCX)
              </button>
              <button type="button" className={inputMethod === 'text' ? 'active' : ''} onClick={() => { setInputMethod('text'); setError(''); }}>
                ✍️ Paste Text Notes
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="upload-form-body">
            <div className="input-group">
              <label>Source Title (Optional)</label>
              <input
                placeholder={inputMethod === 'file' ? (file?.name || 'e.g. Chapter 1, Lecture 3') : 'e.g. Key Formulas & Summary'}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Category / Document Type</label>
              <select className="select-dropdown-styled full-w" value={type} onChange={e => setType(e.target.value)}>
                <option value="lecture">Lecture Notes / Summary</option>
                <option value="textbook">Textbook / Article</option>
                <option value="solved_example">Solved Examples / Practice</option>
              </select>
            </div>

            {inputMethod === 'file' ? (
              <label className="dropzone-box">
                <PlusCircle size={32} className="dropzone-plus-icon" />
                <strong>{file ? file.name : 'Click or drop a PDF, DOCX, or TXT file here'}</strong>
                <span>Supports lecture slides, book chapters, and documents up to 10 MB</span>
                <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
            ) : (
              <div className="input-group">
                <label>Paste Text Notes</label>
                <textarea
                  required
                  rows={7}
                  placeholder="Paste lecture notes, study materials, formulas, or summaries here…"
                  value={textContent}
                  onChange={e => setTextContent(e.target.value)}
                />
              </div>
            )}

            <button
              className="primary-action-btn full-w"
              style={{ marginTop: '12px' }}
              disabled={busy || (inputMethod === 'file' && !file) || (inputMethod === 'text' && !textContent.trim())}
            >
              {busy
                ? <><LoaderCircle size={15} className="spin-icon" /> Vectorizing & Processing Source…</>
                : inputMethod === 'file' ? '⬆ Upload & Process Source' : '✓ Save & Vectorize Notes'}
            </button>
          </form>
        </div>

        <div className="upload-sources-card">
          <h4>
            {activeCourseId
              ? `Indexed Sources — ${courses.find(c => String(c.id) === String(activeCourseId))?.name || ''}`
              : 'Course Sources'}
          </h4>

          <div className="sources-indexed-list">
            {activeCourseId ? (
              documents.length ? documents.map(doc => (
                <div key={doc.id} className="indexed-source-row">
                  <FileText size={16} />
                  <div className="indexed-source-info">
                    <strong>{doc.title}</strong>
                    <small>{doc.file_name} · {doc.processing_status}</small>
                  </div>
                </div>
              )) : (
                <div className="empty-sources-state">
                  <FileText size={24} />
                  <p>No sources uploaded for this notebook yet.</p>
                </div>
              )
            ) : (
              <div className="empty-sources-state">
                <FileText size={24} />
                <p>Select a notebook to view its sources.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
