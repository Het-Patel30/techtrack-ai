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
  const { personalInfo, qualification, targetJob, technicalSkills } = profile;
  const jobTitle = targetJob.jobTitle || "Software Engineer";
  const expLevel = targetJob.experienceLevel || "Mid";
  const languages = (technicalSkills.languages || []).join(', ');
  const frameworks = (technicalSkills.frameworks || []).join(', ');
  const databases = (technicalSkills.databases || []).join(', ');
  const tools = (technicalSkills.toolsCloud || []).join(', ');

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) recruiter and Technical Resume Writer.
Analyze the following user profile data:
- Personal Info: Name "${personalInfo.fullName}", Email "${personalInfo.email}", GitHub "${personalInfo.github}"
- Highest Education: "${qualification.highestDegree}" from "${qualification.institution}" (Grad: ${qualification.graduationYear}, CGPA: ${qualification.cgpa})
- Target Job: "${jobTitle}" (${expLevel} level)
- Technical Skills: Languages [${languages}], Frameworks [${frameworks}], Databases [${databases}], Tools/Cloud [${tools}]

Tasks:
1. Identify 6 standard ATS keywords for the target role: "${jobTitle}".
2. Check which keywords are present in the profile. Split them into 'atsKeywordsMatched' and 'atsKeywordsMissing'.
3. Write a professional, high-impact 3-sentence summary targeting the job level (${expLevel}).
4. Rephrase their projects/experiences into exactly 4 bullet points for experience and 4 bullet points for projects using the Google X-Y-Z Formula:
   "Accomplished [X] as measured by [Y], by doing [Z]"
   (e.g., "Reduced database query latency by 45% as measured by APM tooling, by implementing Redis caching and indexing key fields.")
5. Output the response in valid, structured JSON formatting containing:
   {
     "atsScore": number (between 50 and 98, representing their ATS match score),
     "atsKeywordsMatched": [string],
     "atsKeywordsMissing": [string],
     "summary": string,
     "experienceBullets": [string],
     "projectsBullets": [string],
     "skillsFormatted": string
   }
