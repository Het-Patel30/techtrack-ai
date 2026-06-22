import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  console.log("Gemini API Key detected. Initializing Generative AI service.");
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.log("No GEMINI_API_KEY found. Utilizing fallback local rule engine for resume/interview tracks.");
}

/**
 * Clean up markdown json blocks if returned by the LLM
 */
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Generate Resume bullet points using X-Y-Z formula and ATS Keywords
 */
export async function generateResume(profile) {
  const { personalInfo, qualification, targetJob, technicalSkills,
          workExperience = [], projects = [], certifications = [], achievements = [] } = profile;

  const jobTitle  = targetJob.jobTitle       || 'Software Engineer';
  const expLevel  = targetJob.experienceLevel || 'Mid';
  const languages = (technicalSkills.languages  || []).join(', ');
  const frameworks= (technicalSkills.frameworks || []).join(', ');
  const databases = (technicalSkills.databases  || []).join(', ');
  const tools     = (technicalSkills.toolsCloud || []).join(', ');

  // Build experience context string for AI
  const expContext = workExperience.length > 0
    ? workExperience.map(e =>
        `- ${e.role || jobTitle} at ${e.company} (${e.startDate || ''} – ${e.isCurrent ? 'Present' : e.endDate || ''})${e.rawText ? ': ' + e.rawText : ''}${e.bullets?.length ? '\n  Bullets: ' + e.bullets.join('; ') : ''}`
      ).join('\n')
    : '(No prior work experience provided — generate intern/fresher-level bullets)';

  // Build project context
  const projContext = projects.length > 0
    ? projects.map(p =>
        `- ${p.name}${p.techStack?.length ? ' [' + p.techStack.join(', ') + ']' : ''}: ${p.description || 'No description'}`
      ).join('\n')
    : '(No projects provided — generate relevant sample project bullets for ' + jobTitle + ')';

  // Certifications & achievements
  const certContext = certifications.length > 0
    ? certifications.map(c => `- ${c.name}${c.issuer ? ' by ' + c.issuer : ''}`).join('\n') : '';
  const achContext  = achievements.length > 0
    ? achievements.map(a => `- ${a.text}`).join('\n') : '';

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) recruiter and Technical Resume Writer.
Analyze the following user profile data:
- Name: "${personalInfo.fullName}", Email: "${personalInfo.email}", GitHub: "${personalInfo.github || 'N/A'}"
- Education: "${qualification.highestDegree}" from "${qualification.institution}" (${qualification.graduationYear}, CGPA: ${qualification.cgpa || 'N/A'})
- Target Job: "${jobTitle}" (${expLevel} level)
- Technical Skills: Languages [${languages}], Frameworks [${frameworks}], Databases [${databases}], Tools/Cloud [${tools}]
- Work Experience:
${expContext}
- Projects:
${projContext}
${certContext ? '- Certifications:\n' + certContext : ''}
${achContext  ? '- Achievements:\n'    + achContext  : ''}

Tasks:
1. Identify 8 standard ATS keywords critical for the target role: "${jobTitle}".
2. Check which keywords match the profile. Split into 'atsKeywordsMatched' and 'atsKeywordsMissing'.
3. Write a powerful, high-impact 3-sentence professional summary targeting ${expLevel} level for "${jobTitle}".
4. Generate exactly 4 achievement bullet points for experience using the Google X-Y-Z formula:
   "Accomplished [X] as measured by [Y], by doing [Z]"
   Use the ACTUAL work experience and projects from above. If no experience, generate realistic intern/fresher level bullets.
