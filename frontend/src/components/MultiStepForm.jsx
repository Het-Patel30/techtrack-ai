import React, { useState } from 'react';
import { User, GraduationCap, Briefcase, Code, ChevronRight, ChevronLeft, Save, Plus, X } from 'lucide-react';

export default function MultiStepForm({ initialProfile, onSaveSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [personalInfo, setPersonalInfo] = useState(initialProfile?.personalInfo || {
    fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: ''
  });
  const [qualification, setQualification] = useState(initialProfile?.qualification || {
    highestDegree: '', institution: '', graduationYear: '', cgpa: '', coursework: []
  });
  const [targetJob, setTargetJob] = useState(initialProfile?.targetJob || {
    jobTitle: '', experienceLevel: 'Mid', targetCompanyType: ''
  });
  const [technicalSkills, setTechnicalSkills] = useState(initialProfile?.technicalSkills || {
    languages: [], frameworks: [], databases: [], toolsCloud: [], softSkills: []
  });

  // Tag inputs state
  const [courseInput, setCourseInput] = useState('');
  const [langInput, setLangInput] = useState('');
  const [frameInput, setFrameInput] = useState('');
  const [dbInput, setDbInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const addTag = (field, value, setter, inputSetter) => {
    if (!value.trim()) return;
    if (field.includes(value.trim())) return; // Avoid duplicates
    setter(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    inputSetter('');
  };

  const removeTag = (field, index, setter) => {
    setter(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ personalInfo, qualification, targetJob, technicalSkills })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save profile');
      }

      setSuccessMsg('Profile saved successfully!');
      onSaveSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Personal", icon: <User size={16} /> },
    { num: 2, label: "Education", icon: <GraduationCap size={16} /> },
    { num: 3, label: "Target Role", icon: <Briefcase size={16} /> },
    { num: 4, label: "Skills", icon: <Code size={16} /> }
  ];

  return (
    <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 md:p-8">
      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.num)}
              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow-md'
                  : step > s.num
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {s.icon}
            </button>
            <span className={`text-xs font-semibold hidden md:inline ${
              step === s.num ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-4 text-xs mb-6">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 rounded-lg p-4 text-xs mb-6">
          {successMsg}
        </div>
      )}

      {/* Form Steps Content */}
      <div className="space-y-6 min-h-[280px]">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                required
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="jane.doe@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="+1 555 123 4567"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">LinkedIn URL</label>
              <input
                type="text"
                value={personalInfo.linkedin}
                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="https://linkedin.com/in/janedoe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">GitHub URL</label>
              <input
                type="text"
                value={personalInfo.github}
                onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="https://github.com/janedoe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Portfolio / Website</label>
              <input
                type="text"
                value={personalInfo.portfolio}
                onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="https://janedoe.dev"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Highest Degree *</label>
              <input
                type="text"
                required
                value={qualification.highestDegree}
                onChange={(e) => setQualification({ ...qualification, highestDegree: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="B.Tech in Computer Science"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Institution / University *</label>
              <input
                type="text"
                required
                value={qualification.institution}
                onChange={(e) => setQualification({ ...qualification, institution: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="State University"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Graduation Year *</label>
              <input
                type="text"
                required
                value={qualification.graduationYear}
                onChange={(e) => setQualification({ ...qualification, graduationYear: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">CGPA / Percentage</label>
              <input
                type="text"
                value={qualification.cgpa}
                onChange={(e) => setQualification({ ...qualification, cgpa: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="8.5/10 or 85%"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Relevant Coursework</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('coursework', courseInput, setQualification, setCourseInput))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100"
                  placeholder="Type coursework and press Enter (e.g. DBMS, DSA)"
                />
                <button
                  type="button"
                  onClick={() => addTag('coursework', courseInput, setQualification, setCourseInput)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {qualification.coursework?.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-full font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag('coursework', idx, setQualification)} className="hover:text-rose-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Target Job Title *</label>
              <input
                type="text"
                required
                value={targetJob.jobTitle}
                onChange={(e) => setTargetJob({ ...targetJob, jobTitle: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="e.g. MERN Stack Developer, Data Scientist"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Experience Level *</label>
              <select
                value={targetJob.experienceLevel}
                onChange={(e) => setTargetJob({ ...targetJob, experienceLevel: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
              >
                <option value="Entry">Entry (0-2 years)</option>
                <option value="Mid">Mid (2-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Target Company Tier / Type (Optional)</label>
              <input
                type="text"
                value={targetJob.targetCompanyType}
                onChange={(e) => setTargetJob({ ...targetJob, targetCompanyType: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                placeholder="e.g. FAANG, FinTech MNCs, Unicorn Startups"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {/* Tag Generator Helper Function */}
            {[
              { label: "Programming Languages", field: "languages", input: langInput, setter: setLangInput },
              { label: "Frameworks & Libraries", field: "frameworks", input: frameInput, setter: setFrameInput },
              { label: "Databases", field: "databases", input: dbInput, setter: setDbInput },
              { label: "Tools & Cloud Platforms", field: "toolsCloud", input: toolInput, setter: setToolInput },
              { label: "Soft Skills", field: "softSkills", input: softInput, setter: setSoftInput }
            ].map((skillBlock) => (
              <div key={skillBlock.field} className="border border-zinc-100 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20">
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {skillBlock.label}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillBlock.input}
                    onChange={(e) => skillBlock.setter(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(skillBlock.field, skillBlock.input, setTechnicalSkills, skillBlock.setter))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100"
                    placeholder={`e.g. click + or press enter to add`}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(skillBlock.field, skillBlock.input, setTechnicalSkills, skillBlock.setter)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {technicalSkills[skillBlock.field]?.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-md font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTag(skillBlock.field, idx, setTechnicalSkills)} className="hover:text-rose-500">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-5">
        <button
          type="button"
          onClick={() => setStep(prev => Math.max(prev - 1, 1))}
          disabled={step === 1}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(prev => Math.min(prev + 1, 4))}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Save Profile
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
