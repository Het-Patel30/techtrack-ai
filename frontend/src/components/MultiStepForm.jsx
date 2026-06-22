import React, { useState } from 'react';
import {
  User, GraduationCap, Briefcase, Code, ChevronRight, ChevronLeft,
  Save, Plus, X, Building2, FolderOpen, Award, ClipboardList, Trash2, FileText
} from 'lucide-react';

// ─── Reusable Tag Input ────────────────────────────────────────────────────────
function TagInput({ label, tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState('');
  const handleAdd = () => { if (input.trim()) { onAdd(input.trim()); setInput(''); } };
  return (
    <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-950/20">
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100"
          placeholder={placeholder || 'Type and press Enter or +'}
        />
        <button type="button" onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 transition-colors">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags?.map((tag, idx) => (
          <span key={idx} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-md font-medium">
            {tag}
            <button type="button" onClick={() => onRemove(idx)} className="hover:text-rose-500"><X size={10} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Field component ───────────────────────────────────────────────────────────
function Field({ label, children, span2 }) {
  return (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-zinc-950 dark:text-zinc-100 focus:outline-none";
const textareaClass = `${inputClass} resize-none`;

// ─── Empty templates ───────────────────────────────────────────────────────────
const emptyExp    = { company: '', role: '', startDate: '', endDate: '', isCurrent: false, bullets: [], rawText: '' };
const emptyProj   = { name: '', techStack: [], description: '', liveUrl: '', repoUrl: '' };
const emptyCert   = { name: '', issuer: '', date: '' };
const emptyAchiev = { text: '' };

export default function MultiStepForm({ initialProfile, onSaveSuccess }) {
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── Step 1: Personal Info ──────────────────────────────────────────────────
  const [personalInfo, setPersonalInfo] = useState(initialProfile?.personalInfo || {
    fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: ''
  });

  // ── Step 2: Education ─────────────────────────────────────────────────────
  const [qualification, setQualification] = useState(initialProfile?.qualification || {
    highestDegree: '', institution: '', graduationYear: '', cgpa: '', coursework: []
  });

  // ── Step 3: Target Role ───────────────────────────────────────────────────
  const [targetJob, setTargetJob] = useState(initialProfile?.targetJob || {
    jobTitle: '', experienceLevel: 'Mid', targetCompanyType: ''
  });

  // ── Step 4: Technical Skills ──────────────────────────────────────────────
  const [technicalSkills, setTechnicalSkills] = useState(initialProfile?.technicalSkills || {
    languages: [], frameworks: [], databases: [], toolsCloud: [], softSkills: []
  });

  // ── Step 5: Work Experience ───────────────────────────────────────────────
  const [workExperience, setWorkExperience] = useState(
    initialProfile?.workExperience?.length ? initialProfile.workExperience : [{ ...emptyExp }]
  );

  // ── Step 6: Projects, Certifications, Achievements ───────────────────────
  const [projects, setProjects]           = useState(
    initialProfile?.projects?.length ? initialProfile.projects : [{ ...emptyProj }]
  );
  const [certifications, setCertifications] = useState(
    initialProfile?.certifications?.length ? initialProfile.certifications : []
  );
  const [achievements, setAchievements]   = useState(
    initialProfile?.achievements?.length ? initialProfile.achievements : []
  );

  // ── Helpers for skill tags ─────────────────────────────────────────────────
  const addSkillTag  = (field, value) => {
    if (!value || technicalSkills[field].includes(value)) return;
    setTechnicalSkills(prev => ({ ...prev, [field]: [...prev[field], value] }));
  };
  const removeSkillTag = (field, idx) =>
    setTechnicalSkills(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));

  // ── Helpers for work experience bullets ───────────────────────────────────
  const addExpBullet = (expIdx, val) => {
    if (!val.trim()) return;
    const updated = [...workExperience];
    updated[expIdx] = { ...updated[expIdx], bullets: [...(updated[expIdx].bullets || []), val.trim()] };
    setWorkExperience(updated);
  };
  const removeExpBullet = (expIdx, bIdx) => {
    const updated = [...workExperience];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bIdx);
    setWorkExperience(updated);
  };
  const updateExp = (idx, field, val) => {
    const updated = [...workExperience];
    updated[idx] = { ...updated[idx], [field]: val };
    setWorkExperience(updated);
  };

  // ── Helpers for project tech stack ────────────────────────────────────────
  const addProjTech = (projIdx, val) => {
    if (!val.trim()) return;
    const updated = [...projects];
    updated[projIdx] = { ...updated[projIdx], techStack: [...(updated[projIdx].techStack || []), val.trim()] };
    setProjects(updated);
  };
  const removeProjTech = (projIdx, tIdx) => {
    const updated = [...projects];
    updated[projIdx].techStack = updated[projIdx].techStack.filter((_, i) => i !== tIdx);
    setProjects(updated);
  };
  const updateProj = (idx, field, val) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], [field]: val };
    setProjects(updated);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          personalInfo, qualification, targetJob, technicalSkills,
          workExperience, projects, certifications, achievements
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save profile');
      setSuccessMsg('Profile saved successfully!');
      onSaveSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal',    icon: <User size={14} /> },
    { num: 2, label: 'Education',   icon: <GraduationCap size={14} /> },
    { num: 3, label: 'Target Role', icon: <Briefcase size={14} /> },
    { num: 4, label: 'Skills',      icon: <Code size={14} /> },
    { num: 5, label: 'Experience',  icon: <Building2 size={14} /> },
    { num: 6, label: 'Projects',    icon: <FolderOpen size={14} /> },
  ];

  return (
    <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 md:p-8">

      {/* ── Step Indicator ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                step === s.num
                  ? 'bg-blue-600 text-white shadow-md'
                  : step > s.num
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700 shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Alerts ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-4 text-xs mb-6">{error}</div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 rounded-lg p-4 text-xs mb-6">{successMsg}</div>
      )}

      {/* ── STEP 1: Personal Info ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name *" span2>
            <input type="text" required value={personalInfo.fullName}
              onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
              className={inputClass} placeholder="Jane Doe" />
          </Field>
          <Field label="Email Address *">
            <input type="email" required value={personalInfo.email}
              onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className={inputClass} placeholder="jane.doe@example.com" />
          </Field>
          <Field label="Phone Number">
            <input type="text" value={personalInfo.phone}
              onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className={inputClass} placeholder="+1 555 123 4567" />
          </Field>
          <Field label="LinkedIn URL">
            <input type="text" value={personalInfo.linkedin}
              onChange={e => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
              className={inputClass} placeholder="https://linkedin.com/in/janedoe" />
          </Field>
          <Field label="GitHub URL">
            <input type="text" value={personalInfo.github}
              onChange={e => setPersonalInfo({ ...personalInfo, github: e.target.value })}
              className={inputClass} placeholder="https://github.com/janedoe" />
          </Field>
          <Field label="Portfolio / Website" span2>
            <input type="text" value={personalInfo.portfolio}
              onChange={e => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
              className={inputClass} placeholder="https://janedoe.dev" />
          </Field>
        </div>
      )}

      {/* ── STEP 2: Education ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Highest Degree *">
            <input type="text" required value={qualification.highestDegree}
              onChange={e => setQualification({ ...qualification, highestDegree: e.target.value })}
              className={inputClass} placeholder="B.Tech in Computer Science" />
          </Field>
          <Field label="Institution / University *">
            <input type="text" required value={qualification.institution}
              onChange={e => setQualification({ ...qualification, institution: e.target.value })}
              className={inputClass} placeholder="State University" />
          </Field>
          <Field label="Graduation Year *">
            <input type="text" required value={qualification.graduationYear}
              onChange={e => setQualification({ ...qualification, graduationYear: e.target.value })}
              className={inputClass} placeholder="2025" />
          </Field>
          <Field label="CGPA / Percentage">
            <input type="text" value={qualification.cgpa}
              onChange={e => setQualification({ ...qualification, cgpa: e.target.value })}
              className={inputClass} placeholder="8.5/10 or 85%" />
          </Field>
          <div className="md:col-span-2">
            <TagInput
              label="Relevant Coursework"
              tags={qualification.coursework}
              onAdd={val => setQualification(prev => ({ ...prev, coursework: [...(prev.coursework || []), val] }))}
              onRemove={idx => setQualification(prev => ({ ...prev, coursework: prev.coursework.filter((_, i) => i !== idx) }))}
              placeholder="e.g. DBMS, DSA, OS — press Enter"
            />
          </div>
        </div>
      )}

      {/* ── STEP 3: Target Role ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Target Job Title *">
            <input type="text" required value={targetJob.jobTitle}
              onChange={e => setTargetJob({ ...targetJob, jobTitle: e.target.value })}
              className={inputClass} placeholder="e.g. MERN Stack Developer" />
          </Field>
          <Field label="Experience Level *">
            <select value={targetJob.experienceLevel}
              onChange={e => setTargetJob({ ...targetJob, experienceLevel: e.target.value })}
              className={inputClass}>
              <option value="Entry">Entry (0–2 years)</option>
              <option value="Mid">Mid (2–5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
            </select>
          </Field>
          <Field label="Target Company Tier / Type (Optional)" span2>
            <input type="text" value={targetJob.targetCompanyType}
              onChange={e => setTargetJob({ ...targetJob, targetCompanyType: e.target.value })}
              className={inputClass} placeholder="e.g. FAANG, FinTech MNCs, Unicorn Startups" />
          </Field>
        </div>
      )}

      {/* ── STEP 4: Technical Skills ──────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4">
          {[
            { label: 'Programming Languages', field: 'languages' },
            { label: 'Frameworks & Libraries', field: 'frameworks' },
            { label: 'Databases',              field: 'databases' },
            { label: 'Tools & Cloud Platforms', field: 'toolsCloud' },
            { label: 'Soft Skills',             field: 'softSkills' },
          ].map(({ label, field }) => (
            <TagInput key={field} label={label}
              tags={technicalSkills[field]}
              onAdd={val => addSkillTag(field, val)}
              onRemove={idx => removeSkillTag(field, idx)}
              placeholder={`Add ${label.toLowerCase()} and press Enter`}
            />
          ))}
        </div>
      )}

      {/* ── STEP 5: Work Experience ───────────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Add your work history. You can use structured fields or paste raw experience text — AI will parse both.
          </p>
          {workExperience.map((exp, expIdx) => (
            <div key={expIdx} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 relative bg-zinc-50/30 dark:bg-zinc-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Experience #{expIdx + 1}
                </span>
                {workExperience.length > 1 && (
                  <button type="button"
                    onClick={() => setWorkExperience(workExperience.filter((_, i) => i !== expIdx))}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Paste raw toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company / Organisation">
                  <input type="text" value={exp.company}
                    onChange={e => updateExp(expIdx, 'company', e.target.value)}
                    className={inputClass} placeholder="Google, Microsoft, Startup Inc." />
                </Field>
                <Field label="Role / Job Title">
                  <input type="text" value={exp.role}
                    onChange={e => updateExp(expIdx, 'role', e.target.value)}
                    className={inputClass} placeholder="Software Engineer Intern" />
                </Field>
                <Field label="Start Date">
                  <input type="month" value={exp.startDate}
                    onChange={e => updateExp(expIdx, 'startDate', e.target.value)}
                    className={inputClass} />
                </Field>
                <Field label="End Date">
                  <input type="month" value={exp.endDate}
                    onChange={e => updateExp(expIdx, 'endDate', e.target.value)}
                    disabled={exp.isCurrent} className={inputClass} />
                </Field>
                <div className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" id={`current-${expIdx}`} checked={exp.isCurrent}
                    onChange={e => updateExp(expIdx, 'isCurrent', e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded" />
                  <label htmlFor={`current-${expIdx}`} className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Currently working here
                  </label>
                </div>
              </div>

              {/* Bullet points */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Key Achievements / Bullets (Google X-Y-Z format)
                </label>
                <ExpBulletInput onAdd={val => addExpBullet(expIdx, val)} />
                <ul className="mt-2 space-y-1">
                  {exp.bullets?.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2">
                      <span className="mt-0.5 text-zinc-400">•</span>
                      <span className="flex-1">{b}</span>
                      <button type="button" onClick={() => removeExpBullet(expIdx, bIdx)} className="text-zinc-400 hover:text-rose-500 shrink-0"><X size={12} /></button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Raw text fallback */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <FileText size={12} /> Paste Raw Experience Text (Optional — AI will parse)
                </label>
                <textarea rows={3} value={exp.rawText}
                  onChange={e => updateExp(expIdx, 'rawText', e.target.value)}
                  className={textareaClass}
                  placeholder="Paste your experience text here if you prefer. AI will extract and format it automatically."
                />
              </div>
            </div>
          ))}

          <button type="button"
            onClick={() => setWorkExperience([...workExperience, { ...emptyExp }])}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-dashed border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors w-full justify-center">
            <Plus size={14} /> Add Another Experience
          </button>
        </div>
      )}

      {/* ── STEP 6: Projects, Certifications, Achievements ────────────────── */}
      {step === 6 && (
        <div className="space-y-8">

          {/* Projects */}
          <section>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <FolderOpen size={16} className="text-blue-500" /> Projects
            </h3>
            <div className="space-y-5">
              {projects.map((proj, projIdx) => (
                <div key={projIdx} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-zinc-50/30 dark:bg-zinc-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Project #{projIdx + 1}</span>
                    {projects.length > 1 && (
                      <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== projIdx))}
                        className="text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Project Name *">
                      <input type="text" value={proj.name}
                        onChange={e => updateProj(projIdx, 'name', e.target.value)}
                        className={inputClass} placeholder="Portfolio Website, E-Commerce App" />
                    </Field>
                    <Field label="Live URL (Optional)">
                      <input type="text" value={proj.liveUrl}
                        onChange={e => updateProj(projIdx, 'liveUrl', e.target.value)}
                        className={inputClass} placeholder="https://myproject.com" />
                    </Field>
                    <Field label="Repository URL (Optional)">
                      <input type="text" value={proj.repoUrl}
                        onChange={e => updateProj(projIdx, 'repoUrl', e.target.value)}
                        className={inputClass} placeholder="https://github.com/user/repo" />
                    </Field>
                    <div className="md:col-span-2">
                      <TagInput label="Tech Stack Used"
                        tags={proj.techStack}
                        onAdd={val => addProjTech(projIdx, val)}
                        onRemove={tIdx => removeProjTech(projIdx, tIdx)}
                        placeholder="React, Node.js, PostgreSQL..." />
                    </div>
                    <Field label="Description / Impact" span2>
                      <textarea rows={2} value={proj.description}
                        onChange={e => updateProj(projIdx, 'description', e.target.value)}
                        className={textareaClass}
                        placeholder="Brief description of what you built and its impact (metrics welcome)" />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={() => setProjects([...projects, { ...emptyProj }])}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-dashed border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors w-full justify-center">
                <Plus size={14} /> Add Another Project
              </button>
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> Certifications
            </h3>
            <div className="space-y-3">
              {certifications.map((cert, cIdx) => (
                <div key={cIdx} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/30 dark:bg-zinc-950/20">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Certification Name</label>
                    <input type="text" value={cert.name}
                      onChange={e => { const u = [...certifications]; u[cIdx] = { ...u[cIdx], name: e.target.value }; setCertifications(u); }}
                      className={inputClass} placeholder="AWS Solutions Architect" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Issuer</label>
                    <input type="text" value={cert.issuer}
                      onChange={e => { const u = [...certifications]; u[cIdx] = { ...u[cIdx], issuer: e.target.value }; setCertifications(u); }}
                      className={inputClass} placeholder="Amazon Web Services" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">Date</label>
                      <input type="month" value={cert.date}
                        onChange={e => { const u = [...certifications]; u[cIdx] = { ...u[cIdx], date: e.target.value }; setCertifications(u); }}
                        className={inputClass} />
                    </div>
                    <button type="button" onClick={() => setCertifications(certifications.filter((_, i) => i !== cIdx))}
                      className="mt-6 text-rose-500 hover:text-rose-700 px-2"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button type="button"
                onClick={() => setCertifications([...certifications, { ...emptyCert }])}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-dashed border-emerald-400 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors w-full justify-center">
                <Plus size={14} /> Add Certification
              </button>
            </div>
          </section>

          {/* Achievements */}
          <section>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
              <ClipboardList size={16} className="text-amber-500" /> Achievements & Awards
            </h3>
            <div className="space-y-2">
              {achievements.map((ach, aIdx) => (
                <div key={aIdx} className="flex gap-2 items-center">
                  <input type="text" value={ach.text}
                    onChange={e => { const u = [...achievements]; u[aIdx] = { text: e.target.value }; setAchievements(u); }}
                    className={inputClass} placeholder="e.g. Won 1st place in national hackathon, 2024" />
                  <button type="button" onClick={() => setAchievements(achievements.filter((_, i) => i !== aIdx))}
                    className="text-rose-500 hover:text-rose-700 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button"
                onClick={() => setAchievements([...achievements, { ...emptyAchiev }])}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-dashed border-amber-400 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors w-full justify-center">
                <Plus size={14} /> Add Achievement
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-5">
        <button type="button"
          onClick={() => setStep(prev => Math.max(prev - 1, 1))}
          disabled={step === 1}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft size={16} /> Back
        </button>

        {step < 6 ? (
          <button type="button"
            onClick={() => setStep(prev => Math.min(prev + 1, 6))}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSave} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={16} /> Save Profile</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Inline helper: bullet input (needs its own state) ──────────────────────────
function ExpBulletInput({ onAdd }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <input type="text" value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(val); setVal(''); } }}
        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-950 dark:text-zinc-100"
        placeholder="e.g. Reduced API latency by 40% by optimising DB queries using Redis caching" />
      <button type="button"
        onClick={() => { onAdd(val); setVal(''); }}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 transition-colors">
        <Plus size={16} />
      </button>
    </div>
  );
}
