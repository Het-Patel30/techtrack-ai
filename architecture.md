# System Architecture & Technical Specifications

This document outlines the detailed system design, schemas, API contracts, and AI prompts implemented in the **TechTrack AI - Interview Guide & Resume Builder** application.

---

## 1. Directory Structure

```
d:/Interview guide and Resume Generator/
├── backend/
│   ├── config/
│   │   └── db.js            # Mongoose connection
│   ├── middleware/
│   │   └── auth.js          # JWT auth validation middleware
│   ├── models/
│   │   └── db.js            # Unified DB models with Mongoose & JSON fallback
│   ├── routes/
│   │   ├── auth.js          # Auth routing (signup, login, verification)
│   │   ├── profile.js       # Profile management endpoints
│   │   ├── resume.js        # AI resume parsing & generation
│   │   └── interview.js     # 6-round technical mock questions
│   ├── services/
│   │   └── gemini.js        # Gemini API client & fallback generator
│   └── server.js            # Entry point for Express API & static client hosting
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx             # User Login / Sign Up UI
│   │   │   ├── ThemeToggle.jsx      # Dark/Light mode selector
│   │   │   ├── MultiStepForm.jsx    # Multi-Step Candidate Form
│   │   │   ├── ResumeViewer.jsx     # ATS resume renderer & print engine
│   │   │   ├── InterviewTrack.jsx   # Gamified 6-Round interview guide
│   │   │   └── DashboardStats.jsx   # Dashboard KPI metric cards
│   │   ├── App.jsx                  # State synchronization & routing
│   │   ├── index.css                # Zinc global styles
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── Dockerfile               # Multi-stage production container setup
└── README.md                # Deployment and running guide
```

---

## 2. Database Models (MongoDB / JSON fallback)

### User Model
Stores candidate credential and authentication details:
- `_id`: String / ObjectId (Unique Identifier)
- `username`: String (Candidate Full Name)
- `email`: String (Unique login credential)
- `password`: String (Bcrypt hashed password hash)
- `createdAt`: Date

### Profile Model
Contains candidate profile fields divided into four core areas:
- `user`: Reference (User ID)
- `personalInfo`:
  - `fullName`, `email`, `phone`, `linkedin`, `github`, `portfolio`
- `qualification`:
  - `highestDegree`, `institution`, `graduationYear`, `cgpa`, `coursework` (Array of Strings)
- `targetJob`:
  - `jobTitle` (e.g. MERN Stack Developer), `experienceLevel` (Entry / Mid / Senior), `targetCompanyType`
- `technicalSkills`:
  - `languages`, `frameworks`, `databases`, `toolsCloud`, `softSkills` (Arrays of Strings)

### Resume Model
Stores generated achievements, score summaries, and matching ATS keywords:
- `user`: Reference (User ID)
- `atsScore`: Number (Match rating percentage 0-100)
- `atsKeywordsMatched`: Array of Strings
- `atsKeywordsMissing`: Array of Strings
- `summary`: String (AI professional pitch summary)
- `experienceBullets`: Array of Strings (Formatted in Google X-Y-Z formula)
- `projectsBullets`: Array of Strings (Formatted in Google X-Y-Z formula)
- `skillsFormatted`: String
- `generatedAt`: Date

### InterviewProgress Model
Tracks candidate progression across 6 chronological rounds:
- `user`: Reference (User ID)
- `currentRound`: Number (Active round 1-6)
- `rounds`: Array of Objects:
  - `roundNumber`: Number (1 to 6)
  - `roundName`: String
  - `status`: String (Locked, Pending, Active, Completed)
  - `studyConcepts`: Array of Strings (Core competencies to study)
  - `questions`: Array of Objects:
    - `questionId`: String
    - `questionText`: String
    - `userAnswer`: String
    - `feedback`: String (AI mock answer critique)
    - `score`: Number (1 to 10 evaluation score)
    - `isAnswered`: Boolean
  - `resourceLinks`: Array of Objects:
    - `label`: String
    - `url`: String
    - `type`: String (video, reading)

---

## 3. Endpoints & REST API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | No | Creates a new user account, returns JWT |
| `POST` | `/api/auth/login` | No | Authenticates credentials, returns JWT |
| `GET` | `/api/auth/me` | Yes | Retrieves user info from JWT session |
| `GET` | `/api/profile` | Yes | Fetches the saved candidate profile |
| `POST` | `/api/profile` | Yes | Saves or updates candidate profile details |
| `GET` | `/api/resume` | Yes | Fetches the generated ATS resume |
| `POST` | `/api/resume/generate` | Yes | Invokes AI Agent to build ATS resume |
| `GET` | `/api/interview` | Yes | Fetches current 6-round progress overview |
| `POST` | `/api/interview/init-round/:num` | Yes | Unlocks study resources and mock questions for a round |
| `POST` | `/api/interview/submit-answer` | Yes | Evaluates mock answers and unlocks subsequent rounds |

---

## 4. AI Engine Prompts

### ATS Resume Generation
- **Role:** Professional ATS Recruiter and Technical Resume Writer.
- **Input:** Candidate Profile details.
- **Rules:** Match industry keywords for target title; write X-Y-Z formula achievements ("Accomplished X as measured by Y, by doing Z").
- **Output Schema:** JSON format mapping summary, bullet lists, matching keywords, and ATS scores.

### Interview Preparation Materials
- **Role:** Technical Interview Coach and Bar Raiser from a FAANG-tier MNC.
- **Input:** Target role, experience level, skill tags, and round criteria.
- **Output Schema:** JSON mapping 3-4 study concepts, 3 realistic technical mock questions, and 3 resources (including at least one video content and two reading materials).

### Response Critique and Scoring
- **Role:** Senior Tech Lead and Interviewer.
- **Input:** Target role, question text, and candidate's answer.
- **Rules:** Critique logic, architectural trade-offs, STAR formatting, and assign a score out of 10.
