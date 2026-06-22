import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Lock, CheckCircle, RefreshCw, BookOpen, Video, ArrowRight,
  PlayCircle, MessageSquare, Star, ChevronDown, ChevronUp,
  Zap, Brain, Trophy, Target, BarChart3, Clock, Lightbulb,
  Send, AlertCircle, GraduationCap, Timer, StickyNote,
  RotateCcw, TrendingUp, Info, Save, X, BarChart2
} from 'lucide-react';

// ─── Round metadata ────────────────────────────────────────────────────────────
const ROUND_META = {
  1: { icon: <Target   size={15} />, color: 'blue',   hint: 'Use the STAR format: Situation → Task → Action → Result. Spend 2 mins on the setup, 3 mins on action, 1 min on result & learnings.' },
  2: { icon: <Zap      size={15} />, color: 'violet', hint: 'State time/space complexity before coding. Start with brute-force, then optimise. Talk through your thought process aloud.' },
  3: { icon: <Brain    size={15} />, color: 'indigo', hint: 'Explain concepts from first principles. Give concrete code examples. Mention gotchas and edge-cases.' },
  4: { icon: <Lightbulb size={15}/>, color: 'amber',  hint: 'Show depth: go beyond basics. Mention internals, trade-offs, production gotchas, and real metrics from your own experience.' },
  5: { icon: <BarChart3 size={15}/>, color: 'rose',   hint: 'Always start with requirements + scale estimates. Draw the high-level diagram first, then drill into components. Mention CAP theorem.' },
  6: { icon: <Trophy   size={15} />, color: 'emerald',hint: 'Be specific with metrics & outcomes. Avoid vague answers. Show self-awareness, leadership, and growth mindset.' },
};

const COLORS = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/20',    border: 'border-blue-500',    text: 'text-blue-700 dark:text-blue-400',    badge: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',    icon: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',    dot: 'bg-blue-500'   },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950/20',border: 'border-violet-500',  text: 'text-violet-700 dark:text-violet-400',badge: 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300',icon: 'bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',dot: 'bg-violet-500' },
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-950/20',border: 'border-indigo-500',  text: 'text-indigo-700 dark:text-indigo-400',badge: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',icon: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',dot: 'bg-indigo-500' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/20',  border: 'border-amber-500',   text: 'text-amber-700 dark:text-amber-400',  badge: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',  icon: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500'  },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/20',    border: 'border-rose-500',    text: 'text-rose-700 dark:text-rose-400',    badge: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',    icon: 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',    dot: 'bg-rose-500'   },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20',border:'border-emerald-500',text:'text-emerald-700 dark:text-emerald-400',badge:'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',icon:'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',dot:'bg-emerald-500'},
};

// ─── Score badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const cls = score >= 8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
    : score >= 6 ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
    : 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800';
  const verdict = score >= 8 ? 'Strong Hire' : score >= 6 ? 'Hire' : 'Needs Work';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      <Star size={10} className="fill-current" />{score}/10 · {verdict}
    </span>
  );
}

