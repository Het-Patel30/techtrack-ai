import React from 'react';
import { UserCheck, Award, GraduationCap, Flame } from 'lucide-react';

export default function DashboardStats({ profile, resume, interview }) {
  // 1. Profile Completion Percentage
  let profileCompletion = 0;
  if (profile) {
    let fields = 0;
    let filled = 0;
    // Check personalInfo
    if (profile.personalInfo) {
      fields += 4;
      if (profile.personalInfo.fullName) filled++;
      if (profile.personalInfo.email) filled++;
      if (profile.personalInfo.phone) filled++;
      if (profile.personalInfo.github) filled++;
    }
    // Check qualification
    if (profile.qualification) {
      fields += 3;
      if (profile.qualification.highestDegree) filled++;
      if (profile.qualification.institution) filled++;
      if (profile.qualification.graduationYear) filled++;
    }
    // Check targetJob
    if (profile.targetJob) {
      fields += 2;
      if (profile.targetJob.jobTitle) filled++;
      if (profile.targetJob.experienceLevel) filled++;
    }
    // Check technicalSkills
    if (profile.technicalSkills) {
      fields += 2;
      if (profile.technicalSkills.languages?.length > 0) filled++;
      if (profile.technicalSkills.frameworks?.length > 0) filled++;
    }
    profileCompletion = Math.round((filled / fields) * 100);
  }

  // 2. ATS Score
  const atsScore = resume?.atsScore || 0;

  // 3. Current Interview Round Status
  const currentRoundName = interview ? `Round ${interview.currentRound}/6` : 'Round 1/6';

  // 4. Answered Mock Questions count
  let totalAnswered = 0;
  let totalQuestions = 0;
  if (interview?.rounds) {
    interview.rounds.forEach(r => {
      totalQuestions += r.questions?.length || 0;
      totalAnswered += r.questions?.filter(q => q.isAnswered).length || 0;
    });
  }

  const kpis = [
    {
      title: "Profile Completion",
      value: `${profileCompletion}%`,
      subtitle: profile ? "Profile complete and active" : "Incomplete, please fill form",
      icon: <UserCheck className="h-5 w-5 text-blue-600 dark:text-[#60a5fa]" />,
      colorClass: profileCompletion === 100 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-[#60a5fa]"
    },
    {
      title: "ATS Resume Match Score",
      value: resume ? `${atsScore}/100` : "No Resume",
      subtitle: resume ? `Matched ${resume.atsKeywordsMatched?.length || 0} core keywords` : "Generate ATS-friendly resume",
      icon: <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      colorClass: atsScore >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    },
    {
      title: "Interview Target",
      value: currentRoundName,
      subtitle: interview ? interview.rounds[interview.currentRound - 1]?.roundName.slice(0, 25) + '...' : "Prepare background",
      icon: <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    },
    {
      title: "Solved Practice Tasks",
      value: `${totalAnswered}/${totalQuestions || 18}`,
      subtitle: "MNC-standard mock tasks",
      icon: <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      colorClass: totalAnswered > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {kpi.title}
            </span>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
              {kpi.icon}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              {kpi.value}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.colorClass}`}>
                {kpi.subtitle}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
