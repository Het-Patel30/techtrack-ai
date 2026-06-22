<div align="center">

# 🚀 TechTrack AI
### AI-Powered MNC Interview Preparation Suite

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_1.5_Flash-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**TechTrack AI** is a full-stack web application that takes candidates from zero to FAANG-ready — complete profile builder → ATS-optimised resume → 6-round AI mock interview track with scoring, analytics, and verified study resources.

[Live Demo](#) · [Report Bug](https://github.com/Het-Patel30/techtrack-ai/issues) · [Request Feature](https://github.com/Het-Patel30/techtrack-ai/issues)

</div>

---

## 📸 Screenshots

### 🏠 Dashboard — Interview Readiness Overview
![Dashboard](./docs/screenshots/dashboard.png)

> Real-time ATS score gauge, 6-round interview tracker, readiness checklist, and quick-action cards — all on one screen.

---

### 📝 ATS Resume Builder
![Resume Builder](./docs/screenshots/resume_builder.png)

> AI-generated X-Y-Z impact bullets, ATS keyword matching, skill pill badges, and one-click export to PDF / Word / Plain Text.

---

### 🎓 6-Round Technical Interview Guide
![Interview Guide](./docs/screenshots/interview_guide.png)

> Countdown timer per question, expandable hints, curated study resources (verified YouTube links), and AI-evaluated mock answers with scores.

---

### 🔐 Auth & Candidate Profile
![Auth and Profile](./docs/screenshots/auth_and_profile.png)

> JWT-based sign-up/login and a 6-step profile form capturing personal info, education, target role, technical skills, work experience, and projects.

---

## ✨ Features

### 🏠 Premium Dashboard
- **ATS Score Gauge** — circular progress ring with colour-coded verdict (Strong Match / Hire / Needs Work)
- **Interview Round Tracker** — live status for all 6 rounds (Locked / Ready / Active / Completed)
- **Readiness Checklist** — 8-item auto-checking list that tracks your preparation milestones
- **Quick Action Cards** — instant deep-links to Profile, Resume, Interview Guide, and Analytics
- **Dark / Light Mode** — anti-FOUC toggle with localStorage persistence

### 📋 6-Step Candidate Profile Form
| Step | Fields |
|------|--------|
| 1. Personal Info | Name, Email, Phone, LinkedIn, GitHub, Portfolio |
| 2. Education | Degree, Institution, Graduation Year, CGPA, Coursework |
| 3. Target Job | Job Title, Experience Level, Company Type |
| 4. Technical Skills | Languages, Frameworks, Databases, Tools/Cloud, Soft Skills |
| 5. Work Experience | Structured entries (Role, Company, Dates, Bullets) or raw-text paste |
| 6. Projects & Certs | Project name + tech stack + description, Certifications, Achievements |

### 📄 ATS Resume Builder
- **Gemini AI generation** using the Google X-Y-Z formula: *"Accomplished X as measured by Y, by doing Z"*
- **ATS keyword analysis** — matched vs missing keywords colour-coded
- **Technical skills section** — pill badges on screen, clean plain text for ATS/PDF
- **Multi-format download:**
  - 📥 **PDF** — `html2pdf.js`, A4 format, print-optimised CSS
  - 📝 **Word (.doc)** — MSOffice XML-compatible HTML blob
  - 📋 **Plain Text (.txt)** — structured ASCII-delimited ATS format
  - 🖨️ **Print** — browser print dialog with A4 print CSS

### 🎓 6-Round Interview Guide
| Round | Focus Area | Resources |
|-------|-----------|-----------|
| 1 | Resume & Profile Screening | Jeff Su (STAR method), CS Dojo, Levels.fyi |
| 2 | Online Assessment & Core Coding | NeetCode Two Sum, Back To Back SWE (DP), BigO Cheat Sheet |
| 3 | Technical Fundamentals | Philip Roberts (Event Loop), Fireship (Closures), MDN |
| 4 | Deep-Dive Frameworks | Fireship React Fiber, Use The Index Luke, OWASP |
| 5 | System Design & Scalability | ByteByteGo, Gaurav Sen (Consistent Hashing), System Design Primer |
| 6 | Behavioral & HR | Jeff Su STAR, TechLead, Amazon Leadership Principles |

**Interactive features per question:**
- ⏱️ **Countdown Timer** — 5 min for coding rounds, 4 min for others (Start / Pause / Reset)
- 💡 **Hint System** — expandable round-specific strategy tip per question
- 📝 **Per-Round Notes** — auto-saves to backend (1.5s debounce)
- 🤖 **AI Evaluation** — Gemini scores each answer 1-10 with detailed critique
- 📊 **Performance Analytics** — score bars by round, individual Q scores, distribution breakdown
- 🔄 **Reset Progress** — confirmation modal to restart all 6 rounds

### 📊 Performance Analytics
- Average score by round (bar chart)
- Individual question scores
- Distribution: Exceptional (9-10) / Strong Hire (7-8) / Hire (5-6) / Needs Work (1-4)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide React |
| **State** | React Context (ThemeContext), useState / useEffect / useRef |
| **Backend** | Node.js 18+, Express.js, JWT, Bcrypt |
| **AI** | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| **Database** | MongoDB + Mongoose (primary) / Local JSON file (fallback) |
| **PDF Export** | html2pdf.js (CDN), Print CSS |
| **Deployment** | Docker multi-stage build, Google Cloud Run |

---

## 📁 Project Structure

```
techtrack-ai/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── models/
│   │   └── db.js                # Mongoose schemas + local JSON fallback DB
│   ├── routes/
│   │   ├── auth.js              # POST /register, /login, GET /me
│   │   ├── profile.js           # GET/POST /profile (6-step multi-array data)
│   │   ├── resume.js            # POST /resume/generate, GET /resume
│   │   └── interview.js         # GET/POST /interview, init-round, submit-answer,
│   │                            #   PATCH /notes/:roundNum, DELETE /reset
│   ├── services/
│   │   └── gemini.js            # Gemini AI client + rule-based fallback engine
│   ├── data/
│   │   └── db_local_backup.json # Auto-created local JSON database
│   ├── server.js                # Express app entry point (port 8080)
│   └── .env.example             # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx             # Login / Register UI
│   │   │   ├── ThemeToggle.jsx      # Dark/Light mode toggle
│   │   │   ├── MultiStepForm.jsx    # 6-step candidate profile form
│   │   │   ├── ResumeViewer.jsx     # ATS resume renderer + download engine
│   │   │   ├── InterviewTrack.jsx   # 6-round interview guide (timer, hints, notes)
│   │   │   └── DashboardStats.jsx   # KPI metric cards with circular rings
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     # Global dark/light theme provider
│   │   ├── App.jsx                  # Main app shell + tab routing + dashboard
│   │   ├── index.css                # Global styles + print media queries
│   │   └── main.jsx                 # React entry point
│   ├── index.html                   # Anti-FOUC theme script + html2pdf CDN
│   ├── vite.config.js               # Vite + /api proxy to :8080
│   └── tailwind.config.js
├── docs/
│   └── screenshots/                 # App screenshots for README
├── Dockerfile                       # Multi-stage Docker build
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9+
- (Optional) **MongoDB** URI for persistent storage
- (Optional) **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Het-Patel30/techtrack-ai.git
cd techtrack-ai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create your environment file
copy .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=8080
JWT_SECRET=your_super_secret_jwt_key_here

# Optional — leave blank to use local JSON DB fallback
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/techtrack

# Optional — leave blank to use rule-based fallback AI
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:
```bash
npm run dev          # Development (nodemon auto-reload)
# or
npm start            # Production
```
> Backend runs at `http://localhost:8080`

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173` — Vite proxies `/api/*` → `http://localhost:8080`

### 4. Open the App
Navigate to **http://localhost:5173**, register an account, and start building your interview readiness!

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET`  | `/api/auth/me` | Get current user info |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/profile` | Fetch saved profile |
| `POST` | `/api/profile` | Save/update full profile |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/generate` | AI-generate resume from profile |
| `GET`  | `/api/resume` | Fetch latest saved resume |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/interview` | Get interview progress |
| `POST` | `/api/interview/init-round/:roundNum` | Generate materials for a round |
| `POST` | `/api/interview/submit-answer` | Submit + AI-evaluate an answer |
| `PATCH`| `/api/interview/notes/:roundNum` | Save round notes |
| `DELETE`| `/api/interview/reset` | Wipe all progress (restart) |

All protected endpoints require: `Authorization: Bearer <token>`

---

## 🤖 AI Engine

TechTrack AI uses **Google Gemini 1.5 Flash** for three tasks:

1. **Resume Generation** — Analyses profile (skills, experience, projects, certs) and generates:
   - ATS keyword matching with score (50–98)
   - 3-sentence professional summary
   - 4 X-Y-Z achievement bullets for experience
   - 4 X-Y-Z project bullets
   - Formatted skills string

2. **Interview Round Generation** — Creates per-round:
   - 4 core competency concepts
   - 4 role-appropriate mock questions
   - 4 curated resources (mix of videos + articles)

3. **Answer Evaluation** — Scores each mock answer 1-10 with detailed MNC-level critique covering accuracy, structure (STAR/algorithmic), communication, and trade-off analysis.

> **No API Key?** The system automatically falls back to a comprehensive rule-based engine with 24 pre-written questions, verified study resources, and a heuristic scoring model.

---

## 🐳 Docker & Cloud Run Deployment

### Build Docker Image
```bash
# From project root
docker build -t techtrack-ai .
docker run -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e MONGO_URI=your_mongo_uri \
  -e JWT_SECRET=your_secret \
  techtrack-ai
```

### Deploy to Google Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/techtrack-ai:latest

# Deploy
gcloud run deploy techtrack-ai \
  --image gcr.io/YOUR_PROJECT_ID/techtrack-ai:latest \
  --platform managed \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY,MONGO_URI=YOUR_URI,JWT_SECRET=YOUR_SECRET
```

---

## 🗺️ Roadmap

- [ ] Upload existing PDF resume for ATS parsing
- [ ] Company-specific question banks (Google, Amazon, Microsoft)
- [ ] Mock interview with audio/video recording
- [ ] Peer review — share answers with other candidates
- [ ] LeetCode/HackerRank sync for coding progress tracking
- [ ] AI-generated model answers after submission

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Het Patel**  
[![GitHub](https://img.shields.io/badge/GitHub-Het--Patel30-181717?logo=github)](https://github.com/Het-Patel30)

---

<div align="center">

Made with ❤️ and ☕ · Powered by **Google Gemini AI**

⭐ **Star this repo if TechTrack AI helped you land your dream job!** ⭐

</div>
