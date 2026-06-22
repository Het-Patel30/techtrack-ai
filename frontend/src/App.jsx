import React, { useState, useEffect } from 'react';
import {
  Sparkles, LayoutDashboard, UserCircle2, FileText,
  GraduationCap, LogOut, ArrowRight, CheckCircle,
  Target, Zap, Trophy, BarChart2, TrendingUp, Clock,
  AlertTriangle, BookOpen, Star
} from 'lucide-react';
import Auth          from './components/Auth';
import ThemeToggle   from './components/ThemeToggle';
import DashboardStats from './components/DashboardStats';
import MultiStepForm from './components/MultiStepForm';
import ResumeViewer  from './components/ResumeViewer';
import InterviewTrack from './components/InterviewTrack';

// ── Circular gauge for ATS score ──────────────────────────────────────────────
function AtsGauge({ score }) {
  const r   = 38;
  const circ = 2 * Math.PI * r;
  const pct  = score ? score / 100 : 0;
  const col  = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} strokeWidth="8" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" />
          <circle cx="48" cy="48" r={r} strokeWidth="8" fill="none"
            stroke={col}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-none">{score ?? '–'}</span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">ATS</span>
        </div>
      </div>
      <span className={`text-[10px] font-bold mt-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
        {!score ? 'No resume yet' : score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : 'Needs Work'}
      </span>
    </div>
  );
}

// ── Interview mini progress bar ───────────────────────────────────────────────
function InterviewMiniBar({ progress }) {
  const rounds    = progress?.rounds || [];
  const completed = rounds.filter(r => r.status === 'Completed').length;
  const total     = 6;
  return (
    <div className="space-y-2">
      {rounds.map(r => {
        const isDone    = r.status === 'Completed';
        const isActive  = r.status === 'Active';
        const isPending = r.status === 'Pending';
        return (
          <div key={r.roundNumber} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-500' : isActive || isPending ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
            <div className="flex-1 text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{r.roundName}</div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : isPending ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
              {isDone ? '✓' : isActive ? 'Active' : isPending ? 'Ready' : 'Locked'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Quick action card ─────────────────────────────────────────────────────────
function QuickCard({ icon, title, desc, action, onClick, disabled, accent }) {
  return (
    <div className={`bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 ${disabled ? 'opacity-60' : ''}`}>
      <div>
        <div className={`inline-flex p-2 rounded-xl mb-3 ${accent}`}>{icon}</div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">{title}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
      </div>
      <button onClick={onClick} disabled={disabled}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all disabled:cursor-not-allowed">
        {action} <ArrowRight size={11} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [resume, setResume]     = useState(null);
  const [interview, setInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appLoading, setAppLoading] = useState(true);

  const loadUserSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setAppLoading(false); return; }
    try {
      let res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Session invalid');
      setUser(await res.json());

      res = await fetch('/api/profile',   { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProfile(await res.json());

      res = await fetch('/api/resume',    { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResume(await res.json());

      res = await fetch('/api/interview', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setInterview(await res.json());
    } catch (err) {
      console.warn('Session loading failed:', err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally { setAppLoading(false); }
  };

  useEffect(() => { loadUserSession(); }, []);

  const handleAuthSuccess = () => loadUserSession();
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); setProfile(null); setResume(null); setInterview(null);
    setActiveTab('dashboard');
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 border-4 border-blue-600/20 rounded-full" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">TechTrack AI</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Loading your workspace…</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Auth screen ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-50/30 dark:from-[#09090b] dark:to-blue-950/10 flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',         icon: <LayoutDashboard size={15} /> },
    { id: 'profile',   label: 'Candidate Profile', icon: <UserCircle2 size={15} /> },
    { id: 'resume',    label: 'ATS Resume Builder', icon: <FileText size={15} /> },
    { id: 'interview', label: 'Interview Guide',    icon: <GraduationCap size={15} /> },
  ];

  // Derived stats for dashboard
  const completedRounds = interview?.rounds?.filter(r => r.status === 'Completed').length || 0;
  const answeredQ = interview?.rounds?.reduce((a, r) => a + (r.questions?.filter(q => q.isAnswered).length || 0), 0) || 0;
  const allAnsweredScores = (interview?.rounds || []).flatMap(r => r.questions?.filter(q => q.isAnswered).map(q => q.score) || []);
  const avgScore = allAnsweredScores.length > 0 ? (allAnsweredScores.reduce((a,b) => a+b, 0) / allAnsweredScores.length).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-colors duration-200">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 no-print">
        <div className="max-w-[1400px] mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 dark:shadow-blue-900/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight block leading-tight">TechTrack AI</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">MNC Interview Suite</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Welcome,</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{user.username}</span>
              {profile && (
                <span className="ml-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-800/30">
                  {profile.targetJob?.jobTitle}
                </span>
              )}
            </div>
            <ThemeToggle />
            <button onClick={handleLogout}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors focus:outline-none"
              title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 space-y-6">

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 no-print overflow-x-auto pb-px">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}>
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Dashboard ──────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 no-print">
            <div className="flex items-start justify-between">
              <div className="border-l-4 border-blue-600 pl-4 py-1">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">Dashboard</h1>
                <p className="text-xs text-zinc-500 mt-0.5">Your complete interview readiness overview.</p>
              </div>
              {profile && (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2">
                  <Target size={12} className="text-blue-500" />
                  <span>Target: <strong className="text-zinc-700 dark:text-zinc-300">{profile.targetJob?.jobTitle}</strong></span>
                  <span className="mx-1">·</span>
                  <span className="text-zinc-500">{profile.targetJob?.experienceLevel} level</span>
                </div>
              )}
            </div>

            {/* KPI Bar */}
            <DashboardStats profile={profile} resume={resume} interview={interview} />

            {/* ── Middle section: ATS + Interview status ────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* ATS Score Gauge */}
              <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-between gap-4">
                <div className="text-center w-full">
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">ATS Resume Score</h3>
                  <AtsGauge score={resume?.atsScore} />
                </div>
                {resume && (
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{resume.atsKeywordsMatched?.slice(0,3).join(', ')}{resume.atsKeywordsMatched?.length > 3 ? `… +${resume.atsKeywordsMatched.length - 3}` : ''}</span>
                    </div>
                    {resume.atsKeywordsMissing?.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <AlertTriangle size={10} className="text-amber-500 shrink-0" />
                        <span className="truncate">Missing: {resume.atsKeywordsMissing?.slice(0,2).join(', ')}{resume.atsKeywordsMissing?.length > 2 ? `…` : ''}</span>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => setActiveTab('resume')} disabled={!profile}
                  className="w-full text-xs font-semibold px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {resume ? 'Open Resume Builder' : 'Generate AI Resume'} <ArrowRight size={11} />
                </button>
              </div>

              {/* Interview Track Status */}
              <div className="md:col-span-2 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">6-Round Interview Track</h3>
                  <div className="flex items-center gap-3">
                    {avgScore && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/30">
                        <Star size={10} className="fill-current" /> Avg Score: {avgScore}/10
                      </div>
                    )}
                    <div className="text-[10px] font-semibold text-zinc-500">
                      {completedRounds}/6 rounds · {answeredQ} Q&A
                    </div>
                  </div>
                </div>
                {interview ? (
                  <InterviewMiniBar progress={interview} />
                ) : (
                  <div className="text-xs text-zinc-400 text-center py-4">No interview data yet.</div>
                )}
                <button onClick={() => setActiveTab('interview')}
                  className="w-full mt-4 text-xs font-semibold px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5">
                  Open Interview Guide <ArrowRight size={11} />
                </button>
              </div>
            </div>

            {/* ── Quick Actions ─────────────────────────────────────────── */}
            <div>
              <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickCard
                  icon={<UserCircle2 size={18} className="text-blue-600 dark:text-blue-400" />}
                  title="Candidate Profile"
                  desc={profile ? `Profile set for ${profile.targetJob?.jobTitle}. Update skills or target role.` : 'Set up your skills, education, and target role to personalise your prep.'}
                  action={profile ? 'Edit Profile' : 'Create Profile'}
                  onClick={() => setActiveTab('profile')}
                  accent="bg-blue-50 dark:bg-blue-950/30"
                />
                <QuickCard
                  icon={<FileText size={18} className="text-violet-600 dark:text-violet-400" />}
                  title="ATS Resume Builder"
                  desc={resume ? `ATS score: ${resume.atsScore}/100. Export as PDF, DOCX, or TXT.` : 'Generate a recruiter-optimised resume with X-Y-Z impact bullets.'}
                  action={resume ? 'Open Resume' : 'Build Resume'}
                  onClick={() => setActiveTab('resume')}
                  disabled={!profile}
                  accent="bg-violet-50 dark:bg-violet-950/30"
                />
                <QuickCard
                  icon={<GraduationCap size={18} className="text-emerald-600 dark:text-emerald-400" />}
                  title="Interview Guide"
                  desc={`${completedRounds}/6 rounds completed. ${answeredQ} mock Q&As answered. Unlock next round to continue.`}
                  action="Open Guide"
                  onClick={() => setActiveTab('interview')}
                  accent="bg-emerald-50 dark:bg-emerald-950/30"
                />
                <QuickCard
                  icon={<TrendingUp size={18} className="text-amber-600 dark:text-amber-400" />}
                  title="Performance"
                  desc={avgScore ? `Your avg mock score is ${avgScore}/10. View per-round analytics in the Interview Guide.` : 'Submit mock answers in the Interview Guide to track your scores.'}
                  action="View Analytics"
                  onClick={() => setActiveTab('interview')}
                  accent="bg-amber-50 dark:bg-amber-950/30"
                />
              </div>
            </div>

            {/* ── Readiness checklist ──────────────────────────────────── */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500" /> Interview Readiness Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { done: !!profile,                           label: 'Complete candidate profile' },
                  { done: !!(profile?.technicalSkills?.languages?.length), label: 'Add technical skills' },
                  { done: !!resume,                            label: 'Generate ATS resume' },
                  { done: !!(resume?.atsScore >= 75),          label: 'Achieve ATS score ≥ 75' },
                  { done: completedRounds >= 1,                label: 'Complete Round 1 (Screening)' },
                  { done: completedRounds >= 3,                label: 'Complete first 3 rounds' },
                  { done: completedRounds === 6,               label: 'Complete all 6 rounds' },
                  { done: !!(avgScore && parseFloat(avgScore) >= 7), label: 'Achieve avg score ≥ 7/10' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${item.done ? 'bg-emerald-50 dark:bg-emerald-950/10' : 'bg-zinc-50 dark:bg-zinc-950/30'}`}>
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500' : 'border-2 border-zinc-300 dark:border-zinc-700'}`}>
                      {item.done && <CheckCircle size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-xs font-semibold ${item.done ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-400/50' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Profile Tab ────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="no-print">
            <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6">
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">Candidate Profile</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Update your profile to generate personalised ATS resumes and mock assessments.</p>
            </div>
            <MultiStepForm initialProfile={profile} onSaveSuccess={p => setProfile(p)} />
          </div>
        )}

        {/* ── Resume Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'resume' && (
          <div>
            <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6 no-print">
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">ATS Resume Builder</h1>
              <p className="text-xs text-zinc-500 mt-0.5">AI-generated X-Y-Z impact bullets, ATS keyword scoring, and multi-format download.</p>
            </div>
            <ResumeViewer initialResume={resume} profile={profile} onGenerationSuccess={r => setResume(r)} />
          </div>
        )}

        {/* ── Interview Tab ───────────────────────────────────────────────── */}
        {activeTab === 'interview' && (
          <div className="no-print">
            <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6">
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">6-Round Technical Interview Guide</h1>
              <p className="text-xs text-zinc-500 mt-0.5">AI-personalised mock questions, concept primers, study materials, countdown timer, and score analytics.</p>
            </div>
            <InterviewTrack initialProgress={interview} profile={profile} onProgressUpdate={d => setInterview(d)} />
          </div>
        )}
      </main>
    </div>
  );
}