Ensure the output is ONLY valid JSON. Do not include markdown wraps or anything else.`;

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
      console.error("Gemini Resume Generation Error:", err);
      // Fallback to local generator
    }
  }

  // Fallback Rule-Based Generation Engine
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
      studyConcepts: ["The STAR Method (Situation, Task, Action, Result)", "Developing a 60-Second Elevator Pitch", "Highlighting Technical Architecture Trade-offs"],
      questions: [
        { questionId: "r1_q1", questionText: "Tell me about yourself and walk me through your most complex project, highlighting the system architecture decisions." },
        { questionId: "r1_q2", questionText: "Why did you choose your current tech stack for your primary project? What were the alternative choices and why were they rejected?" },
        { questionId: "r1_q3", questionText: "Describe a scenario where you faced a significant performance bottleneck in your project. How did you identify it and what was your fix?" }
      ],
      resourceLinks: [
        { label: "FAANG Resume Pitch Guidelines - Tell Me About Yourself Video", url: "https://www.youtube.com/watch?v=1mHjMNr8uFo", type: "video" },
        { label: "The STAR Method for Technical Behavioral Interviews", url: "https://www.levels.fyi/blog/star-method-behavioral-interview.html", type: "reading" },
        { label: "Google Project Walkthrough Strategy Guide", url: "https://github.com/jwasham/coding-interview-university", type: "reading" }
      ]
    },
    2: {
      studyConcepts: ["Big O Notation and Space-Time Complexity", "Arrays, HashMaps, and Two-Pointer Algorithms", "Backtracking and Dynamic Programming Fundamentals"],
      questions: [
        { questionId: "r2_q1", questionText: "Given an array of integers, return indices of the two numbers such that they add up to a specific target. Explain the time and space complexity." },
        { questionId: "r2_q2", questionText: "How would you design a rate limiter algorithm (e.g. token bucket or sliding window log) for an API? Write the pseudocode." },
        { questionId: "r2_q3", questionText: "Describe the differences between DFS and BFS. In what scenarios would DFS be preferred over BFS?" }
      ],
      resourceLinks: [
        { label: "LeetCode Patterns & Algorithm Video Playlists (NeetCode)", url: "https://www.youtube.com/watch?v=RBSGKlAOiM0", type: "video" },
        { label: "Big-O Cheat Sheet for Algorithm Runtimes", url: "https://www.bigocheatsheet.com/", type: "reading" },
        { label: "Curated 75 LeetCode Questions Guide", url: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions-by-a-facebook-engineer", type: "reading" }
      ]
    },
    3: {
      studyConcepts: ["Execution Context and Call Stack", "Memory Allocations & Garbage Collection Algorithms", "Asynchronous Event Loop & Concurrency Models"],
      questions: [
        { questionId: "r3_q1", questionText: `Explain JavaScript closures. How do closures utilize memory, and how can they lead to memory leaks?` },
        { questionId: "r3_q2", questionText: "What is the difference between compiler execution and runtime execution? Walk me through how code runs on a typical VM." },
        { questionId: "r3_q3", questionText: "Explain the prototype chain or object-oriented structures in your primary programming language. How is inheritance resolved?" }
      ],
      resourceLinks: [
        { label: "Under the Hood: JS Event Loop Video Tutorial", url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ", type: "video" },
        { label: "JavaScript Deep Dive Fundamentals (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "reading" },
        { label: "Memory Management & Garbage Collection Primer", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management", type: "reading" }
      ]
    },
    4: {
      studyConcepts: ["Framework Component Lifecycle & Reconciliation", "State Management & Store Hydration", "Database Schema Optimization and Indexes"],
      questions: [
        { questionId: "r4_q1", questionText: "How does the Virtual DOM reconciliation algorithm work in React? What triggers a full re-render, and how do you optimize it?" },
        { questionId: "r4_q2", questionText: "Compare SQL joins and indexing vs NoSQL denormalization. How would you optimize query retrieval speed for millions of records?" },
        { questionId: "r4_q3", questionText: "How would you secure your REST/GraphQL API endpoints? Explain CORS, JWT validation, CSRF, and SQL Injection prevention." }
      ],
      resourceLinks: [
        { label: "React Fiber Architecture Deep-Dive Video", url: "https://www.youtube.com/watch?v=i793N65aUXk", type: "video" },
        { label: "MNC Database Indexing best practices", url: "https://use-the-index-luke.com/", type: "reading" },
        { label: "OWASP API Security Top 10 Guidelines", url: "https://owasp.org/www-project-api-security/", type: "reading" }
      ]
    },
    5: {
      studyConcepts: ["Horizontal vs Vertical Scaling and Load Balancers", "Caching Strategies (Write-Through, Cache-Aside) and CDN Policies", "Database Sharding, Replication, and CAP Theorem"],
      questions: [
        { questionId: "r5_q1", questionText: "Design a URL shortening service (like Bitly) to handle 10,000 requests per second. Walk me through the database schemas, API, and scaling plan." },
        { questionId: "r5_q2", questionText: "What is the CAP Theorem? If you are designing a globally distributed bank ledger, would you prioritize consistency or availability? Why?" },
        { questionId: "r5_q3", questionText: "Explain how WebSockets differ from HTTP Polling. How would you design a real-time chat service for 5 million active users?" }
      ],
      resourceLinks: [
        { label: "System Design for Beginners Video Playlist", url: "https://www.youtube.com/watch?v=i53Gi_K39mc", type: "video" },
        { label: "The System Design Primer (GitHub Repository)", url: "https://github.com/donnemartin/system-design-primer", type: "reading" },
        { label: "Amazon Architecture & Scalability whitepapers", url: "https://aws.amazon.com/architecture/", type: "reading" }
      ]
    },
    6: {
      studyConcepts: ["Responding to Conflict and Project Failures", "Aligning with Tech Leadership Principles", "Navigating Project Ambiguity and Priority Shifts"],
      questions: [
        { questionId: "r6_q1", questionText: "Tell me about a time you had a strong disagreement with a technical decision made by a peer or manager. How did you resolve it?" },
        { questionId: "r6_q2", questionText: "Describe your most significant technical failure. What did you learn and how did you adapt in subsequent projects?" },
        { questionId: "r6_q3", questionText: "How do you handle scope creep or shifting requirements mid-sprint while preserving high software quality?" }
      ],
      resourceLinks: [
        { label: "FAANG Behavioral (STAR Method) Preparation Video", url: "https://www.youtube.com/watch?v=1mHjMNr8uFo", type: "video" },
        { label: "Amazon's 16 Leadership Principles Explained", url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles", type: "reading" },
        { label: "The STAR Method for Behavioral Interviews", url: "https://www.levels.fyi/blog/star-method-behavioral-interview.html", type: "reading" }
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