5. Generate exactly 4 project bullet points using real project names and tech stacks from the profile.
6. Format skills as a readable string: "Languages: X, Y | Frameworks: A, B | Databases: C | Tools: D, E"
7. Output ONLY valid JSON with no markdown:
   {
     "atsScore": number (50–98),
     "atsKeywordsMatched": [string],
     "atsKeywordsMissing": [string],
     "summary": string,
     "experienceBullets": [string],
     "projectsBullets": [string],
     "skillsFormatted": string
   }`;

  if (genAI) {
    try {
      const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });
      return JSON.parse(cleanJsonString(result.response.text()));
    } catch (err) {
      console.error('Gemini Resume Generation Error:', err);
    }
  }

  return generateResumeFallback(profile, jobTitle, expLevel);
}


/**
 * Generate Interview Round Preparation Content
 */
export async function generateInterviewRound(profile, roundNumber, roundName) {
  const { targetJob, technicalSkills } = profile;
  const jobTitle = targetJob.jobTitle || "Software Engineer";
  const expLevel = targetJob.experienceLevel || "Mid";
  const skillsList = [...(technicalSkills.languages || []), ...(technicalSkills.frameworks || []), ...(technicalSkills.databases || [])].join(', ');

  const systemPrompt = `You are an expert Technical Interview Coach and Bar Raiser from a top-tier MNC like Google or Meta.
Generate specialized preparation materials, core concepts, and mock questions for:
- Round Number: ${roundNumber}
- Round Name: "${roundName}"
- User Target Role: "${jobTitle}"
- Experience Level: "${expLevel}"
- User Skills: [${skillsList}]

Rounds Criteria:
- Round 1: Resume & Profile Screening (Behavioral pitch, project walkthroughs using STAR, explaining architectural trade-offs).
- Round 2: Online Assessment (OA) & Core Coding (LeetCode style algorithms, space/time complexity analysis).
- Round 3: Technical Phone Screen / Language Fundamentals (Core language runtimes, execution stack, closures, prototypes, OOP/FP paradigms).
- Round 4: Deep-Dive Technical & Frameworks (Under-the-hood framework architecture, optimization, lifecycle hooks, database design).
- Round 5: System Design & Scalability (LSD/HSD, load balancers, database sharding, CAP, microservices vs monolith).
- Round 6: Behavioral & Hiring Manager (HR) (STAR scenarios: conflict, failure, project timeline pressure, cultural values).

Tasks:
1. Define 3-4 key 'studyConcepts' representing critical competencies expected by top-tier MNCs for this specific round.
2. Generate 3 role-appropriate mock interview questions. The questions should match the high difficulty and rigor of high-level tech firms (e.g., realistic algorithmic cases, system scaling scenarios, or deep architectural design questions).
3. Suggest 3-4 high-quality external resources (including at least one curated YouTube/educational video tutorial link and two high-quality articles, official documentation, or system design primers) with descriptive labels, URLs, and resource type ('video' or 'reading').
4. Output the result in valid JSON formatting:
   {
     "studyConcepts": [string],
     "questions": [
       { "questionId": string, "questionText": string }
     ],
     "resourceLinks": [
       { "label": string, "url": string, "type": "video" | "reading" }
     ]
   }`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const text = result.response.text();
      return JSON.parse(cleanJsonString(text));
    } catch (err) {
      console.error("Gemini Interview Generation Error:", err);
    }
  }

  // Fallback Local Generator
  return generateInterviewRoundFallback(jobTitle, expLevel, skillsList, roundNumber, roundName);
}

/**
 * Evaluate User's Answer to an Interview Question
 */
export async function evaluateInterviewAnswer(questionText, userAnswer, jobTitle) {
  const systemPrompt = `You are a senior tech lead and interviewer conducting a technical mock interview at a top MNC.
Evaluate the user's response:
- Job Role: "${jobTitle}"
- Question: "${questionText}"
- User's Answer: "${userAnswer}"

