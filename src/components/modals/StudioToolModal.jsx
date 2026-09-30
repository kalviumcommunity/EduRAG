import React, { useState, useEffect } from 'react';
import {
  X, Mic, Layers, HelpCircle, Network, FileCheck, ChevronLeft, ChevronRight,
  RotateCcw, Sparkles, Pause, Play, Award, Copy
} from 'lucide-react';

export function StudioToolModal({ tool, course, docs, messages, onClose, onSendPrompt }) {
  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  // Audio overview state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const courseName = course?.name || 'Course';

  // Sample Flashcards
  const flashcards = [
    {
      front: `What is the core foundational principle of ${courseName}?`,
      back: `It establishes the fundamental framework, principles, and systematic methodology outlined in your primary course materials.`
    },
    {
      front: `How do the primary models in ${courseName} avoid errors?`,
      back: `By strictly anchoring conclusions in verified source evidence and cross-validating with established reference data.`
    },
    {
      front: `What is the key takeaway regarding execution in ${courseName}?`,
      back: `Structured problem decomposition, active review cycles, and evidence-based synthesis guarantee consistent mastery.`
    },
    {
      front: `Name the most critical breakdown trap to avoid.`,
      back: `The buried point trap: wandering through raw data before stating the main claim or thesis clearly at the start.`
    },
    {
      front: `What is the recommended fix for evidence without a point?`,
      back: `State the claim explicitly so that data serves as supporting proof rather than floating disconnected.`
    }
  ];

  // Sample Quiz Questions
  const quizQuestions = [
    {
      id: 1,
      question: `According to the materials in ${courseName}, what is the first step in effective structured synthesis?`,
      options: [
        { id: 'A', text: 'Stating the main conclusion or core claim upfront.' },
        { id: 'B', text: 'Listing all raw data without interpretation.' },
        { id: 'C', text: 'Delaying the recommendation until the conclusion.' },
        { id: 'D', text: 'Skipping evidence verification.' }
      ],
      correctId: 'A',
      explanation: 'Leading with the claim (the "Bottom Line Up Front" technique) establishes clarity before diving into supporting data.'
    },
    {
      id: 2,
      question: `What distinguishes evidence-grounded answers from standard guesses in ${courseName}?`,
      options: [
        { id: 'A', text: 'Length of the response.' },
        { id: 'B', text: 'Verifiable citations linked directly to course source documents.' },
        { id: 'C', text: 'Use of complex jargon.' },
        { id: 'D', text: 'Random sampling of unverified opinions.' }
      ],
      correctId: 'B',
      explanation: 'Verifiable citations ensure 100% accuracy and eliminate hallucinations.'
    },
    {
      id: 3,
      question: `When facing the "Buried Point" breakdown trap, what is the fix?`,
      options: [
        { id: 'A', text: 'Add more background history.' },
        { id: 'B', text: 'Move the claim to sentence one.' },
        { id: 'C', text: 'Delete all numbers.' },
        { id: 'D', text: 'Repeat the question twice.' }
      ],
      correctId: 'B',
      explanation: 'Moving the thesis or claim to sentence one cuts through delays and gives listeners immediate focus.'
    }
  ];

  // Sample Audio Dialogue Script
  const audioDialogue = [
    { speaker: 'Host A (Alex)', text: `Welcome back to the ${courseName} Deep Dive podcast! Today we're breaking down the key concepts from your course materials.` },
    { speaker: 'Host B (Sarah)', text: `That's right! What really jumped out at me is how these notes emphasize starting with your core point first before diving into the background data.` },
    { speaker: 'Host A (Alex)', text: `Exactly. If you wander through data before revealing your conclusion, your listeners lose the thread. Moving your claim to sentence one changes everything.` },
    { speaker: 'Host B (Sarah)', text: `And when it comes to supporting evidence, don't just dump numbers. State why those numbers matter to the outcome!` },
    { speaker: 'Host A (Alex)', text: `Spot on. Let's do a quick recap so you're fully prepped for your exams and discussions. Stay tuned!` }
  ];

  // Speech Synthesis Audio Player Logic
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);

    const fullText = audioDialogue.map(d => `${d.speaker}: ${d.text}`).join(' ... ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = audioSpeed;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleSelectQuizOption = (qId, optionId) => {
    if (showQuizResults) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctId) correct++;
    });
    return correct;
  };

  return (
    <div className="modal-backdrop-blur" onClick={onClose}>
      <div className="studio-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3>
            {tool === 'audio' && <><Mic size={18} /> Audio Overview Podcast</>}
            {tool === 'flashcards' && <><Layers size={18} /> Interactive Flashcards Deck</>}
            {tool === 'quiz' && <><HelpCircle size={18} /> Practice Quiz & Self-Test</>}
            {tool === 'mindmap' && <><Network size={18} /> Concept Mind Map</>}
            {tool === 'studyguide' && <><FileCheck size={18} /> Course Study Guide & Cheat Sheet</>}
          </h3>
          <button className="icon-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Flashcards View */}
        {tool === 'flashcards' && (
          <div className="flashcards-interactive-wrap">
            <div className="flashcards-top-stats">
              <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
              <span>⭐ {masteredCount} Mastered</span>
            </div>

            <div className="flashcard-viewport" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`flashcard-3d-box${isFlipped ? ' is-flipped' : ''}`}>
                <div className="card-face card-face-front">
                  <span className="card-badge-label">QUESTION / CONCEPT</span>
                  <div className="card-content-text">{flashcards[currentCardIdx].front}</div>
                  <span className="card-hint">Click card to reveal answer 🔄</span>
                </div>
                <div className="card-face card-face-back">
                  <span className="card-badge-label">ANSWER / EXPLANATION</span>
                  <div className="card-content-text answer">{flashcards[currentCardIdx].back}</div>
                  <span className="card-hint">Click card to flip back 🔄</span>
                </div>
              </div>
            </div>

            <div className="flashcards-controls-row">
              <button
                className="secondary-pill-btn"
                disabled={currentCardIdx === 0}
                onClick={() => { setCurrentCardIdx(i => Math.max(0, i - 1)); setIsFlipped(false); }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <button className="secondary-pill-btn" onClick={() => setIsFlipped(!isFlipped)}>
                🔄 Flip Card
              </button>

              <button
                className="secondary-pill-btn highlight"
                onClick={() => {
                  setMasteredCount(c => c + 1);
                  if (currentCardIdx < flashcards.length - 1) {
                    setCurrentCardIdx(i => i + 1);
                    setIsFlipped(false);
                  }
                }}
              >
                ✓ Mark Mastered
              </button>

              <button
                className="primary-pill-btn"
                disabled={currentCardIdx === 0 && flashcards.length === 1}
                onClick={() => { setCurrentCardIdx(i => Math.min(flashcards.length - 1, i + 1)); setIsFlipped(false); }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            <div className="modal-footer-ai-gen">
              <button
                className="btn-subtle-ai"
                onClick={() => onSendPrompt(`Generate 8 brand new flashcards for ${courseName} focusing on definitions, formulas, and tricky test questions.`)}
              >
                <Sparkles size={14} /> Generate More Flashcards with AI
              </button>
            </div>
          </div>
        )}

        {/* Audio Overview Podcast View */}
        {tool === 'audio' && (
          <div className="audio-overview-interactive">
            <div className="audio-player-box">
              <div className="player-top-row">
                <div>
                  <span className="player-course-tag">{courseName}</span>
                  <h4>Deep Dive Audio Overview</h4>
                </div>
                <div className="speed-pills-row">
                  {[1, 1.25, 1.5].map(speed => (
                    <button
                      key={speed}
                      className={`speed-pill${audioSpeed === speed ? ' active' : ''}`}
                      onClick={() => setAudioSpeed(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="player-play-controls">
                <button className="btn-circle-play" onClick={handlePlayAudio} title={isPlayingAudio ? 'Pause' : 'Play'}>
                  {isPlayingAudio ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
                </button>
              </div>

              <div className="player-status-caption">
                {isPlayingAudio ? '🔊 Playing Audio Podcast via Speech Synthesis…' : 'Tap Play to listen to dialogue narration'}
              </div>

              <div className="podcast-script-feed">
                {audioDialogue.map((line, idx) => (
                  <div key={idx} className="script-turn">
                    <strong className="speaker-name">{line.speaker}</strong>
                    <p className="speaker-text">{line.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer-ai-gen">
              <button
                className="btn-subtle-ai"
                onClick={() => onSendPrompt(`Write an extended 5-minute podcast audio script between Alex and Sarah diving deeply into ${courseName} concepts with intuitive analogies.`)}
              >
                <Sparkles size={14} /> Generate Extended Podcast Script
              </button>
            </div>
          </div>
        )}

        {/* Practice Quiz View */}
        {tool === 'quiz' && (
          <div className="quiz-interactive-wrap">
            {showQuizResults && (
              <div className="quiz-score-banner">
                <Award size={36} />
                <h4>Quiz Completed! Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)</h4>
                <p>{calculateScore() === quizQuestions.length ? '🎉 Outstanding mastery!' : '👍 Good practice session! Review the explanations below.'}</p>
                <button
                  className="primary-pill-btn sm"
                  onClick={() => { setQuizAnswers({}); setShowQuizResults(false); }}
                >
                  <RotateCcw size={14} /> Retake Quiz
                </button>
              </div>
            )}

            <div className="quiz-questions-scroll">
              {quizQuestions.map((q, idx) => {
                const selectedOption = quizAnswers[q.id];
                return (
                  <div key={q.id} className="quiz-card-item">
                    <h5 className="quiz-q-title">Question {idx + 1}: {q.question}</h5>
                    <div className="quiz-options-grid">
                      {q.options.map(opt => {
                        const isSelected = selectedOption === opt.id;
                        const isCorrect = showQuizResults && opt.id === q.correctId;
                        const isWrong = showQuizResults && isSelected && opt.id !== q.correctId;

                        let btnClass = 'quiz-opt-btn';
                        if (isCorrect) btnClass += ' is-correct';
                        else if (isWrong) btnClass += ' is-wrong';
                        else if (isSelected) btnClass += ' is-selected';

                        return (
                          <button
                            key={opt.id}
                            className={btnClass}
                            onClick={() => handleSelectQuizOption(q.id, opt.id)}
                          >
                            <span className="opt-letter">{opt.id}</span>
                            <span className="opt-text">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="quiz-explanation-note">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showQuizResults && (
              <div className="quiz-footer-actions">
                <button
                  className="btn-subtle-ai"
                  onClick={() => onSendPrompt(`Generate 5 brand new multiple choice questions with answers and explanations for ${courseName}.`)}
                >
                  <Sparkles size={14} /> Generate New Questions
                </button>

                <button
                  className="primary-action-btn"
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  onClick={() => setShowQuizResults(true)}
                >
                  Submit Quiz Answers →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Concept Mind Map View */}
        {tool === 'mindmap' && (
          <div className="mindmap-interactive-wrap">
            <div className="mindmap-tree-container">
              <div className="mindmap-root-node">
                <Network size={16} /> {courseName}
              </div>

              <div className="mindmap-branches-grid">
                <div className="mindmap-branch-box pastel-sky">
                  <h6>1. Core Fundamentals</h6>
                  <ul>
                    <li>Primary definitions & laws</li>
                    <li>System boundaries & scope</li>
                    <li>Baseline terminology</li>
                  </ul>
                </div>

                <div className="mindmap-branch-box pastel-lavender">
                  <h6>2. Problem Frameworks</h6>
                  <ul>
                    <li>Bottom line up front</li>
                    <li>Avoiding buried claims</li>
                    <li>Evidence grounding logic</li>
                  </ul>
                </div>

                <div className="mindmap-branch-box pastel-rose">
                  <h6>3. Practical Applications</h6>
                  <ul>
                    <li>Case studies & scenarios</li>
                    <li>Diagnostic evaluation</li>
                    <li>Synthesis & reports</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer-ai-gen">
              <button
                className="primary-action-btn"
                onClick={() => onSendPrompt(`Create a comprehensive structured concept map of ${courseName} in Mermaid diagram format.`)}
              >
                <Sparkles size={14} /> Generate Complete Hierarchy Map
              </button>
            </div>
          </div>
        )}

        {/* Study Guide View */}
        {tool === 'studyguide' && (
          <div className="studyguide-interactive-wrap">
            <div className="studyguide-paper-card">
              <h4>📚 {courseName} — Comprehensive Study Guide</h4>
              <p className="paper-subtitle">Compiled automatically from your verified course knowledge sources.</p>

              <div className="guide-takeaway-block">
                <h5>Key Takeaway 1: Structure & Clarity</h5>
                <p>Always lead with the thesis or primary finding. Context and evidence should follow as proof rather than prologue.</p>
              </div>

              <div className="guide-takeaway-block">
                <h5>Key Takeaway 2: Evidence Grounding</h5>
                <p>Every metric or assertion must be tied to a specific observation or verified course citation.</p>
              </div>

              <div className="guide-takeaway-block">
                <h5>Key Takeaway 3: Revision Checklist</h5>
                <ul>
                  <li>Review all core definitions and standard units.</li>
                  <li>Practice 5-10 multiple choice questions daily.</li>
                  <li>Synthesize notes using the Audio Overview for auditory reinforcement.</li>
                </ul>
              </div>
            </div>

            <div className="guide-actions-row">
              <button
                className="secondary-pill-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`Study Guide for ${courseName}\n- Lead with the core claim.\n- Anchor in citations.\n- Review flashcards.`);
                  alert('Study Guide copied to clipboard!');
                }}
              >
                <Copy size={14} /> Copy to Clipboard
              </button>

              <button
                className="primary-action-btn"
                onClick={() => onSendPrompt(`Generate an exhaustive 10-page study guide and cheat sheet for ${courseName} with bullet points.`)}
              >
                <Sparkles size={14} /> Generate Full Study Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
