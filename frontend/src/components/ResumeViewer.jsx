import React, { useState, useRef, useEffect } from 'react';
import {
  Award, CheckCircle, AlertTriangle, Printer, Sparkles, AlertCircle,
  Copy, Check, Sun, Moon, ChevronDown, ChevronUp,
  Download, FileText, FileDown, Code2, Loader2
} from 'lucide-react';

// ─── Section wrapper (resume sheet) ───────────────────────────────────────────
function ResumeSection({ title, dark, children }) {
  return (
    <div className="mb-5">
      <h3 className={`text-[11px] font-extrabold uppercase tracking-[0.14em] border-b-2 pb-0.5 mb-2 ${
        dark ? 'text-zinc-200 border-zinc-500' : 'text-zinc-800 border-zinc-800'
      }`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Skill pill badge (for screen preview) ────────────────────────────────────
function SkillPill({ label, type, dark }) {
  const colors = {
    lang: dark
      ? 'bg-blue-900/50 text-blue-300 border-blue-700'
      : 'bg-blue-50 text-blue-800 border-blue-200',
    fw: dark
      ? 'bg-purple-900/50 text-purple-300 border-purple-700'
      : 'bg-purple-50 text-purple-800 border-purple-200',
    db: dark
      ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tool: dark
      ? 'bg-amber-900/50 text-amber-300 border-amber-700'
      : 'bg-amber-50 text-amber-800 border-amber-200',
    soft: dark
      ? 'bg-zinc-800 text-zinc-300 border-zinc-600'
      : 'bg-zinc-100 text-zinc-700 border-zinc-300',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border ${colors[type] || colors.soft}`}>
      {label}
    </span>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatMonthYear(val) {
  if (!val) return '';
  try {
    const [y, m] = val.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return val; }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Word-compatible HTML generator ──────────────────────────────────────────
function generateWordHTML(profile, resume) {
  const pi   = profile?.personalInfo   || {};
  const qual = profile?.qualification  || {};
  const job  = profile?.targetJob      || {};
  const sk   = profile?.technicalSkills || {};
  const exps = profile?.workExperience || [];
  const projs = profile?.projects      || [];
  const certs = profile?.certifications || [];
  const achs  = profile?.achievements  || [];

  const skillRows = [
    { label: 'Languages',    values: sk.languages  },
    { label: 'Frameworks',   values: sk.frameworks },
    { label: 'Databases',    values: sk.databases  },
    { label: 'Tools/Cloud',  values: sk.toolsCloud },
    { label: 'Soft Skills',  values: sk.softSkills },
  ].filter(r => r.values?.length > 0);

  const h = (tag, attrs, content) => `<${tag}${attrs ? ' ' + attrs : ''}>${content}</${tag}>`;
  const secTitle = (t) => `
    <p style="font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px;
              border-bottom:2px solid #1f2937;padding-bottom:2px;margin-bottom:6px;">${t}</p>`;

  let body = '';

  // Header
  body += `<div style="text-align:center;border-bottom:2px solid #1f2937;padding-bottom:12px;margin-bottom:16px;">
    <p style="font-size:22pt;font-weight:800;margin:0;">${pi.fullName || ''}</p>
    ${job.jobTitle ? `<p style="font-size:12pt;font-weight:600;color:#2563eb;margin:4px 0;">${job.jobTitle}</p>` : ''}
    <p style="font-size:9pt;color:#4b5563;margin:4px 0;">${[pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean).join(' | ')}</p>
  </div>`;

  // Summary
  if (resume?.summary) {
    body += secTitle('Professional Summary');
    body += `<p style="font-size:10pt;color:#1f2937;margin-bottom:12px;">${resume.summary}</p>`;
  }

  // Skills
  if (skillRows.length > 0) {
    body += secTitle('Technical Skills');
    body += '<table style="width:100%;margin-bottom:12px;font-size:9.5pt;">';
    skillRows.forEach(({ label, values }) => {
      body += `<tr>
        <td style="font-weight:700;width:110px;vertical-align:top;padding:1px 0;">${label}:</td>
        <td style="color:#1f2937;padding:1px 0;">${values.join(' • ')}</td>
      </tr>`;
    });
    body += '</table>';
  }

  // Work Experience
  const hasExp = exps.length > 0 || resume?.experienceBullets?.length > 0;
  if (hasExp) {
    body += secTitle('Professional Experience');
    if (exps.length > 0) {
      exps.forEach(exp => {
        const dateRange = `${formatMonthYear(exp.startDate)} – ${exp.isCurrent ? 'Present' : formatMonthYear(exp.endDate)}`;
        body += `<table style="width:100%;"><tr>
          <td style="font-weight:700;font-size:10.5pt;">${exp.role}</td>
          <td style="text-align:right;font-size:9pt;color:#4b5563;">${dateRange}</td>
        </tr></table>`;
        body += `<p style="font-size:9.5pt;font-style:italic;color:#4b5563;margin:2px 0 4px;">${exp.company}</p>`;
        if (exp.bullets?.length > 0) {
          body += '<ul style="margin:4px 0 10px;padding-left:18px;">';
          exp.bullets.forEach(b => { body += `<li style="font-size:9.5pt;margin-bottom:2px;">${b}</li>`; });
          body += '</ul>';
        }
      });
    } else if (resume?.experienceBullets?.length > 0) {
      body += `<p style="font-weight:700;font-size:10.5pt;">${job.jobTitle || 'Software Engineer'}</p>`;
      body += '<ul style="margin:4px 0 10px;padding-left:18px;">';
      resume.experienceBullets.forEach(b => { body += `<li style="font-size:9.5pt;margin-bottom:2px;">${b}</li>`; });
      body += '</ul>';
    }
  }

  // Projects
  const hasProj = projs.length > 0 || resume?.projectsBullets?.length > 0;
  if (hasProj) {
    body += secTitle('Projects');
    if (projs.length > 0) {
      projs.forEach(proj => {
        body += `<p style="font-weight:700;font-size:10.5pt;margin-bottom:2px;">${proj.name}`;
        if (proj.liveUrl) body += ` <a href="${proj.liveUrl}" style="color:#2563eb;font-weight:400;font-size:9pt;">[Live]</a>`;
        if (proj.repoUrl) body += ` <a href="${proj.repoUrl}" style="color:#2563eb;font-weight:400;font-size:9pt;">[Repo]</a>`;
        body += '</p>';
        if (proj.techStack?.length > 0) {
          body += `<p style="font-size:9pt;color:#4b5563;margin:1px 0;"><strong>Tech:</strong> ${proj.techStack.join(', ')}</p>`;
        }
        if (proj.description) {
          body += `<p style="font-size:9.5pt;color:#1f2937;margin:2px 0 8px;">${proj.description}</p>`;
        }
      });
    } else {
      body += '<ul style="margin:4px 0 10px;padding-left:18px;">';
      resume.projectsBullets.forEach(b => { body += `<li style="font-size:9.5pt;margin-bottom:2px;">${b}</li>`; });
      body += '</ul>';
    }
  }

  // Education
  if (qual.highestDegree) {
    body += secTitle('Education');
    body += `<table style="width:100%;"><tr>
      <td style="font-weight:700;font-size:10.5pt;">${qual.highestDegree}</td>
      <td style="text-align:right;font-size:9.5pt;color:#4b5563;">${qual.graduationYear || ''}</td>
    </tr></table>`;
    body += `<p style="font-size:9.5pt;font-style:italic;color:#4b5563;margin:2px 0;">
      ${qual.institution}${qual.cgpa ? ` &nbsp;|&nbsp; CGPA: ${qual.cgpa}` : ''}
    </p>`;
    if (qual.coursework?.length > 0) {
      body += `<p style="font-size:9pt;color:#4b5563;margin:2px 0 10px;"><strong>Coursework:</strong> ${qual.coursework.join(', ')}</p>`;
    }
  }

  // Certifications
  if (certs.length > 0) {
    body += secTitle('Certifications');
    body += '<ul style="margin:4px 0 10px;padding-left:18px;">';
    certs.forEach(cert => {
      body += `<li style="font-size:9.5pt;margin-bottom:2px;"><strong>${cert.name}</strong>${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${formatMonthYear(cert.date)})` : ''}</li>`;
    });
    body += '</ul>';
  }

  // Achievements
  if (achs.length > 0) {
    body += secTitle('Achievements & Awards');
    body += '<ul style="margin:4px 0 10px;padding-left:18px;">';
    achs.forEach(ach => { body += `<li style="font-size:9.5pt;margin-bottom:2px;">${ach.text}</li>`; });
    body += '</ul>';
  }

  return `<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Resume</title>
      <!--[if gte mso 9]>
        <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
      <![endif]-->
      <style>
        body { font-family: 'Calibri', sans-serif; margin: 72px; color: #111827; line-height: 1.4; }
        p { margin: 0; } ul { margin: 0; }
      </style>
    </head>
    <body>${body}</body>
  </html>`;
}

// ─── Plain text generator ─────────────────────────────────────────────────────
function generatePlainText(profile, resume) {
  const pi   = profile?.personalInfo   || {};
  const qual = profile?.qualification  || {};
  const job  = profile?.targetJob      || {};
  const sk   = profile?.technicalSkills || {};
  const exps = profile?.workExperience || [];
  const projs = profile?.projects      || [];
  const certs = profile?.certifications || [];
  const achs  = profile?.achievements  || [];
  const sep   = '─'.repeat(60);

  let out = '';
  out += `${pi.fullName || ''}\n`;
  if (job.jobTitle) out += `${job.jobTitle}\n`;
  const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);
  if (contacts.length) out += contacts.join('  |  ') + '\n';
  out += sep + '\n\n';

  if (resume?.summary) {
    out += `PROFESSIONAL SUMMARY\n${sep}\n${resume.summary}\n\n`;
  }

  const skillRows = [
    { label: 'Languages',   values: sk.languages  },
    { label: 'Frameworks',  values: sk.frameworks },
    { label: 'Databases',   values: sk.databases  },
    { label: 'Tools/Cloud', values: sk.toolsCloud },
    { label: 'Soft Skills', values: sk.softSkills },
  ].filter(r => r.values?.length > 0);
  if (skillRows.length > 0) {
    out += `TECHNICAL SKILLS\n${sep}\n`;
    skillRows.forEach(({ label, values }) => {
      out += `${label.padEnd(14)}: ${values.join(' • ')}\n`;
    });
    out += '\n';
  }

  if (exps.length > 0) {
    out += `PROFESSIONAL EXPERIENCE\n${sep}\n`;
    exps.forEach(exp => {
      const dr = `${formatMonthYear(exp.startDate)} – ${exp.isCurrent ? 'Present' : formatMonthYear(exp.endDate)}`;
      out += `${exp.role} at ${exp.company}  (${dr})\n`;
      exp.bullets?.forEach(b => { out += `  • ${b}\n`; });
      out += '\n';
    });
  } else if (resume?.experienceBullets?.length > 0) {
    out += `PROFESSIONAL EXPERIENCE\n${sep}\n`;
    out += `${job.jobTitle || 'Software Engineer'}\n`;
    resume.experienceBullets.forEach(b => { out += `  • ${b}\n`; });
    out += '\n';
  }

  if (projs.length > 0) {
    out += `PROJECTS\n${sep}\n`;
    projs.forEach(proj => {
      out += `${proj.name}`;
      if (proj.techStack?.length) out += `  [${proj.techStack.join(', ')}]`;
      out += '\n';
      if (proj.description) out += `  ${proj.description}\n`;
      out += '\n';
    });
  }

  if (qual.highestDegree) {
    out += `EDUCATION\n${sep}\n`;
    out += `${qual.highestDegree} — ${qual.institution}`;
    if (qual.graduationYear) out += `  (${qual.graduationYear})`;
    if (qual.cgpa) out += `  CGPA: ${qual.cgpa}`;
    out += '\n';
    if (qual.coursework?.length) out += `  Coursework: ${qual.coursework.join(', ')}\n`;
    out += '\n';
  }

  if (certs.length > 0) {
    out += `CERTIFICATIONS\n${sep}\n`;
    certs.forEach(c => {
      out += `• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${formatMonthYear(c.date)})` : ''}\n`;
    });
    out += '\n';
  }

  if (achs.length > 0) {
    out += `ACHIEVEMENTS & AWARDS\n${sep}\n`;
    achs.forEach(a => { out += `• ${a.text}\n`; });
  }

  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ResumeViewer({ initialResume, profile, onGenerationSuccess }) {
  const [resume, setResume]               = useState(initialResume || null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [darkPreview, setDarkPreview]     = useState(false);
  const [copied, setCopied]               = useState(false);
  const [showScore, setShowScore]         = useState(true);
  const [downloading, setDownloading]     = useState(null); // 'pdf'|'docx'|'txt'
  const [showDlMenu, setShowDlMenu]       = useState(false);
  const resumeRef                         = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#dl-menu-container')) setShowDlMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Derived profile data ─────────────────────────────────────────────────────
  const pi    = profile?.personalInfo    || {};
  const qual  = profile?.qualification   || {};
  const job   = profile?.targetJob       || {};
  const sk    = profile?.technicalSkills || {};
  const exps  = profile?.workExperience  || [];
  const projs = profile?.projects        || [];
  const certs = profile?.certifications  || [];
  const achs  = profile?.achievements    || [];

  const skillCategories = [
    { label: 'Languages',    values: sk.languages,  type: 'lang' },
    { label: 'Frameworks',   values: sk.frameworks, type: 'fw'   },
    { label: 'Databases',    values: sk.databases,  type: 'db'   },
    { label: 'Tools/Cloud',  values: sk.toolsCloud, type: 'tool' },
    { label: 'Soft Skills',  values: sk.softSkills, type: 'soft' },
  ].filter(r => r.values?.length > 0);

  // ── Generate via AI ──────────────────────────────────────────────────────────
  const generateAIResume = async () => {
    if (!profile) { setError('Please fill in and save your profile data first!'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate resume');
      setResume(data);
      if (onGenerationSuccess) onGenerationSuccess(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!resumeRef.current) return;
    await navigator.clipboard.writeText(resumeRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ── PDF download ─────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    setShowDlMenu(false);
    setDownloading('pdf');
    try {
      if (window.html2pdf) {
        await window.html2pdf()
          .set({
            margin:       [8, 10, 8, 10],
            filename:     `${pi.fullName || 'Resume'}_TechTrack.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(resumeRef.current)
          .save();
      } else {
        // Graceful fallback → browser print dialog
        window.print();
      }
    } finally { setDownloading(null); }
  };

  // ── DOCX download ────────────────────────────────────────────────────────────
  const downloadDOCX = () => {
    setShowDlMenu(false);
    const html  = generateWordHTML(profile, resume);
    const blob  = new Blob(['\ufeff', html], { type: 'application/msword' });
    triggerDownload(blob, `${pi.fullName || 'Resume'}_TechTrack.doc`);
  };

  // ── TXT download ─────────────────────────────────────────────────────────────
  const downloadTXT = () => {
    setShowDlMenu(false);
    const text = generatePlainText(profile, resume);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${pi.fullName || 'Resume'}_TechTrack.txt`);
  };

  // ── Shared download menu ─────────────────────────────────────────────────────
  const DL_OPTIONS = [
    {
      id: 'pdf',
      label: 'Download PDF',
      sub: 'Best for applications',
      icon: <FileDown size={14} className="text-rose-500" />,
      action: downloadPDF,
    },
    {
      id: 'docx',
      label: 'Download Word (.doc)',
      sub: 'Editable in MS Word',
      icon: <FileText size={14} className="text-blue-500" />,
      action: downloadDOCX,
    },
    {
      id: 'txt',
      label: 'Download Plain Text',
      sub: 'For ATS paste-in forms',
      icon: <Code2 size={14} className="text-zinc-500" />,
      action: downloadTXT,
    },
  ];

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Control Panel ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Award className="text-blue-600 h-5 w-5" />
              ATS-Optimized Resume Engine
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Generate, preview, and export your recruiter-ready resume.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">

            {/* Generate button */}
            <button id="generate-resume-btn" onClick={generateAIResume} disabled={loading || !profile}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm">
              {loading
                ? <Loader2 size={14} className="animate-spin" />
                : <Sparkles size={14} />}
              {resume ? 'Regenerate' : 'Generate with AI'}
            </button>

            {resume && (
              <>
                {/* Dark / Light preview toggle */}
                <button id="preview-toggle-btn" onClick={() => setDarkPreview(p => !p)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors">
                  {darkPreview
                    ? <Sun size={14} className="text-amber-400" />
                    : <Moon size={14} />}
                  {darkPreview ? 'Light Preview' : 'Dark Preview'}
                </button>

                {/* Copy text */}
                <button id="copy-resume-btn" onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors">
                  {copied
                    ? <><Check size={14} className="text-emerald-500" /> Copied!</>
                    : <><Copy size={14} /> Copy Text</>}
                </button>

                {/* ── Download dropdown ──────────────────────────────────────── */}
                <div id="dl-menu-container" className="relative">
                  <button id="download-menu-btn"
                    onClick={() => setShowDlMenu(p => !p)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">
                    {downloading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Download size={14} />}
                    Download
                    <ChevronDown size={12} className={`transition-transform ${showDlMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showDlMenu && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl w-56 overflow-hidden">
                      <div className="px-3 pt-2.5 pb-1">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Export Format</span>
                      </div>
                      {DL_OPTIONS.map(opt => (
                        <button key={opt.id} id={`download-${opt.id}-btn`}
                          onClick={opt.action}
                          disabled={!!downloading}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50">
                          <div className="mt-0.5 shrink-0">{opt.icon}</div>
                          <div className="text-left">
                            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{opt.label}</div>
                            <div className="text-[10px] text-zinc-400">{opt.sub}</div>
                          </div>
                          {downloading === opt.id && (
                            <Loader2 size={12} className="animate-spin ml-auto mt-1 text-zinc-400" />
                          )}
                        </button>
                      ))}
                      <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1">
                        <button id="print-resume-btn"
                          onClick={() => { setShowDlMenu(false); window.print(); }}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <Printer size={14} className="mt-0.5 shrink-0 text-zinc-400" />
                          <div className="text-left">
                            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Print / Save via Browser</div>
                            <div className="text-[10px] text-zinc-400">Opens print dialog</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400 rounded-lg p-3 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── ATS Analysis Panel ─────────────────────────────────────────────── */}
        {resume && (
          <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <button onClick={() => setShowScore(p => !p)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
              ATS Analysis {showScore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showScore && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score gauge */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">ATS Match Score</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-4xl font-extrabold ${
                      resume.atsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                      : resume.atsScore >= 60 ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                    }`}>{resume.atsScore}%</span>
                    <span className="text-xs text-zinc-500 font-semibold">Match Rate</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${
                      resume.atsScore >= 80 ? 'bg-emerald-500'
                      : resume.atsScore >= 60 ? 'bg-amber-500'
                      : 'bg-rose-500'
                    }`} style={{ width: `${resume.atsScore}%` }} />
                  </div>
                </div>

                {/* Matched keywords */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" />
                    Matched ({resume.atsKeywordsMatched?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resume.atsKeywordsMatched?.map((kw, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-md">{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Missing keywords */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-500" />
                    Gap Keywords ({resume.atsKeywordsMissing?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resume.atsKeywordsMissing?.map((kw, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 bg-amber-100/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 rounded-md">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Resume Sheet ─────────────────────────────────────────────────────── */}
      {resume ? (
        <div
          ref={resumeRef}
          id="resume-printable"
          className={`p-8 md:p-12 border shadow-lg rounded-2xl mx-auto max-w-[800px] print-shadow-none font-serif leading-relaxed transition-colors duration-300 ${
            darkPreview
              ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
              : 'bg-white text-zinc-950 border-zinc-200'
          }`}
        >
          {/* ── Header ───────────────────────────────────────────────────────── */}
          <div className={`text-center border-b pb-4 mb-5 ${darkPreview ? 'border-zinc-700' : 'border-zinc-300'}`}>
            <h1 className="text-[26px] font-extrabold tracking-tight mb-0.5">{pi.fullName || 'Your Name'}</h1>
            {job.jobTitle && (
              <p className={`text-sm font-bold mb-1.5 ${darkPreview ? 'text-blue-400' : 'text-blue-700'}`}>{job.jobTitle}</p>
            )}
            <div className={`flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[11px] font-sans ${darkPreview ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {pi.email    && <span>{pi.email}</span>}
              {pi.phone    && <span>• {pi.phone}</span>}
              {pi.linkedin && <a href={pi.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">• LinkedIn</a>}
              {pi.github   && <a href={pi.github}   target="_blank" rel="noopener noreferrer" className="hover:underline">• GitHub</a>}
              {pi.portfolio && <a href={pi.portfolio} target="_blank" rel="noopener noreferrer" className="hover:underline">• Portfolio</a>}
            </div>
          </div>

          {/* ── Professional Summary ────────────────────────────────────────── */}
          {resume.summary && (
            <ResumeSection title="Professional Summary" dark={darkPreview}>
              <p className={`text-[12px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {resume.summary}
              </p>
            </ResumeSection>
          )}

          {/* ── Technical Skills ──────────────────────────────────────────────
               On screen: pill badges grouped by category
               On print:  plain text rows (ATS-friendly)                        */}
          {skillCategories.length > 0 && (
            <ResumeSection title="Technical Skills" dark={darkPreview}>
              {/* Screen view — pill badges */}
              <div className="space-y-2 no-print">
                {skillCategories.map(({ label, values, type }) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold shrink-0 w-24 pt-0.5 ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {label}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {values.map((v, i) => (
                        <SkillPill key={i} label={v} type={type} dark={darkPreview} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Print view — plain text */}
              <div className="hidden print:block space-y-0.5">
                {skillCategories.map(({ label, values }) => (
                  <div key={label} className="flex gap-2 text-[11px] text-zinc-800">
                    <span className="font-bold shrink-0 w-24">{label}:</span>
                    <span>{values.join(' • ')}</span>
                  </div>
                ))}
              </div>
            </ResumeSection>
          )}

          {/* ── Professional Experience ─────────────────────────────────────── */}
          {(exps.length > 0 || resume.experienceBullets?.length > 0) && (
            <ResumeSection title="Professional Experience" dark={darkPreview}>
              <div className="space-y-4">
                {exps.length > 0 ? (
                  exps.map((exp, i) => (
                    <div key={i}>
                      <div className={`flex justify-between text-[12px] font-bold ${darkPreview ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        <span>{exp.role || job.jobTitle || 'Role'}</span>
                        <span className="font-normal font-sans text-[11px] text-zinc-500">
                          {formatMonthYear(exp.startDate)} – {exp.isCurrent ? 'Present' : formatMonthYear(exp.endDate)}
                        </span>
                      </div>
                      <div className={`text-[11px] italic mb-1.5 ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}>{exp.company}</div>
                      {exp.bullets?.length > 0 && (
                        <ul className="list-disc pl-5 space-y-0.5">
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{b}</li>
                          ))}
                        </ul>
                      )}
                      {/* Fallback: AI bullets on first entry if no manual bullets */}
                      {exp.bullets?.length === 0 && resume.experienceBullets?.length > 0 && i === 0 && (
                        <ul className="list-disc pl-5 space-y-0.5">
                          {resume.experienceBullets.map((b, bi) => (
                            <li key={bi} className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div>
                    <div className={`flex justify-between text-[12px] font-bold ${darkPreview ? 'text-zinc-100' : 'text-zinc-900'}`}>
                      <span>{job.jobTitle || 'Software Engineer'}</span>
                      <span className="font-normal font-sans text-[11px] text-zinc-500">Present</span>
                    </div>
                    <ul className="list-disc pl-5 mt-1.5 space-y-0.5">
                      {resume.experienceBullets?.map((b, i) => (
                        <li key={i} className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ResumeSection>
          )}

          {/* ── Projects ─────────────────────────────────────────────────────── */}
          {(projs.length > 0 || resume.projectsBullets?.length > 0) && (
            <ResumeSection title="Projects" dark={darkPreview}>
              <div className="space-y-3">
                {projs.length > 0 ? (
                  projs.map((proj, i) => (
                    <div key={i}>
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className={`text-[12px] font-bold ${darkPreview ? 'text-zinc-100' : 'text-zinc-900'}`}>{proj.name}</span>
                        <div className={`flex gap-3 text-[10px] font-sans font-semibold ${darkPreview ? 'text-blue-400' : 'text-blue-600'}`}>
                          {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Live ↗</a>}
                          {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Repo ↗</a>}
                        </div>
                      </div>
                      {proj.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 my-1 no-print">
                          {proj.techStack.map((t, ti) => (
                            <span key={ti} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${darkPreview ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>{t}</span>
                          ))}
                        </div>
                      )}
                      {/* Print-friendly tech stack */}
                      {proj.techStack?.length > 0 && (
                        <p className={`text-[10px] hidden print:block mb-0.5 ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <span className="font-semibold">Tech:</span> {proj.techStack.join(', ')}
                        </p>
                      )}
                      {proj.description && (
                        <p className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{proj.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <ul className="list-disc pl-5 space-y-0.5">
                    {resume.projectsBullets?.map((b, i) => (
                      <li key={i} className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </ResumeSection>
          )}

          {/* ── Education ────────────────────────────────────────────────────── */}
          {qual.highestDegree && (
            <ResumeSection title="Education" dark={darkPreview}>
              <div className={`flex justify-between text-[12px] font-bold ${darkPreview ? 'text-zinc-100' : 'text-zinc-900'}`}>
                <span>{qual.highestDegree}</span>
                <span className="font-normal font-sans text-[11px] text-zinc-500">{qual.graduationYear}</span>
              </div>
              <div className={`flex justify-between text-[11px] italic ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <span>{qual.institution}</span>
                {qual.cgpa && <span className="font-sans not-italic">CGPA: {qual.cgpa}</span>}
              </div>
              {qual.coursework?.length > 0 && (
                <p className={`text-[10px] mt-0.5 ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  <span className="font-semibold">Coursework:</span> {qual.coursework.join(', ')}
                </p>
              )}
            </ResumeSection>
          )}

          {/* ── Certifications ───────────────────────────────────────────────── */}
          {certs.length > 0 && (
            <ResumeSection title="Certifications" dark={darkPreview}>
              <ul className="space-y-1">
                {certs.map((cert, i) => (
                  <li key={i} className={`flex justify-between text-[11px] ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    <span>
                      <span className="font-semibold">{cert.name}</span>
                      {cert.issuer && <span className={`font-sans ${darkPreview ? 'text-zinc-400' : 'text-zinc-500'}`}> — {cert.issuer}</span>}
                    </span>
                    {cert.date && <span className={`font-sans text-[10px] shrink-0 ${darkPreview ? 'text-zinc-500' : 'text-zinc-400'}`}>{formatMonthYear(cert.date)}</span>}
                  </li>
                ))}
              </ul>
            </ResumeSection>
          )}

          {/* ── Achievements ─────────────────────────────────────────────────── */}
          {achs.length > 0 && (
            <ResumeSection title="Achievements & Awards" dark={darkPreview}>
              <ul className="list-disc pl-5 space-y-0.5">
                {achs.map((ach, i) => (
                  <li key={i} className={`text-[11px] leading-relaxed ${darkPreview ? 'text-zinc-300' : 'text-zinc-700'}`}>{ach.text}</li>
                ))}
              </ul>
            </ResumeSection>
          )}
        </div>

      ) : (
        /* ── Empty State ────────────────────────────────────────────────────── */
        <div className="bg-zinc-50 dark:bg-[#0c0c0f]/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <Award size={48} className="text-zinc-400 dark:text-zinc-600 mb-4 animate-pulse" />
          <h3 className="text-md font-bold text-zinc-950 dark:text-zinc-50 mb-1">No Resume Generated Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6">
            Click &quot;Generate with AI&quot; to create an ATS-optimized resume. Fill out your complete profile first for best results.
          </p>
          <button id="empty-generate-btn" onClick={generateAIResume} disabled={loading || !profile}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <Sparkles size={14} />}
            Generate with AI
          </button>
        </div>
      )}
    </div>
  );
}
