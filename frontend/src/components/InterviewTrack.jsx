import React, { useState } from 'react';
import { Lock, CheckCircle, RefreshCw, BookOpen, Video, ArrowRight, PlayCircle, MessageSquare, Star } from 'lucide-react';

export default function InterviewTrack({ initialProgress, profile, onProgressUpdate }) {
  const [progress, setProgress] = useState(initialProgress);
  const [selectedRoundNum, setSelectedRoundNum] = useState(initialProgress?.currentRound || 1);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState({});
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  const initRound = async (roundNum) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/interview/init-round/${roundNum}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.ok ? await response.json() : null;

      if (!response.ok) {
        const errorData = data || { message: 'Failed to initialize round' };
        throw new Error(errorData.message || 'Initialization failed');
      }

      setProgress(data);
      if (onProgressUpdate) onProgressUpdate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (roundNumber, questionId) => {
    const userAnswer = answers[questionId];
    if (!userAnswer || !userAnswer.trim()) return;

    setSubmitLoading(prev => ({ ...prev, [questionId]: true }));
    setError('');

    try {
      const response = await fetch('/api/interview/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roundNumber, questionId, userAnswer })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer');
      }

      setProgress(data.progress);
      if (onProgressUpdate) onProgressUpdate(data.progress);
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const selectedRound = progress?.rounds?.find(r => r.roundNumber === selectedRoundNum);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 6-Round Timeline Checklist Left Panel */}
      <div className="lg:col-span-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 h-fit">
        <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-2 flex items-center gap-2">
          Interview Preparation Track
        </h3>
        
        {progress?.rounds?.map((r) => {
          const isActive = selectedRoundNum === r.roundNumber;
          return (
            <button
              key={r.roundNumber}
              onClick={() => { setSelectedRoundNum(r.roundNumber); setError(''); }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group ${
                isActive
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-550 dark:border-blue-900 text-blue-700 dark:text-[#60a5fa]'
                  : r.status === 'Locked'
                  ? 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-900 opacity-60 cursor-not-allowed text-zinc-400'
                  : 'bg-white dark:bg-[#0c0c0f] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
              disabled={r.status === 'Locked' && r.roundNumber !== 1 && !profile}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                  R{r.roundNumber}
                </span>
                <div>
                  <div className="text-xs font-semibold leading-tight line-clamp-1">{r.roundName}</div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                    {r.status}
                  </span>
                </div>
              </div>

              <div>
                {r.status === 'Locked' ? (
                  <Lock size={14} className="text-zinc-400" />
                ) : r.status === 'Completed' ? (
                  <CheckCircle size={14} className="text-emerald-500" />
                ) : (
                  <ArrowRight size={14} className={`text-zinc-400 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preparation Panel Right Panel */}
      <div className="lg:col-span-8 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
        {selectedRound ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-5">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-[#60a5fa] uppercase tracking-wider">
                  MNC Preparation Path • Round {selectedRound.roundNumber} of 6
                </span>
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">
                  {selectedRound.roundName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {selectedRound.status === 'Completed' && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={10} /> Completed
                  </span>
                )}
                {selectedRound.status === 'Pending' && (
                  <button
                    onClick={() => initRound(selectedRound.roundNumber)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors"
                  >
                    {loading ? <RefreshCw size={12} className="animate-spin" /> : 'Unlock Materials'}
                  </button>
                )}
                {selectedRound.status === 'Active' && (
                  <button
                    onClick={() => initRound(selectedRound.roundNumber)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    {loading ? <RefreshCw size={12} className="animate-spin" /> : 'Regenerate'}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-4 text-xs">
                {error}
              </div>
            )}

            {/* If Round is Pending or Locked */}
            {selectedRound.status === 'Pending' && (
              <div className="text-center py-12">
                <BookOpen size={40} className="mx-auto text-zinc-400 mb-4 animate-bounce" />
                <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50 mb-1">Preparation Materials Ready</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
                  Click 'Unlock Materials' to dynamically generate MNC questions, core concepts to study, and video/reading links tailored to your skills.
                </p>
                <button
                  onClick={() => initRound(selectedRound.roundNumber)}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors mx-auto"
                >
                  {loading ? <RefreshCw size={12} className="animate-spin" /> : 'Generate Guide'}
                </button>
              </div>
            )}

            {selectedRound.status === 'Locked' && (
              <div className="text-center py-12">
                <Lock size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50 mb-1">Round is Locked</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Complete the mock questions and tasks in the previous rounds to unlock this prep tracker.
                </p>
              </div>
            )}

            {/* Active or Completed Round View */}
            {(selectedRound.status === 'Active' || selectedRound.status === 'Completed') && (
              <div className="space-y-6">
                {/* 1. Study Concepts */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    Core MNC Competencies & Concepts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRound.studyConcepts?.map((concept, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Resources (Video & Reading) */}
                {selectedRound.resourceLinks?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                      Curated Study Materials & Tutorials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRound.resourceLinks.map((res, idx) => (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-blue-50/10 dark:hover:bg-blue-950/5 rounded-xl flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              res.type === 'video' 
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-[#60a5fa]'
                            }`}>
                              {res.type === 'video' ? <Video size={16} /> : <BookOpen size={16} />}
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{res.label}</div>
                              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">
                                {res.type === 'video' ? 'Video Lesson' : 'Reading Article'}
                              </span>
                            </div>
                          </div>
                          <PlayCircle size={16} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Mock Questions */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                    Interactive Mock Interview
                  </h4>
                  <div className="space-y-4">
                    {selectedRound.questions?.map((q, idx) => {
                      const isSubmitting = submitLoading[q.questionId];
                      return (
                        <div key={q.questionId} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/10">
                          {/* Question Text */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-150 dark:border-zinc-800/80 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100/50 dark:bg-blue-950/30 text-blue-700 dark:text-[#60a5fa] rounded-md mt-0.5">
                                Q{idx + 1}
                              </span>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {q.questionText}
                              </p>
                            </div>
                            {q.isAnswered && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md shrink-0">
                                <Star size={10} className="fill-current" />
                                {q.score}/10
                              </div>
                            )}
                          </div>

                          {/* Response and Feedback */}
                          <div className="p-4 space-y-4">
                            {q.isAnswered ? (
                              <div className="space-y-3">
                                <div className="text-xs bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-800 rounded-lg p-3">
                                  <span className="text-[9px] uppercase font-bold text-zinc-500">YOUR SUBMITTED ANSWER</span>
                                  <p className="text-zinc-800 dark:text-zinc-300 mt-1 italic font-serif text-xs">{q.userAnswer}</p>
                                </div>
                                <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/30 rounded-lg p-4">
                                  <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-[#60a5fa] flex items-center gap-1 mb-2">
                                    <MessageSquare size={12} />
                                    AI FEEDBACK & MOCK CRITIQUE
                                  </span>
                                  <div className="text-xs text-zinc-800 dark:text-zinc-350 whitespace-pre-line leading-relaxed font-sans prose dark:prose-invert">
                                    {q.feedback}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <textarea
                                  value={answers[q.questionId] || ''}
                                  onChange={(e) => setAnswers(prev => ({ ...prev, [q.questionId]: e.target.value }))}
                                  placeholder="Type your structured answer here (incorporating STAR model or engineering details)..."
                                  className="w-full h-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleAnswerSubmit(selectedRound.roundNumber, q.questionId)}
                                    disabled={isSubmitting || !(answers[q.questionId] || '').trim()}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {isSubmitting ? (
                                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Submit Answer'
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50">Select a Round</h3>
            <p className="text-xs text-zinc-500">Choose a round from the timeline panel on the left to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
