import React, { useState } from 'react';
import { Award, CheckCircle, AlertTriangle, Printer, Sparkles, AlertCircle } from 'lucide-react';

export default function ResumeViewer({ initialResume, profile, onGenerationSuccess }) {
  const [resume, setResume] = useState(initialResume || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAIResume = async () => {
    if (!profile) {
      setError('Please fill in and save your profile data first!');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate resume');
      }

      setResume(data);
      if (onGenerationSuccess) onGenerationSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control panel (not printed) */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Award className="text-blue-600 h-5 w-5" />
              ATS-Optimized Resume Engine
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Analyze keywords and generate Google X-Y-Z formula bullet points.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateAIResume}
              disabled={loading || !profile}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  {resume ? 'Regenerate Resume' : 'Generate with AI'}
                </>
              )}
            </button>

            {resume && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                <Printer size={14} />
                Export / Print PDF
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-250 dark:border-rose-800/30 text-rose-800 dark:text-rose-450 rounded-lg p-4 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ATS Keywords & Score Widget */}
        {resume && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            {/* Score */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ATS MATCH RATING</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50">{resume.atsScore}%</span>
                <span className="text-xs text-zinc-500 font-semibold">Match Rate</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${resume.atsScore}%` }}
                />
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-555" />
                KEYWORDS MATCHED ({resume.atsKeywordsMatched?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1 mt-2">
                {resume.atsKeywordsMatched?.map((kw, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-md">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={12} className="text-amber-555" />
                CRITICAL GAP KEYWORDS ({resume.atsKeywordsMissing?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1 mt-2">
                {resume.atsKeywordsMissing?.map((kw, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-md">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* The Printable Resume Sheet */}
      {resume ? (
        <div className="bg-white text-zinc-950 p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-2xl mx-auto max-w-[800px] print-shadow-none font-serif leading-relaxed">
          {/* Header */}
          <div className="text-center border-b border-zinc-300 pb-4 mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">
              {profile?.personalInfo?.fullName}
            </h1>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-600 font-sans">
              {profile?.personalInfo?.email && <span>{profile.personalInfo.email}</span>}
              {profile?.personalInfo?.phone && <span>• {profile.personalInfo.phone}</span>}
              {profile?.personalInfo?.linkedin && (
                <a href={profile.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  • LinkedIn
                </a>
              )}
              {profile?.personalInfo?.github && (
                <a href={profile.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  • GitHub
                </a>
              )}
              {profile?.personalInfo?.portfolio && (
                <a href={profile.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  • Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
                Professional Summary
              </h3>
              <p className="text-xs text-zinc-800 leading-relaxed font-serif">
                {resume.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {resume.skillsFormatted && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
                Technical Skills
              </h3>
              <p className="text-xs text-zinc-800 leading-relaxed font-serif">
                {resume.skillsFormatted}
              </p>
            </div>
          )}

          {/* Experience */}
          {resume.experienceBullets?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
                Professional Experience
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-900">
                    <span>{profile?.targetJob?.jobTitle || "Software Engineer"}</span>
                    <span className="font-normal font-sans">Present</span>
                  </div>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    {resume.experienceBullets.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-zinc-800 leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projectsBullets?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
                Selected Software Projects
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {resume.projectsBullets.map((bullet, idx) => (
                  <li key={idx} className="text-xs text-zinc-800 leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {profile?.qualification && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-sans border-b border-zinc-200 pb-1 mb-2">
                Education
              </h3>
              <div className="flex justify-between text-xs font-bold text-zinc-900">
                <span>{profile.qualification.highestDegree}</span>
                <span className="font-normal font-sans">{profile.qualification.graduationYear}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-700 italic">
                <span>{profile.qualification.institution}</span>
                {profile.qualification.cgpa && <span className="font-sans">CGPA: {profile.qualification.cgpa}</span>}
              </div>
              {profile.qualification.coursework?.length > 0 && (
                <p className="text-[11px] text-zinc-650 mt-1 font-serif">
                  <span className="font-semibold">Coursework:</span> {profile.qualification.coursework.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-[#0c0c0f]/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Award size={48} className="text-zinc-400 dark:text-zinc-600 mb-4 animate-pulse" />
          <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50 mb-1">No Resume Generated Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6">
            Click the "Generate with AI" button above to run our ATS Engine. It parses your profile and optimizes bullets.
          </p>
          <button
            onClick={generateAIResume}
            disabled={loading || !profile}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={14} />
                Generate with AI
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
