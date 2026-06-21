import React, { useState, useEffect } from 'react';
import { Sparkles, LayoutDashboard, UserCircle2, FileText, GraduationCap, LogOut } from 'lucide-react';
import Auth from './components/Auth';
import ThemeToggle from './components/ThemeToggle';
import DashboardStats from './components/DashboardStats';
import MultiStepForm from './components/MultiStepForm';
import ResumeViewer from './components/ResumeViewer';
import InterviewTrack from './components/InterviewTrack';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [interview, setInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appLoading, setAppLoading] = useState(true);

  // Authenticate user on load
  const loadUserSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAppLoading(false);
      return;
    }

    try {
      // 1. Fetch User Info
      let res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Session invalid');
      const userData = await res.json();
      setUser(userData);

      // 2. Fetch User Profile
      res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const profileData = await res.json();
        setProfile(profileData);
      }

      // 3. Fetch Resume
      res = await fetch('/api/resume', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const resumeData = await res.json();
        setResume(resumeData);
      }

      // 4. Fetch Interview Progress
      res = await fetch('/api/interview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const interviewData = await res.json();
        setInterview(interviewData);
      }
    } catch (err) {
      console.warn("Session loading failed, clearing storage:", err.message);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setAppLoading(false);
    }
  };

  useEffect(() => {
    loadUserSession();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    loadUserSession();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setResume(null);
    setInterview(null);
    setActiveTab('dashboard');
  };

  const refreshProfileData = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const refreshResumeData = (updatedResume) => {
    setResume(updatedResume);
  };

  const refreshInterviewData = (updatedInterview) => {
    setInterview(updatedInterview);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading TechTrack AI...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center px-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'profile', label: 'Candidate Profile', icon: <UserCircle2 size={16} /> },
    { id: 'resume', label: 'ATS Resume Builder', icon: <FileText size={16} /> },
    { id: 'interview', label: 'Interview Guide', icon: <GraduationCap size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 no-print">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50 tracking-tight block">
                TechTrack AI
              </span>
              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block -mt-0.5">
                MNC Interview Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 hidden md:inline">
              Welcome, <span className="text-zinc-800 dark:text-zinc-250 font-bold">{user.username}</span>
            </span>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors shadow-sm focus:outline-none"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs (not printed) */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 no-print overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-[#60a5fa] bg-blue-50/10 dark:bg-blue-950/5'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Views */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 no-print">
              <div className="border-l-4 border-blue-600 pl-4 py-1">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-xs text-zinc-500">
                  Track profile status, ATS resume criteria, and 6-round technical mocks.
                </p>
              </div>

              {/* KPI metrics */}
              <DashboardStats profile={profile} resume={resume} interview={interview} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Candidate Profile Status
                    </h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed mb-4">
                      {profile 
                        ? `Your candidate profile for ${profile.targetJob?.jobTitle} (${profile.targetJob?.experienceLevel} level) is saved.`
                        : "Your candidate profile has not been configured. Completing your profile lets us align your ATS keywords and interview preparation questions."}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full text-center text-xs font-semibold px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    {profile ? 'Edit Profile' : 'Configure Profile'}
                  </button>
                </div>

                {/* Resume Card */}
                <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      ATS Resume Status
                    </h3>
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed mb-4">
                      {resume 
                        ? `Your resume rating is ${resume.atsScore}/100. Download the minimalist, ATS-compliant version to send to recruiters.`
                        : "Build an ATS-optimized, single-column resume using Google X-Y-Z achievements. Requires completed profile information."}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('resume')}
                    disabled={!profile}
                    className="w-full text-center text-xs font-semibold px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {resume ? 'Open Resume Builder' : 'Generate AI Resume'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="no-print">
              <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  Candidate Profile Form
                </h1>
                <p className="text-xs text-zinc-500">
                  Update your profile to generate mock assessments and target matching ATS keywords.
                </p>
              </div>
              <MultiStepForm initialProfile={profile} onSaveSuccess={refreshProfileData} />
            </div>
          )}

          {activeTab === 'resume' && (
            <div>
              <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6 no-print">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  ATS Resume Builder
                </h1>
                <p className="text-xs text-zinc-500">
                  Review matching and missing keywords, check your score, and export to PDF.
                </p>
              </div>
              <ResumeViewer initialResume={resume} profile={profile} onGenerationSuccess={refreshResumeData} />
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="no-print">
              <div className="border-l-4 border-blue-600 pl-4 py-1 mb-6">
                <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  6-Round Technical Interview Guide
                </h1>
                <p className="text-xs text-zinc-500">
                  Dynamically generated mock questions, key concept primers, and video/reading materials.
                </p>
              </div>
              <InterviewTrack initialProgress={interview} profile={profile} onProgressUpdate={refreshInterviewData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