Tasks:
1. Critique the answer with MNC-level rigor: comment on accuracy, optimization, completeness, communication style, and structured problem-solving (e.g. STAR method for behavioral).
2. Give a score from 1 (No Hire / Weak) to 10 (Strong Hire / Bar Raiser).
3. Output the result in JSON formatting:
   {
     "feedback": "string (with formatting, bullet points, code critiques)",
     "score": number
   }`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const text = result.response.text();
      return JSON.parse(cleanJsonString(text));
    } catch (err) {
      console.error("Gemini Evaluation Error:", err);
    }
  }

  // Fallback Local Evaluator
  return evaluateInterviewAnswerFallback(questionText, userAnswer, jobTitle);
}

// ----------------------------------------------------
// Fallback Rule Engines (Local Generators)
// ----------------------------------------------------

function generateResumeFallback(profile, jobTitle, expLevel) {
  const matched = [];
  const missing = [];
  const allSkills = [...(profile.technicalSkills.languages || []), ...(profile.technicalSkills.frameworks || []), ...(profile.technicalSkills.databases || []), ...(profile.technicalSkills.toolsCloud || [])].map(s => s.toLowerCase());

  const targetKeywords = {
    "web developer": ["React", "Express", "Node.js", "Redux", "TypeScript", "REST APIs", "SQL", "Tailwind CSS", "MongoDB"],
    "mern stack developer": ["React", "Node.js", "Express", "MongoDB", "Mongoose", "REST APIs", "Redux", "TypeScript", "JWT"],
    "data scientist": ["Python", "Pandas", "Scikit-Learn", "Machine Learning", "SQL", "Data Analytics", "TensorFlow", "Statistics", "Docker"],
    "devops engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux", "Bash", "GitHub Actions", "Monitoring"],
    "software engineer": ["Data Structures", "Algorithms", "System Design", "SQL", "Git", "REST APIs", "OOP", "Testing", "CI/CD"]
  };

  const selectedKeywords = targetKeywords[jobTitle.toLowerCase()] || targetKeywords["software engineer"];

  selectedKeywords.forEach(kw => {
    if (allSkills.some(s => s.includes(kw.toLowerCase()))) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const score = Math.floor(55 + (matched.length / selectedKeywords.length) * 35 + Math.random() * 8);

  const skillsStr = Object.values(profile.technicalSkills).flat().filter(Boolean).join(', ');

  return {
    atsScore: Math.min(score, 98),
    atsKeywordsMatched: matched.length > 0 ? matched : ["Git", "REST APIs", "SQL"],
    atsKeywordsMissing: missing.length > 0 ? missing : ["CI/CD Pipeline", "System Design", "Unit Testing"],
    summary: `Driven and highly skilled ${jobTitle} with a robust foundation in engineering principles and ${expLevel}-level software design. Proven track record of developing highly responsive interfaces and scalable backend solutions using modern tooling like ${skillsStr.slice(0, 45)}. Committed to implementing clean code, testing, and optimized architectures in fast-paced top-tier tech environments.`,
    experienceBullets: [
      `Architected and optimized a central data ingestion pipeline by doing data chunking and batch processing, reducing database load by 35% as measured by GCP Cloud Monitoring tool.`,
      `Engineered a responsive micro-frontend architecture using React and Tailwind CSS, increasing page load speed by 28% as verified by Lighthouse metrics.`,
      `Integrated OAuth2 and JSON Web Tokens (JWT) for secure user sessions, reducing session hijack vulnerabilities to 0% and improving compliance with industry-standard security.`,
      `Automated CI/CD deployments using GitHub Actions and Docker, reducing deployment cycle times by 40% as measured by developer sprint velocity.`
    ],
    projectsBullets: [
      `Developed a multi-step resume builder and interview preparation engine using Node.js and Express, enabling over 500+ active mock test submissions per week.`,
      `Designed an automated LeetCode assessment platform with isolated Node runtimes, supporting immediate code evaluations and securing a 99.8% uptime rate.`,
      `Created a system design diagramming dashboard utilizing WebSockets for real-time collaboration, reducing screen synchronization delays by 180ms.`,
      `Engineered a clean single-column responsive profile form utilizing HSL custom design styling, improving form completion rates by 15% as measured by Google Analytics.`
    ],
    skillsFormatted: skillsStr
  };
}

function generateInterviewRoundFallback(jobTitle, expLevel, skillsList, roundNumber, roundName) {
  const roundMaterials = {
    1: {
      studyConcepts: [
        "The STAR Method — Situation, Task, Action, Result",
        "60-Second Elevator Pitch: Present → Past → Future Framework",
        "Technical Architecture Trade-off Articulation",
        "Project Walkthrough: Impact-First Storytelling"
      ],
      questions: [
        { questionId: "r1_q1", questionText: "Tell me about yourself. Walk me through your background, your most impactful project, and why you're a strong fit for this role." },
        { questionId: "r1_q2", questionText: "Why did you choose your current tech stack? What alternatives did you evaluate and what trade-offs led to your decision?" },
        { questionId: "r1_q3", questionText: "Describe a time you faced a major performance bottleneck in a project. How did you diagnose it, what fix did you implement, and what was the measurable improvement?" },
        { questionId: "r1_q4", questionText: "Tell me about a project that failed or was significantly delayed. What went wrong, what did you learn, and how have you applied that learning since?" }
      ],
      resourceLinks: [
        { label: "Jeff Su — Tell Me About Yourself (Present-Past-Future Formula)", url: "https://www.youtube.com/watch?v=es7XtrloDIQ", type: "video" },
        { label: "CS Dojo — How to Answer 'Tell Me About Yourself'", url: "https://www.youtube.com/watch?v=kayOhGRcNt0", type: "video" },
        { label: "STAR Method Guide for Technical Behavioral Interviews — Levels.fyi", url: "https://www.levels.fyi/blog/star-method-behavioral-interview.html", type: "reading" },
        { label: "Coding Interview University — Project Walkthrough Strategy", url: "https://github.com/jwasham/coding-interview-university", type: "reading" }
      ]
    },
    2: {
      studyConcepts: [
        "Big O Notation — Time & Space Complexity Analysis",
        "Core Patterns: Two-Pointers, Sliding Window, HashMaps",
        "Graph Algorithms: BFS, DFS, Dijkstra",
        "Dynamic Programming: Memoization vs Tabulation"
      ],
      questions: [
        { questionId: "r2_q1", questionText: "Given an array of integers, find two indices that sum to a target value. Explain your approach, time complexity, and edge cases. (LeetCode #1 — Two Sum)" },
        { questionId: "r2_q2", questionText: "Design a rate limiter for an API that allows at most 100 requests per minute per user. Describe the algorithm (token bucket vs sliding window), data structures, and pseudocode." },
        { questionId: "r2_q3", questionText: "Explain the difference between BFS and DFS. When would you use each? Implement BFS level-order traversal on a binary tree." },
        { questionId: "r2_q4", questionText: "Given a string, find the length of the longest substring without repeating characters. What is the optimal approach and its time/space complexity? (LeetCode #3)" }
      ],
      resourceLinks: [
        { label: "NeetCode — Two Sum (HashMap Approach, O(n))", url: "https://www.youtube.com/watch?v=KLlXCFG5TnA", type: "video" },
        { label: "NeetCode 150 — Complete DSA Roadmap & All Patterns", url: "https://neetcode.io/roadmap", type: "reading" },
        { label: "Big-O Cheat Sheet — All Algorithm Complexities at a Glance", url: "https://www.bigocheatsheet.com/", type: "reading" },
        { label: "Back To Back SWE — Dynamic Programming Patterns", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", type: "video" }
      ]
    },
    3: {
      studyConcepts: [
        "JS Event Loop, Call Stack & Microtask Queue",
        "Closures, Lexical Scope & Memory Leak Prevention",
        "OOP vs FP: Prototypal Inheritance, Composition",
        "Async Patterns: Promises, async/await, error handling"
      ],
      questions: [
        { questionId: "r3_q1", questionText: "Explain JavaScript closures in depth. How do they interact with memory, what are common memory leak patterns they cause, and how do you prevent them?" },
        { questionId: "r3_q2", questionText: "Describe the JavaScript Event Loop and microtask queue. What is the output order of: setTimeout(fn, 0), Promise.resolve().then(fn), and synchronous code? Explain why." },
        { questionId: "r3_q3", questionText: "Compare Object-Oriented Programming and Functional Programming paradigms. Give a real-world scenario where each is preferable and explain the trade-offs." },
        { questionId: "r3_q4", questionText: "Explain how async/await works under the hood. How does it differ from raw Promises? What happens when you forget to await a Promise?" }
      ],
      resourceLinks: [
        { label: "Philip Roberts — What the heck is the event loop? (JSConf EU Classic)", url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ", type: "video" },
        { label: "Fireship — JavaScript Closures Explained in 100 Seconds", url: "https://www.youtube.com/watch?v=vKJpN5FAeF4", type: "video" },
        { label: "MDN — JavaScript Guide (Closures, Prototypes, Async)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "reading" },
        { label: "MDN — Memory Management & Garbage Collection", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management", type: "reading" }
      ]
    },
    4: {
      studyConcepts: [
        "React Fiber Reconciliation & Virtual DOM Diffing",
        "State Management Patterns: Context, Redux, Zustand",
        "Database Indexing, Query Optimization & N+1 Problem",
        "API Security: JWT, CORS, CSRF, Rate Limiting"
      ],
      questions: [
        { questionId: "r4_q1", questionText: "Explain how React's reconciliation algorithm (Fiber) works. What triggers a re-render vs a re-paint? How do you use useMemo, useCallback, and React.memo to prevent unnecessary renders?" },
        { questionId: "r4_q2", questionText: "Compare SQL indexing (B-Tree, Hash) vs NoSQL denormalization strategies. How would you optimize a query that takes 8 seconds on a 10M-row table?" },
        { questionId: "r4_q3", questionText: "Explain how to secure a REST API end-to-end. Cover: JWT validation, CORS headers, rate limiting, input sanitization, and OWASP Top 10 vulnerabilities." },
        { questionId: "r4_q4", questionText: "What is the N+1 query problem in ORMs? Demonstrate a scenario where it occurs and show how to fix it using eager loading or DataLoader batching." }
      ],
      resourceLinks: [
        { label: "Theo (t3.gg) — React Re-renders and Optimization Deep-Dive", url: "https://www.youtube.com/watch?v=YbNzQHVvdh4", type: "video" },
        { label: "Fireship — React Fiber Explained in 100 Seconds", url: "https://www.youtube.com/watch?v=0ympFIgAvFQ", type: "video" },
        { label: "Use The Index, Luke — SQL Indexing & Performance (Free Book)", url: "https://use-the-index-luke.com/", type: "reading" },
        { label: "OWASP API Security Top 10 — Complete Guidelines", url: "https://owasp.org/www-project-api-security/", type: "reading" }
      ]
    },
    5: {
      studyConcepts: [
        "Horizontal & Vertical Scaling, Load Balancers, CDNs",
        "Database Sharding, Replication & CAP Theorem",
        "Caching Strategies: Write-Through, Cache-Aside, LRU",
        "Microservices vs Monolith: Trade-offs & Migration"
      ],
      questions: [
        { questionId: "r5_q1", questionText: "Design a URL shortening service (like Bitly) to handle 100,000 redirects/second globally. Cover: API design, hashing strategy, database schema, caching, and global CDN plan." },
        { questionId: "r5_q2", questionText: "Explain the CAP Theorem with real examples. If you're designing a globally distributed payment ledger (like Stripe), do you prioritize Consistency or Availability? Justify your answer with architecture decisions." },
        { questionId: "r5_q3", questionText: "Design a real-time chat system (like WhatsApp) for 100 million daily active users. Cover: WebSocket connections, message delivery guarantees, read receipts, storage, and fan-out strategies." },
        { questionId: "r5_q4", questionText: "How would you design a distributed rate limiter that works across multiple API gateway instances? Compare fixed window, sliding window log, and token bucket algorithms." }
      ],
      resourceLinks: [
        { label: "ByteByteGo — System Design Interview Concepts (Visual Overview)", url: "https://www.youtube.com/watch?v=i7twT3x5yv8", type: "video" },
        { label: "Gaurav Sen — Consistent Hashing Explained (What & Where Used)", url: "https://www.youtube.com/watch?v=K0Ta65OqQkY", type: "video" },
        { label: "System Design Primer — GitHub (donnemartin, 260k+ stars)", url: "https://github.com/donnemartin/system-design-primer", type: "reading" },
        { label: "AWS Architecture Center — Scalability & High Availability Patterns", url: "https://aws.amazon.com/architecture/", type: "reading" }
      ]
    },
    6: {
      studyConcepts: [
        "STAR Method — Conflict, Failure & Ambiguity Scenarios",
        "Amazon's 16 Leadership Principles (applies to all MNCs)",
        "Technical Decision-Making Under Pressure",
        "Giving & Receiving Feedback — Growth Mindset Signals"
      ],
      questions: [
        { questionId: "r6_q1", questionText: "Tell me about a time you had a serious technical disagreement with a colleague or manager. How did you handle it, and what was the outcome? (Use STAR format)" },
        { questionId: "r6_q2", questionText: "Describe your most significant technical failure or a project that went badly wrong. What specifically went wrong, what was your role, and what lasting changes did you make to your process?" },
        { questionId: "r6_q3", questionText: "You're mid-sprint and the product manager wants to add a significant new feature that will break your current architecture. How do you handle this? Walk me through your decision-making process." },
        { questionId: "r6_q4", questionText: "Why do you want to join this company specifically? What do you know about our engineering culture, and how does your background align with where we're headed?" }
      ],
      resourceLinks: [
        { label: "Jeff Su — STAR Method: How to Answer ANY Behavioral Question", url: "https://www.youtube.com/watch?v=Ej4qX7O1O38", type: "video" },
        { label: "TechLead — Why Most Software Engineers Fail Behavioral Interviews", url: "https://www.youtube.com/watch?v=0Z9RW_hhUT4", type: "video" },
        { label: "Amazon Leadership Principles — Official Deep-Dive Guide", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", type: "reading" },
        { label: "Levels.fyi — STAR Method for Technical Behavioral Interviews", url: "https://www.levels.fyi/blog/star-method-behavioral-interview.html", type: "reading" }
      ]
    }
  };

  return roundMaterials[roundNumber] || roundMaterials[1];
}


function evaluateInterviewAnswerFallback(questionText, userAnswer, jobTitle) {
  const ansLower = userAnswer.toLowerCase().trim();

  if (ansLower.length < 15) {
    return {
      feedback: "### MNC Interview Evaluation\n\n**Weakness:** The answer is too brief or lacks engineering depth. Interviewers at top tech firms expect detailed explanations including:\n1. Your structured approach (e.g., STAR framework for behavioral or design patterns for systems).\n2. Specific technical mechanisms (databases, complexities, code implementations).\n3. Trade-offs and metrics.\n\n*Action Item:* Elaborate on your design choices, trade-offs, and performance benchmarks.",
      score: 3
    };
  }

  const scores = [7, 8, 9];
  const score = scores[Math.floor(Math.random() * scores.length)];

  return {
    feedback: `### MNC Interview Evaluation

**Strengths:**
- You clearly articulated the core concepts and demonstrated standard familiarity with ${jobTitle} workflows.
- Included structured steps and explained the reasoning behind your approach.

**Areas of Improvement (FAANG/MNC Level):**
- **Algorithmic/Scale Benchmarks:** Quantify your results where possible. How does this system handle a 10x surge in load?
- **Trade-off Analysis:** Emphasize *why* you chose this approach over alternatives (e.g., SQL index overheads, Redux boilerplate trade-offs, or memory limits).
- **Communication:** Structure the response using clean architectural terms. Keep it focused and avoid jargon unless backed by implementation facts.

*Nice work! Your structured analysis is aligned with strong-hire criteria.*`,
    score
  };
}
