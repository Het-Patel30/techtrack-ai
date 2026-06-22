import React from 'react';
import { UserCheck, Award, GraduationCap, Flame, TrendingUp } from 'lucide-react';

// ─── Circular progress ring ────────────────────────────────────────────────────
function ProgressRing({ pct, size = 56, stroke = 5, color = '#2563eb' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        strokeWidth={stroke} className="text-zinc-100 dark:text-zinc-800" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

export default function DashboardStats({ profile, resume, interview }) {
  // ── Profile completion ─────────────────────────────────────────────────────
  let profileCompletion = 0;
  const completionSteps = [];
  if (profile) {
    const checks = [
      { label: 'Personal info',  done: !!(profile.personalInfo?.fullName && profile.personalInfo?.email) },
      { label: 'Education',      done: !!(profile.qualification?.highestDegree && profile.qualification?.institution) },
      { label: 'Target role',    done: !!profile.targetJob?.jobTitle },
      { label: 'Technical skills', done: !!(profile.technicalSkills?.languages?.length > 0) },
      { label: 'Work experience', done: !!(profile.workExperience?.length > 0 && profile.workExperience[0]?.company) },
      { label: 'Projects',        done: !!(profile.projects?.length > 0 && profile.projects[0]?.name) },
    ];
    completionSteps.push(...checks);
    const filled = checks.filter(c => c.done).length;
    profileCompletion = Math.round((filled / checks.length) * 100);
  }

  // ── ATS Score ──────────────────────────────────────────────────────────────
  const atsScore = resume?.atsScore || 0;

  // ── Interview progress ─────────────────────────────────────────────────────
  const currentRoundName = interview ? `Round ${interview.currentRound}/6` : 'Round 1/6';
  let totalAnswered = 0, totalQuestions = 0;
  if (interview?.rounds) {
    interview.rounds.forEach(r => {
      totalQuestions += r.questions?.length || 0;
      totalAnswered  += r.questions?.filter(q => q.isAnswered).length || 0;
    });
  }

  const kpis = [
    {
      id: 'profile',
      title: 'Profile Completion',
      value: `${profileCompletion}%`,
      subtitle: profile ? (profileCompletion === 100 ? 'All sections filled!' : `${completionSteps.filter(c => !c.done).length} sections remaining`) : 'No profile yet',
      icon: <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      ring: { pct: profileCompletion, color: profileCompletion === 100 ? '#10b981' : '#2563eb' },
      barColor: profileCompletion === 100 ? 'bg-emerald-500' : 'bg-blue-500',
    },
    {
      id: 'ats',
      title: 'ATS Resume Score',
      value: resume ? `${atsScore}/100` : '—',
      subtitle: resume ? `${resume.atsKeywordsMatched?.length || 0} keywords matched` : 'Generate your resume',
      icon: <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      ring: { pct: atsScore, color: atsScore >= 80 ? '#10b981' : atsScore >= 60 ? '#f59e0b' : '#8b5cf6' },
      barColor: atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 60 ? 'bg-amber-500' : 'bg-purple-500',
    },
    {
      id: 'interview',
      title: 'Interview Target',
      value: currentRoundName,
      subtitle: interview ? (interview.rounds[interview.currentRound - 1]?.roundName?.slice(0, 28) + '…') : 'Start preparation',
      icon: <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      ring: { pct: interview ? ((interview.currentRound - 1) / 6) * 100 : 0, color: '#f59e0b' },
      barColor: 'bg-amber-500',
    },
    {
      id: 'solved',
      title: 'Mock Tasks Solved',
      value: `${totalAnswered}/${totalQuestions || 18}`,
      subtitle: totalAnswered > 0 ? `${Math.round((totalAnswered / (totalQuestions || 18)) * 100)}% complete` : 'MNC-standard mocks',
      icon: <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      ring: { pct: Math.round((totalAnswered / (totalQuestions || 18)) * 100), color: totalAnswered > 0 ? '#f97316' : '#a1a1aa' },
      barColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">{kpi.title}</span>
                <span className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 block">{kpi.value}</span>
              </div>
              <div className="relative flex items-center justify-center">
                <ProgressRing pct={kpi.ring.pct} color={kpi.ring.color} />
                <div className="absolute">{kpi.icon}</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-700 ${kpi.barColor}`}
                style={{ width: `${kpi.ring.pct}%` }} />
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{kpi.subtitle}</span>
          </div>
        ))}
      </div>

      {/* ── Profile Completion Checklist (visible if not 100%) ─────────────────── */}
      {profile && profileCompletion < 100 && (
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} /> Profile Completion Checklist
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {completionSteps.map((step) => (
              <div key={step.label} className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                step.done
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  step.done ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                }`}>
                  {step.done ? '✓' : '○'}
                </span>
                {step.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills Cloud (visible when profile has skills) ─────────────────────── */}
      {profile?.technicalSkills && (
        (() => {
          const sk = profile.technicalSkills;
          const allSkills = [
            ...(sk.languages  || []).map(t => ({ tag: t, type: 'lang' })),
            ...(sk.frameworks || []).map(t => ({ tag: t, type: 'fw' })),
            ...(sk.databases  || []).map(t => ({ tag: t, type: 'db' })),
            ...(sk.toolsCloud || []).map(t => ({ tag: t, type: 'tool' })),
            ...(sk.softSkills || []).map(t => ({ tag: t, type: 'soft' })),
          ];
          if (allSkills.length === 0) return null;
          const colors = {
            lang: 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
            fw:   'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
            db:   'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
            tool: 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
            soft: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
          };
          return (
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Skills Cloud</h3>
                <div className="flex gap-3 text-[9px] font-bold text-zinc-400">
                  <span className="text-blue-500">■ Languages</span>
                  <span className="text-purple-500">■ Frameworks</span>
                  <span className="text-emerald-500">■ Databases</span>
                  <span className="text-amber-500">■ Tools</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map(({ tag, type }, i) => (
                  <span key={i} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:scale-105 cursor-default ${colors[type]}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