// ─── Countdown timer component ────────────────────────────────────────────────
function QuestionTimer({ initialSeconds = 180, onExpire }) {
  const [seconds, setSeconds]   = useState(initialSeconds);
  const [running, setRunning]   = useState(false);
  const [expired, setExpired]   = useState(false);
  const intervalRef             = useRef(null);

  const start = () => {
    if (running) return;
    setRunning(true);
  };
  const pause  = () => setRunning(false);
  const reset  = () => { setRunning(false); setSeconds(initialSeconds); setExpired(false); };

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setExpired(true);
          if (onExpire) onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const pct = (seconds / initialSeconds) * 100;
  const color = seconds > initialSeconds * 0.5 ? 'text-emerald-600 dark:text-emerald-400'
    : seconds > initialSeconds * 0.25 ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400 animate-pulse';
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-7 w-7">
        <svg className="w-7 h-7 rotate-[-90deg]" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="11" strokeWidth="2.5" fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" />
          <circle cx="14" cy="14" r="11" strokeWidth="2.5" fill="none"
            strokeDasharray={2 * Math.PI * 11}
            strokeDashoffset={2 * Math.PI * 11 * (1 - pct / 100)}
            className={`transition-all duration-1000 ${expired ? 'stroke-rose-500' : seconds > initialSeconds * 0.5 ? 'stroke-emerald-500' : seconds > initialSeconds * 0.25 ? 'stroke-amber-500' : 'stroke-rose-500'}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <Timer size={10} className={color} />
        </span>
      </div>
      <span className={`text-xs font-mono font-bold ${color}`}>{m}:{s}</span>
      <div className="flex gap-1">
        {!running && !expired && <button onClick={start}  className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 transition-colors">Start</button>}
        {running  && <button onClick={pause}  className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-200 transition-colors">Pause</button>}
        <button onClick={reset} className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded hover:bg-zinc-200 transition-colors">Reset</button>
      </div>
    </div>
  );
}

// ─── Per-round Progress bar ───────────────────────────────────────────────────
function RoundProgressBar({ round }) {
  const total    = round.questions?.length || 0;
  const answered = round.questions?.filter(q => q.isAnswered).length || 0;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-bold text-zinc-400 shrink-0">{answered}/{total}</span>
    </div>
  );
}

// ─── Analytics chart bar ──────────────────────────────────────────────────────
function ScoreBar({ label, score, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-500 w-16 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 w-8 text-right">{score}/10</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function InterviewTrack({ initialProgress, profile, onProgressUpdate }) {
  const [progress, setProgress]             = useState(initialProgress);
  const [selectedRoundNum, setSelectedRoundNum] = useState(initialProgress?.currentRound || 1);
  const [loading, setLoading]               = useState(false);
  const [submitLoading, setSubmitLoading]   = useState({});
  const [answers, setAnswers]               = useState({});
  const [error, setError]                   = useState('');
  const [expandedQ, setExpandedQ]           = useState({});
  const [showConcepts, setShowConcepts]     = useState(true);
  const [showResources, setShowResources]   = useState(true);
  const [showNotes, setShowNotes]           = useState(false);
  const [showAnalytics, setShowAnalytics]   = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHint, setShowHint]             = useState({});
  const [notes, setNotes]                   = useState({});
  const [notesSaving, setNotesSaving]       = useState(false);
  const [notesSaved, setNotesSaved]         = useState(false);
  const notesTimer                          = useRef(null);

  // Sync notes from progress data
  useEffect(() => {
    if (progress?.rounds) {
      const n = {};
      progress.rounds.forEach(r => { if (r.notes) n[r.roundNumber] = r.notes; });
      setNotes(n);
    }
  }, []);

  // ── API Helpers ───────────────────────────────────────────────────────────
  const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` };

  const initRound = async (roundNum) => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/interview/init-round/${roundNum}`, { method: 'POST', headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initialize round');
      setProgress(data);
      if (onProgressUpdate) onProgressUpdate(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleAnswerSubmit = async (roundNumber, questionId) => {
    const userAnswer = answers[questionId];
    if (!userAnswer?.trim()) return;
    setSubmitLoading(prev => ({ ...prev, [questionId]: true }));
    setError('');
    try {
      const res  = await fetch('/api/interview/submit-answer', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ roundNumber, questionId, userAnswer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit answer');
      setProgress(data.progress);
      if (onProgressUpdate) onProgressUpdate(data.progress);
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
      setExpandedQ(prev => ({ ...prev, [questionId]: true }));
    } catch (err) { setError(err.message); }
    finally { setSubmitLoading(prev => ({ ...prev, [questionId]: false })); }
  };

  const handleResetProgress = async () => {
    setLoading(true); setShowResetConfirm(false); setError('');
    try {
      const res  = await fetch('/api/interview/reset', { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset');
      setProgress(data);
      setSelectedRoundNum(1);
      setAnswers({});
      setNotes({});
      if (onProgressUpdate) onProgressUpdate(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const saveNotes = useCallback(async (roundNum, text) => {
    setNotesSaving(true); setNotesSaved(false);
    try {
      await fetch(`/api/interview/notes/${roundNum}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ notes: text })
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch { /* silent */ }
    finally { setNotesSaving(false); }
  }, []);

  // Auto-save notes with 1.5s debounce
  const handleNotesChange = (roundNum, text) => {
    setNotes(prev => ({ ...prev, [roundNum]: text }));
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => saveNotes(roundNum, text), 1500);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const selectedRound  = progress?.rounds?.find(r => r.roundNumber === selectedRoundNum);
  const meta           = ROUND_META[selectedRoundNum] || ROUND_META[1];
  const colors         = COLORS[meta.color];

  const totalQ         = progress?.rounds?.reduce((a, r) => a + (r.questions?.length || 0), 0) || 0;
  const answeredQ      = progress?.rounds?.reduce((a, r) => a + (r.questions?.filter(q => q.isAnswered).length || 0), 0) || 0;
  const completedRounds= progress?.rounds?.filter(r => r.status === 'Completed').length || 0;
  const avgScore       = (() => {
    const all = (progress?.rounds || []).flatMap(r => r.questions?.filter(q => q.isAnswered).map(q => q.score) || []);
    return all.length > 0 ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : null;
  })();

  // All answered questions for analytics
  const allAnswered = (progress?.rounds || []).flatMap(r =>
    (r.questions || []).filter(q => q.isAnswered).map(q => ({
      ...q, roundName: r.roundName, roundNum: r.roundNumber
    }))
  );

  return (
    <div className="space-y-4">

      {/* ── Stats Banner ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Rounds Unlocked',  value: `${progress?.rounds?.filter(r => r.status !== 'Locked').length || 0}/6`, icon: <GraduationCap size={14} />, c: 'text-blue-600 dark:text-blue-400' },
          { label: 'Rounds Completed', value: `${completedRounds}/6`,     icon: <CheckCircle size={14} />,  c: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Questions Solved', value: `${answeredQ}/${totalQ || 18}`, icon: <Trophy size={14} />,   c: 'text-amber-600 dark:text-amber-400' },
          { label: 'Avg Mock Score',   value: avgScore ? `${avgScore}/10` : '—', icon: <BarChart2 size={14} />, c: 'text-purple-600 dark:text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`${stat.c} shrink-0`}>{stat.icon}</div>
            <div>
              <div className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50 leading-tight">{stat.value}</div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action bar (Reset + Analytics) ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAnalytics(p => !p)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <TrendingUp size={13} /> {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
        </div>
        <button onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">
          <RotateCcw size={13} /> Reset Progress
        </button>
      </div>

      {/* ── Reset Confirm Modal ────────────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/30 rounded-xl">
                <RotateCcw size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Reset Interview Progress?</h3>
                <p className="text-xs text-zinc-500 mt-1">This will delete all your answers, scores, and notes across all 6 rounds. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowResetConfirm(false)}
                className="text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleResetProgress} disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors">
                {loading ? <RefreshCw size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Performance Analytics Panel ────────────────────────────────────── */}
      {showAnalytics && allAnswered.length > 0 && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={13} /> Performance Analytics — {allAnswered.length} Questions Evaluated
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Per-round avg scores */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Average Score by Round</p>
              <div className="space-y-2">
                {(progress?.rounds || []).map(r => {
                  const qs = r.questions?.filter(q => q.isAnswered) || [];
                  if (!qs.length) return null;
                  const avg = (qs.reduce((a, q) => a + q.score, 0) / qs.length).toFixed(1);
                  const color = avg >= 8 ? 'bg-emerald-500' : avg >= 6 ? 'bg-amber-500' : 'bg-rose-500';
                  return <ScoreBar key={r.roundNumber} label={`R${r.roundNumber}`} score={parseFloat(avg)} color={color} />;
                })}
              </div>
            </div>
            {/* Individual scores */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Individual Question Scores</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {allAnswered.map((q, i) => {
                  const color = q.score >= 8 ? 'bg-emerald-500' : q.score >= 6 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${color}`}>{q.score}</span>
                      <span className="text-[10px] text-zinc-500 truncate flex-1">{q.questionText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Score distribution */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Score Distribution</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { range: '9-10', label: 'Exceptional', color: 'bg-emerald-500', count: allAnswered.filter(q => q.score >= 9).length },
                { range: '7-8',  label: 'Strong Hire', color: 'bg-blue-500',    count: allAnswered.filter(q => q.score >= 7 && q.score < 9).length },
                { range: '5-6',  label: 'Hire',        color: 'bg-amber-500',   count: allAnswered.filter(q => q.score >= 5 && q.score < 7).length },
                { range: '1-4',  label: 'Needs Work',  color: 'bg-rose-500',    count: allAnswered.filter(q => q.score < 5).length },
              ].map(b => (
                <div key={b.range} className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                  <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                  {b.label}: <span className="font-bold text-zinc-800 dark:text-zinc-200">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showAnalytics && allAnswered.length === 0 && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center text-xs text-zinc-400">
          No answers submitted yet. Complete some mock questions to see your analytics.
        </div>
      )}

      {/* ── Main 2-column Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Left: Round Timeline ───────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock size={11} /> 6-Round Preparation Track
            </h3>
            <div className="space-y-1.5">
              {progress?.rounds?.map(r => {
                const isActive = selectedRoundNum === r.roundNumber;
                const rMeta   = ROUND_META[r.roundNumber];
                const rCol    = COLORS[rMeta?.color || 'blue'];
                const isLocked = r.status === 'Locked';
                return (
                  <button key={r.roundNumber}
                    onClick={() => { if (!isLocked) { setSelectedRoundNum(r.roundNumber); setError(''); } }}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                      isActive
                        ? `${rCol.bg} border-current ${rCol.text} border`
                        : isLocked
                        ? 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-900 opacity-50 cursor-not-allowed text-zinc-400'
                        : 'bg-white dark:bg-[#0c0c0f] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`shrink-0 p-1.5 rounded-lg ${isActive ? rCol.icon : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {rMeta?.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold leading-tight truncate">{r.roundName}</div>
                        {r.status !== 'Locked' && r.questions?.length > 0 && <RoundProgressBar round={r} />}
                        {r.status === 'Locked' && <span className="text-[9px] uppercase tracking-wide font-bold text-zinc-400">Locked</span>}
                        {r.status === 'Pending' && <span className="text-[9px] uppercase tracking-wide font-bold text-amber-500">Ready to unlock</span>}
                      </div>
                    </div>
                    <div className="shrink-0 ml-1">
                      {isLocked  ? <Lock size={12} className="text-zinc-400" />
                        : r.status === 'Completed' ? <CheckCircle size={12} className="text-emerald-500" />
                        : <ArrowRight size={12} className={`text-zinc-400 group-hover:translate-x-0.5 transition-transform`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile notice */}
          {!profile && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              Complete your <strong className="mx-0.5">Profile</strong> first for AI-personalised questions tailored to your skills.
            </div>
          )}

          {/* Round Hint card */}
          {selectedRound && (selectedRound.status === 'Active' || selectedRound.status === 'Completed') && (
            <div className={`${colors.bg} border ${colors.border.replace('border-', 'border-').split('-').slice(0,-1).join('-')}-200 dark:border-zinc-800 rounded-xl p-4`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${colors.text} mb-2`}>
                <Lightbulb size={11} /> Round Strategy Tip
              </div>
              <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{meta.hint}</p>
            </div>
          )}
        </div>

        {/* ── Right: Round Detail ────────────────────────────────────────────── */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          {selectedRound ? (
            <>
              {/* Round Header */}
              <div className={`px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 ${colors.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors.icon}`}>{meta.icon}</div>
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>Round {selectedRound.roundNumber} of 6</div>
                      <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">{selectedRound.roundName}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {selectedRound.status === 'Completed' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 px-2.5 py-1 rounded-full">
                        <CheckCircle size={10} /> Completed
                      </span>
                    )}
                    {(selectedRound.status === 'Active') && (
                      <button onClick={() => initRound(selectedRound.roundNumber)} disabled={loading}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors">
                        <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Regenerate
                      </button>
                    )}
                    {selectedRound.status === 'Pending' && (
                      <button onClick={() => initRound(selectedRound.roundNumber)} disabled={loading}
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-white rounded-lg transition-colors ${colors.dot} hover:opacity-90`}>
                        {loading ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                        {loading ? 'Generating…' : 'Unlock Materials'}
                      </button>
                    )}
                    {/* Notes toggle */}
                    {(selectedRound.status === 'Active' || selectedRound.status === 'Completed') && (
                      <button onClick={() => setShowNotes(p => !p)}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${showNotes ? 'bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                        <StickyNote size={10} /> Notes
                        {notes[selectedRoundNum] && <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ml-0.5`} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-5 mt-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-3 text-xs flex items-center gap-2">
                  <AlertCircle size={13} className="shrink-0" /> {error}
                </div>
              )}

              {/* Notes Panel */}
              {showNotes && (selectedRound.status === 'Active' || selectedRound.status === 'Completed') && (
                <div className="mx-5 mt-4 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <StickyNote size={11} /> Round {selectedRoundNum} Notes
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {notesSaving ? 'Saving…' : notesSaved ? '✓ Saved' : 'Auto-saves as you type'}
                    </span>
                  </div>
                  <textarea
                    value={notes[selectedRoundNum] || ''}
                    onChange={e => handleNotesChange(selectedRoundNum, e.target.value)}
                    placeholder="Jot down concepts, tips, links, or things to remember for this round…"
                    rows={4}
                    className="w-full bg-white dark:bg-zinc-950 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none placeholder:text-zinc-400"
                  />
                </div>
              )}

              {/* Locked state */}
              {selectedRound.status === 'Locked' && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <Lock size={24} className="text-zinc-400" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Round Locked</h3>
                  <p className="text-xs text-zinc-500 max-w-xs">Answer mock questions in previous rounds to unlock this module.</p>
                </div>
              )}

              {/* Pending state */}
              {selectedRound.status === 'Pending' && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${colors.icon}`}>
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">Ready to Generate</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mb-5 leading-relaxed">
                    Generate AI-personalised mock questions, core competencies, and curated study materials for this round.
                  </p>
                  <button onClick={() => initRound(selectedRound.roundNumber)} disabled={loading}
                    className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 text-white rounded-xl transition-all shadow-sm ${colors.dot} hover:opacity-90`}>
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    {loading ? 'Generating Guide…' : 'Generate Interview Guide'}
                  </button>
                </div>
              )}

              {/* Active / Completed Content */}
              {(selectedRound.status === 'Active' || selectedRound.status === 'Completed') && (
                <div className="p-5 space-y-6">

                  {/* 1. Core Concepts */}
                  <section>
                    <button onClick={() => setShowConcepts(p => !p)}
                      className="flex items-center justify-between w-full mb-3">
                      <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${colors.text}`}>
                        <Brain size={12} /> Core MNC Competencies ({selectedRound.studyConcepts?.length || 0})
                      </h4>
                      {showConcepts ? <ChevronUp size={13} className="text-zinc-400" /> : <ChevronDown size={13} className="text-zinc-400" />}
                    </button>
                    {showConcepts && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedRound.studyConcepts?.map((concept, idx) => (
                          <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-xl border ${colors.bg} border-zinc-200 dark:border-zinc-800`}>
                            <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">{concept}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* 2. Study Resources */}
                  {selectedRound.resourceLinks?.length > 0 && (
                    <section>
                      <button onClick={() => setShowResources(p => !p)}
                        className="flex items-center justify-between w-full mb-3">
                        <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${colors.text}`}>
                          <BookOpen size={12} /> Curated Study Materials ({selectedRound.resourceLinks.length})
                        </h4>
                        {showResources ? <ChevronUp size={13} className="text-zinc-400" /> : <ChevronDown size={13} className="text-zinc-400" />}
                      </button>
                      {showResources && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedRound.resourceLinks.map((res, idx) => (
                            <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-700 rounded-xl transition-all group">
                              <div className={`p-1.5 rounded-lg shrink-0 ${res.type === 'video' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'}`}>
                                {res.type === 'video' ? <Video size={13} /> : <BookOpen size={13} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">{res.label}</div>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">{res.type === 'video' ? '▶ Video' : '📖 Article'}</span>
                              </div>
                              <PlayCircle size={13} className="text-zinc-300 group-hover:text-blue-500 transition-colors shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* 3. Mock Questions */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${colors.text}`}>
                        <MessageSquare size={12} /> Interactive Mock Interview
                      </h4>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {selectedRound.questions?.filter(q => q.isAnswered).length || 0}/{selectedRound.questions?.length || 0} answered
                      </span>
                    </div>

                    <div className="space-y-4">
                      {selectedRound.questions?.map((q, idx) => {
                        const isSubmitting = submitLoading[q.questionId];
                        const isExpanded   = expandedQ[q.questionId] !== false;
                        const hintOpen     = showHint[q.questionId];

                        return (
                          <div key={q.questionId}
                            className={`border rounded-xl overflow-hidden transition-all ${q.isAnswered ? 'border-emerald-200 dark:border-emerald-900/40' : 'border-zinc-200 dark:border-zinc-800'}`}>

                            {/* Question Header */}
                            <div
                              className={`flex items-start justify-between gap-3 p-4 ${q.isAnswered ? 'cursor-pointer select-none' : ''} ${q.isAnswered ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : 'bg-zinc-50 dark:bg-zinc-950/40'}`}
                              onClick={() => q.isAnswered && setExpandedQ(prev => ({ ...prev, [q.questionId]: !isExpanded }))}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${colors.badge}`}>Q{idx + 1}</span>
                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{q.questionText}</p>
                              </div>
                              {q.isAnswered && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <ScoreBadge score={q.score} />
                                  {isExpanded ? <ChevronUp size={13} className="text-zinc-400" /> : <ChevronDown size={13} className="text-zinc-400" />}
                                </div>
                              )}
                            </div>

                            {/* Body */}
                            {(!q.isAnswered || isExpanded) && (
                              <div className="p-4 space-y-3 bg-white dark:bg-[#0c0c0f]">
                                {q.isAnswered ? (
                                  <>
                                    <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                                      <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">Your Answer</span>
                                      <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">{q.userAnswer}</p>
                                    </div>
                                    <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
                                      <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1 mb-2">
                                        <MessageSquare size={10} /> AI Feedback & Critique
                                      </span>
                                      <div className="text-xs text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-relaxed">{q.feedback}</div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Timer + Hint row */}
                                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                      <QuestionTimer initialSeconds={selectedRoundNum <= 2 ? 300 : 240} />
                                      <button
                                        onClick={() => setShowHint(prev => ({ ...prev, [q.questionId]: !hintOpen }))}
                                        className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 transition-colors">
                                        <Lightbulb size={11} /> {hintOpen ? 'Hide Hint' : 'Show Hint'}
                                      </button>
                                    </div>

                                    {/* Hint box */}
                                    {hintOpen && (
                                      <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                        <strong className="block mb-1">💡 Round Strategy:</strong>
                                        {meta.hint}
                                      </div>
                                    )}

                                    <textarea
                                      value={answers[q.questionId] || ''}
                                      onChange={e => setAnswers(prev => ({ ...prev, [q.questionId]: e.target.value }))}
                                      onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleAnswerSubmit(selectedRound.roundNumber, q.questionId); } }}
                                      placeholder="Write your answer here… Use STAR format for behavioral, algorithm + complexity for coding. Ctrl+Enter to submit."
                                      rows={5}
                                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none resize-none placeholder:text-zinc-400"
                                    />
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-zinc-400">Ctrl + Enter to submit</span>
                                      <button
                                        onClick={() => handleAnswerSubmit(selectedRound.roundNumber, q.questionId)}
                                        disabled={isSubmitting || !(answers[q.questionId] || '').trim()}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                                        {isSubmitting
                                          ? <><RefreshCw size={12} className="animate-spin" /> Evaluating…</>
                                          : <><Send size={12} /> Submit Answer</>}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Round complete CTA */}
                    {selectedRound.questions?.length > 0 && selectedRound.questions.every(q => q.isAnswered) && selectedRound.status !== 'Completed' && (
                      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-center">
                        <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3">All questions answered!</p>
                        {selectedRoundNum < 6 && (
                          <button onClick={() => setSelectedRoundNum(selectedRoundNum + 1)}
                            className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 mx-auto">
                            Continue to Round {selectedRoundNum + 1} <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <GraduationCap size={36} className="text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Select a Round</h3>
              <p className="text-xs text-zinc-500 mt-1">Choose a round from the timeline to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
